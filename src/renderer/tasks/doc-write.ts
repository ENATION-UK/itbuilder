import {Task} from "../types/ITask";
import {Observable} from "rxjs";
import {MindCreator} from "./doc/mind-creator";
import {FlowCreator} from "./doc/flow-creator";
import {executeChildrenTasks} from "../utils/TaskUtil";


export class DocWrite extends Task {

    id(): string {
        return "DocWrite"
    }

    name(): string {
        return this.translate('DocWrite.name');
    }


    dependencies(): string[] {
        return ['RequirementsAnalyst']
    }

    isGroup(): boolean {
        return true;
    }

    children(): ITask[] {
        return [new MindCreator(),new FlowCreator()];
    }

    execute(): Observable<string> {
        return new Observable<string>((observer) => {
            (async () => {
                try {
                    observer.next("\n开始书写文档");
                    const tasks = this.children();
                    tasks.forEach((task) => {
                        task.setRequirement(this.requirement);
                    });
                    await executeChildrenTasks(tasks, observer);

                    observer.next("\n文档书写完成");
                    observer.complete();

                } catch (error) {
                    observer.error(error);
                    observer.next("\n文档书写出错");
                } finally {
                    // 更新进度至100%
                }
            })();
        });
    }

}