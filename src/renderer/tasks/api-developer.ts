import {Task} from "../types/ITask";
import {Observable} from "rxjs";
// eslint-disable-next-line import/no-unresolved
import {Subscriber} from "rxjs/internal/Subscriber";

import {CodeWrite} from "./code/code-write";
import {CodeReview} from "./code/code-review";
import {ProjectReview} from "./code/project-review";
import {executeChildrenTasks} from "../utils/TaskUtil";

export class ApiDeveloper extends Task {

    id(): string {
        return "ApiDeveloper"
    }

    name(): string {
        return this.translate('ApiDeveloper.name');
    }


    dependencies(): string[] {
        return ['ProjectInit']
    }

    isGroup(): boolean {
        return true;
    }

    children(): ITask[] {
        return  [new CodeWrite(), new CodeReview(), new ProjectReview()];
    }


    execute(): Observable<string> {
        return new Observable<string>((observer) => {
            (async () => {

                observer.next("\n开始API代码编写");

                const modules = await this.getModules();
                for (const module of modules) {
                    this.requirement.module = module;
                    const tasks = this.children();
                    tasks.forEach((task) => {
                        task.setRequirement(this.requirement);
                    });
                    try {
                        await executeChildrenTasks(tasks, observer);
                    } catch (error) {
                        observer.error(error);
                    }
                }

                observer.next("\napi设计完成");
                observer.complete();

            })();
        });
    }

}