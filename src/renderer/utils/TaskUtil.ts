import {forkJoin, mergeMap, Observable, Observer, shareReplay} from "rxjs";
import {useVueFlow} from "@vue-flow/core";
import { useTaskStore } from '../stores/useTaskStore'

export function extractCode (text: string): string | null {
    const regex = /```(?:\w+)?\n(.*?)```/s;  // (?s) 等价于 /s 标志，允许 . 匹配换行符
    const match = text.match(regex);
    return match ? match[1] : text;
}

export async function executeChildrenTasks(
    children: ITask[],
    observer: Observer<any>,

): Promise<void> {
    console.log(children)
    const completed = useTaskStore();
     const taskResults = new Map<string, Observable<{ name: string; output: string }>>();
    const { findNode } = useVueFlow({id:"test"})
    const updateTaskStatus = (taskName: string, status: string) => {
        const graphNode = findNode(taskName);
        // console.log("更新子任务状态",taskName,graphNode);
        if (graphNode) {
            graphNode.data.status = status;
        }
    };
    const executeTask = (task: ITask): Observable<{ name: string; output: string }> => {
        console.log(new Date(),"执行子任务",task.id())
        if (taskResults.has(task.id())) {
            return taskResults.get(task.id())!;
        }


        let execution$: Observable<{ name: string; output: string }>;

        if (task.dependencies().every(dep => completed.has(dep))) {
            execution$ = new Observable<{ name: string; output: string }>(sub => {
                updateTaskStatus(task.id(), "running")
                task.execute().subscribe({
                    next: output => {

                        observer.next(output); // 转发给父任务的 observer
                        sub.next(output);
                    },
                    complete: () => {
                        completed.add(task.id());
                        sub.complete();
                        updateTaskStatus(task.id(), "completed")
                    },
                    error: err => {
                        console.error(`Child task ${task.id()} failed:`, err);
                        updateTaskStatus(task.id(), "failed")
                        observer.error(err); // 直接抛出
                    }
                });
            }).pipe(shareReplay(1));
        } else {
            const dependencies$ = forkJoin(
                task.dependencies()
                    .filter(dep => !completed.has(dep))
                    .map(dep => executeTask(children.find(t => t.id() === dep)!))
            );

            execution$ = dependencies$.pipe(
                mergeMap(() => new Observable<{ name: string; output: string }>(sub => {
                    updateTaskStatus(task.id(), "running")

                    task.execute().subscribe({
                        next: output => {

                            observer.next(output);
                            sub.next(output);
                        },
                        complete: () => {
                            completed.add(task.id());
                            sub.complete();
                            updateTaskStatus(task.id(), "completed")
                        },
                        error: err => {

                            updateTaskStatus(task.id(), "failed")

                            console.error(`Child task ${task.id()} failed:`, err);
                            observer.error(err);
                        }
                    });
                }))
            ).pipe(shareReplay(1));
        }

        taskResults.set(task.id(), execution$);
        return execution$;
    };

    try {
        const allExecutions = children.map(child => executeTask(child));
        await forkJoin(allExecutions).toPromise(); // 等所有子任务完成

    } catch (err) {
        observer.error(err);
    }
}

