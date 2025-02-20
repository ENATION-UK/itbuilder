import {Task} from "../types/ITask";
import {Observable} from "rxjs";

export class ApiDesign extends Task {
    id(): string {
        return "ApiDesign"
    }
    name(): string {
        return this.i18n.t('ApiDesign.name');

    }

    dependencies(): string[] {
        return ['RequirementsAnalyst', 'DatabaseDesign']
    }


    execute(): Observable<string> {

        return new Observable<string>((observer) => {
            (async () => {
                try {

                    observer.next("\n开始API设计");

                    const sysPrompt = await this.readPrompt('api-design.txt');
                    const ddl = await this.readResult('ddl.txt');
                    const requirement = await this.readResult('req-analysis.txt');

                    let apiResult = '';
                    const  userInput = requirement+ "\n # 数据库结构\n" + ddl;

                    const response = await this.streamChat(sysPrompt, userInput);

                    for await (const content of response) {
                        apiResult += content;
                        observer.next(content);
                    }

                    await this.writeResult('api-design.txt', apiResult);


                    observer.next("\napi设计完成");
                    observer.complete();

                } catch (error) {
                    observer.error(error);
                }
            })();
        });
    }

}