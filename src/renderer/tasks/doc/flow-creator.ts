import { Observable } from 'rxjs';
import { Task } from '../../types/ITask';
import {Module, ModuleFunction} from "../../types/Module";
import {streamChat} from "../../utils/ModelCall";


export class FlowCreator extends Task {


    id(): string {
        return "FlowCreator";
    }

    name(): string {
        return this.translate('FlowCreator.name');
    }

    dependencies(): string[] {
        return ['RequirementsAnalyst'];
    }

    execute(): Observable<string> {
        return new Observable<string>((observer) => {
            (async () => {
                try {
                    observer.next("\n开始生成流程图");
                    const modules: string[] = await this.getModules();
                    for (const module of modules) {
                        observer.next(`\n开始设计[${module}]流程`);
                        const prd = await this.readResult('modules/' + module + '/prd.txt')


                            const sysPrompt = await this.readPrompt('flow.txt');

                            const response = await streamChat(sysPrompt, prd);
                            let apiResult = '';

                            for await (const content of response) {
                                apiResult += content;
                                observer.next(content);
                            }

                            const resultFileName = `modules/${module}/flow.txt`;
                            await this.writeResult(resultFileName, apiResult);
                            await this.writeProjectResult(resultFileName, apiResult);

                    }

                    observer.next("\n流程图完成");
                    observer.complete();

                } catch (error) {
                    observer.error(error);
                    observer.next("\n流程图设计出错");
                } finally {
                    // Update mind progress to 100 is specific to the application and might need adaptation.
                    // As there is no direct equivalent given in conversion rules.
                }
            })();
        });
    }
}