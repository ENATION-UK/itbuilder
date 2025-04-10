import {Task} from "../types/ITask";
import {Observable} from "rxjs";
// eslint-disable-next-line import/no-unresolved
import {Subscriber} from "rxjs/internal/Subscriber";
import {Module, ModuleFunction} from "../types/Module";
import {streamChat} from "../utils/ModelCall";
import {CodeWrite} from "./children/code-write";
import {CodeReview} from "./children/code-review";
import {ProjectReview} from "./children/project-review";

export class ApiDeveloper extends Task {

    id(): string {
        return "ApiDeveloper"
    }

    name(): string {
        return this.translate('ApiDeveloper.name');
    }

    private children: ITask[] = [new CodeWrite(), new CodeReview(), new ProjectReview()];

    dependencies(): string[] {
        return ['RequirementsAnalyst', 'DefiningStandards', 'DatabaseDesign', 'ApiDesign']
    }

    private executeChild(observer: Subscriber<string>, index = 0): Promise<void> {
        return new Promise((resolve, reject) => {
            if (index >= this.children.length) {
                resolve();
                return;
            }
            const child = this.children[index];
            child.setRequirement(this.requirement);
            const childObservable = child.execute();
            const childSubscription = childObservable.subscribe({
                next: (log: string) => {
                    observer.next(log);
                },
                error: (err: Error) => {
                    childSubscription.unsubscribe();
                    this.executeChild(observer, index + 1).then(resolve).catch(reject);
                    reject(err);
                },
                complete: () => {
                    childSubscription.unsubscribe();
                    this.executeChild(observer, index + 1).then(resolve).catch(reject);
                }
            });
        });
    }

    execute(): Observable<string> {
        return new Observable<string>((observer) => {
            (async () => {

                observer.next("\n开始API代码编写");

                const modules = await this.getModules();
                for (const module of modules) {
                    this.requirement.module = module;
                    try {
                        await this.executeChild(observer);
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