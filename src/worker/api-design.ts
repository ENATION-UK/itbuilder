import {Task} from "../types/ITask.ts";
import {Observable} from "rxjs";

export class ApiDesign extends Task {
    name(): string {
        return "ApiDesign"
    }

    dependencies(): string[] {
        return ['RequirementsAnalyst', 'DatabaseDesign']
    }


    execute(): Observable<string> {

        return new Observable<string>((observer) => {
            (async () => {
                try {

                    observer.next("\n开始API设计");

                    let sysPrompt = await this.readPrompt('api-design.txt');
                    let ddl = await this.readResult('ddl.txt');
                    let requirement = await this.readResult('req-analysis.txt');

                    let apiResult = '';
                    let  userInput = requirement+ "\n # 数据库结构\n" + ddl;

                    let response = await this.streamChat(sysPrompt, userInput);

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