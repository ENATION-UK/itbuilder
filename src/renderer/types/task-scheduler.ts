import {forkJoin, merge, mergeMap, Observable, shareReplay} from "rxjs";
import {ElectronAPI} from "../utils/electron-api";
import type {ITaskGraph, TaskNode} from "./ITaskGraph";

export class TaskScheduler {
    private tasks = new Map<string, ITask>();
    private taskResults = new Map<string, Observable<{ name: string; output: string }>>();
    private completedTasks = new Set<string>(); // 存储已完成任务
    private readonly STATUS_FILE = "status.json";
    private taskGraph: ITaskGraph;

    constructor(tasks: ITask[], taskGraph: ITaskGraph) {
        tasks.forEach(task => this.tasks.set(task.id(), task));
        this.taskGraph = taskGraph;
    }

    findNode(taskName: string): TaskNode | undefined {
        return this.taskGraph.nodes.find((node) => node.id === taskName);

    }

    // 加载任务状态
    async loadTaskStatus(): Promise<void> {
        try {
            const exists = await ElectronAPI.userFileExists(this.STATUS_FILE);
            if (exists) {
                const content = await ElectronAPI.readUserFile(this.STATUS_FILE);
                const status: Record<string, string> = JSON.parse(content);

                // 记录已完成的任务
                for (const [taskName, state] of Object.entries(status)) {

                    this.updateNodeStatsu(taskName, state);
                    if (state === "completed") {
                        this.completedTasks.add(taskName);
                    }
                }
            }
        } catch (err) {
            console.error("Error reading status file:", err);
        }
    }

    updateNodeStatsu(taskName: string, status: string): void {
        const taskNode = this.findNode(taskName);
        if (taskNode) {
            taskNode.data.status = status;
        }
    }
    // 保存任务状态
    async saveTaskStatus(taskName: string, status: string): Promise<void> {
        try {
            this.updateNodeStatsu(taskName, status);

            const exists = await ElectronAPI.userFileExists(this.STATUS_FILE);
            let taskStatus: Record<string, string> = {};

            if (exists) {
                const content = await ElectronAPI.readUserFile(this.STATUS_FILE);
                taskStatus = JSON.parse(content);
            }

            taskStatus[taskName] = status; // 更新任务状态
            await ElectronAPI.writeUserFile(this.STATUS_FILE, JSON.stringify(taskStatus, null, 2));
        } catch (err) {
            console.error("Error saving task status:", err);
        }
    }

    // 执行所有任务（跳过已完成的任务）
    async run(): Promise<Observable<{ name: string; output: string }>> {
         const executionObservables: Observable<{ name: string; output: string }>[] = [];

        this.tasks.forEach(task => {
            if (!this.completedTasks.has(task.id())) {
                executionObservables.push(this.executeTask(task)); // 只执行未完成的任务
            }
        });

        return merge(...executionObservables);
    }

    // 执行单个任务
    private executeTask(task: ITask): Observable<{ name: string; output: string }> {
        if (this.taskResults.has(task.id())) {
            return this.taskResults.get(task.id())!;
        }

        this.updateNodeStatsu(task.id(), "running")

        let execution$: Observable<{ name: string; output: string }>;

        if (task.dependencies().every(dep => this.completedTasks.has(dep))) {
            // 依赖已完成，执行本任务
            execution$ = new Observable(observer => {
                task.execute().subscribe({
                    next: output => observer.next({name: task.id(), output}),
                    complete: async () => {
                        this.completedTasks.add(task.id());
                        await this.saveTaskStatus(task.id(), "completed");
                        observer.complete();
                    },
                    error: async err => {
                        console.error(`Task ${task.id()} failed:`, err);
                        await this.saveTaskStatus(task.id(), "failed");
                    }
                });
            }).pipe(shareReplay(1));  // 让 Observable 变成热的;
        } else {
            // 先执行所有依赖，再执行本任务
            const dependencies$: Observable<{ name: string; output: string }[]> = forkJoin(
                task.dependencies().map(depName => this.executeTask(this.tasks.get(depName)!))
            );

            execution$ = dependencies$.pipe(
                mergeMap(() =>
                    new Observable<{ name: string; output: string }>(observer => {
                        task.execute().subscribe({
                            next: output => observer.next({name: task.id(), output}),
                            complete: async () => {
                                this.completedTasks.add(task.id());
                                await this.saveTaskStatus(task.id(), "completed");
                                observer.complete();
                            },
                            error: async err => {
                                console.error(`Task ${task.id()} failed:`, err);
                                await this.saveTaskStatus(task.id(), "failed");
                            }
                        });
                    })
                )
            ).pipe(shareReplay(1));
        }

        this.taskResults.set(task.id(), execution$);
        return execution$;
    }
}