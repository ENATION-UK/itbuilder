import {Task} from "../types/ITask";
import {Observable} from "rxjs";
// eslint-disable-next-line import/no-unresolved
import {Subscriber} from "rxjs/internal/Subscriber";
import {Module,ModuleFunction} from "../types/Module";
import {streamChat} from "../utils/ModelCall";

export class ApiDeveloper extends Task {

    id(): string {
        return "ApiDeveloper"
    }
    name(): string {
        return this.translate('ApiDeveloper.name');
    }

    sysPrompt  ='';
    ddl='';
    apiDesign='';
    standard='';




    init: () => void = async () => {
        this.sysPrompt = await this.readPrompt('api-dev.txt');
        //这里输出不为空
        this.ddl = await this.readResult('ddl.txt');
        this.apiDesign = await this.readResult('api-design.txt');
        this.standard = await this.readResult('standard.txt');
    }



    dependencies(): string[] {
        return ['RequirementsAnalyst','DefiningStandards', 'DatabaseDesign', 'ApiDesign']
    }


    execute(): Observable<string> {

        return new Observable<string>((observer) => {
            (async () => {
                try {

                    observer.next("\n开始API代码编写");

                    await this.init();
                    //这里输出为空
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

                    //为每个模块生成api代码
                    for (const module of modules) {
                        if (module.moduleName=='用户管理模块') {
                            for (const func of module.functions) {
                                if (func.functionName=='用户注册与登录'){
                                    await this.generateCode(func, module.moduleName, observer);
                                }

                            }
                        }
                    }

                    observer.next("\napi设计完成");
                    observer.complete();

                } catch (error) {
                    observer.error(error);
                }
            })();
        });
    }

   async generateCode(
       func: ModuleFunction,
       moduleName: string,
       observer: Subscriber<string>
   ): Promise<void> {
        const functionDescription = func.functionDescription;
        const functionName = func.functionName;
        const userInteraction = func.userInteraction;

        observer.next(`\n开始生成模块${moduleName}-${functionName}的代码`)
        let prompt = "# 需求 \n";
        prompt += `\n\n## 模块名称: ${moduleName}`;
        prompt += `\n\n## 功能名称: ${functionName}`;
        prompt += `\n\n## 功能说明 \n${functionDescription}`;
        prompt += `\n\n## 操作体验 \n${userInteraction}`;
        prompt += `\n\n## 工程结构及包名、类名规范 \n${this.standard}`;
        prompt += `\n\n# api架构 \n${this.apiDesign}`;
        prompt += `\n\n# 数据库结构 \n${this.ddl}`;

       // await this.writeResult("p.txt", prompt);
        const response = await streamChat(this.sysPrompt, prompt);
        let codeResult = '';
        for await (const content of response) {
            codeResult += content;
            observer.next(content);
        }


        await this.writeResult("api/"+moduleName+"/api-" + functionName +  ".txt", codeResult);
       await this.writeCodes( codeResult )
    }
}