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

                    const requirement = await this.readResult('req-json.txt');
                    const jsonData = JSON.parse(requirement);

                    const modules: Module[] = jsonData.map((m: any) =>
                        new Module(
                            m.moduleName,
                            m.functions.map((f: any) =>
                                new ModuleFunction(f.functionName, f.functionDescription, f.userInteraction)
                            )
                        )
                    );


                    for (const module of modules) {
                        observer.next(`\n开始设计[${module.moduleName}]流程`);

                        for (const functionDef of module.functions) {
                            let reqText = `# ${module.moduleName}\n`;
                            reqText += functionDef.toDetail() + "\n";

                            const sysPrompt = await this.readPrompt('flow.txt');

                            const response = await streamChat(sysPrompt, reqText);
                            let apiResult = '';

                            for await (const content of response) {
                                apiResult += content;
                                observer.next(content);
                            }

                            const resultFileName = `flow/${module.moduleName}/${functionDef.functionName}.txt`;
                            await this.writeResult(resultFileName, apiResult);
                        }
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