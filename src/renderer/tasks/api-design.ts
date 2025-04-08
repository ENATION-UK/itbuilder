import {Task} from "../types/ITask";
import {Observable} from "rxjs";
import {streamChat} from "../utils/ModelCall";

export class ApiDesign extends Task {
    id(): string {
        return "ApiDesign"
    }

    name(): string {
        return this.translate('ApiDesign.name');

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

                    const modules = await this.getModules();
                    for (const module of modules) {
                        const prd = await this.readResult('modules/' + module + '/prd.txt')
                        const ddl = await this.readResult('modules/' + module + '/ddl.txt');
                        let apiResult = '';
                        const userInput = prd + "\n # 数据库结构\n" + ddl;

                        const response = await streamChat(sysPrompt, userInput);

                        for await (const content of response) {
                            apiResult += content;
                            observer.next(content);
                        }

                        await this.writeResult('modules/'+module+'/api-design.txt', apiResult);

                    }


                    observer.next("\napi设计完成");
                    observer.complete();

                } catch (error) {
                    observer.error(error);
                }
            })();
        });
    }

}