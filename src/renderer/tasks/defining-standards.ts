import {Task} from "../types/ITask";
import {Observable} from "rxjs";
import {streamChat} from "../utils/ModelCall";

export class DefiningStandards extends Task {


    id(): string {
        return "DefiningStandards"
    }

    name(): string {
        return this.translate('DefiningStandards.name');
    }

    dependencies(): string[] {
        return ['RequirementsAnalyst']
    }


    execute(): Observable<string> {

        return new Observable<string>((observer) => {
            (async () => {
                try {

                    observer.next("\n开始规范定义");

                    const sysPrompt = await this.readPrompt('standard.txt');
                    const requirement = await this.readResult('req-analysis.txt');

                    let standardResult = '';

                    const response = await streamChat(sysPrompt, requirement);

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