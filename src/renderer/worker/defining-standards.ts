import {Task} from "../types/ITask.ts";
import {Observable} from "rxjs";

export class DefiningStandards extends Task {


    name(): string {
        return "DefiningStandards"
    }

    dependencies(): string[] {
        return ['RequirementsAnalyst']
    }


    execute(): Observable<string> {

        return new Observable<string>((observer) => {
            (async () => {
                try {

                    observer.next("\n开始规范定义");

                    let sysPrompt = await this.readPrompt('standard.txt');
                    let requirement = await this.readResult('req-analysis.txt');

                    let standardResult = '';

                    let response = await this.streamChat(sysPrompt, requirement);

                    for await (const content of response) {
                        standardResult += content;
                        observer.next(content);
                    }

                    await this.writeResult('standard.txt', standardResult);

                    observer.next("\napi设计完成");
                    observer.complete();

                } catch (error) {
                    observer.error(error);
                }
            })();
        });
    }

}