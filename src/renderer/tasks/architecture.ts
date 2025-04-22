import {Task} from "../types/ITask";
import {Observable} from "rxjs";
import {ApiDesign} from "./architecture/api-design";
import {DatabaseDesign} from "./architecture/database-design";
import {DefiningStandards} from "./architecture/defining-standards";
import { executeChildrenTasks } from "../utils/TaskUtil";


export class Architecture extends Task {

    id(): string {
        return "Architecture"
    }

    name(): string {
        return this.translate('Architecture.name');
    }


    dependencies(): string[] {
        return ['RequirementsAnalyst']
    }

    isGroup(): boolean {
        return true;
    }

    children(): ITask[] {
        return [new DefiningStandards(),new DatabaseDesign(),new ApiDesign()];
    }

    execute(): Observable<string> {
        return new Observable<string>((observer) => {
            (async () => {
                try {
                    observer.next("\n开始架构");
                    const tasks = this.children();
                    tasks.forEach((task) => {
                        task.setRequirement(this.requirement);
                    });
                    await executeChildrenTasks(tasks, observer);

                    observer.next("\n架构完成");
                    observer.complete();

                } catch (error) {
                    observer.error(error);
                    observer.next("\n架构出错");
                } finally {
                    // 更新进度至100%
                }
            })();
        });
    }

}