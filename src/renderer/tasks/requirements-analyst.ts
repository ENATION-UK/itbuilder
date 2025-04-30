import { Task } from "../types/ITask";
import {  Observable } from "rxjs";
import {chat} from "../utils/ModelCall";
import {streamChat} from "../utils/ModelCall";
import {Module, ModuleFunction} from "../types/Module";
import {ElectronAPI} from "../utils/electron-api";


export class RequirementsAnalyst extends Task {
    id(): string {
        return "RequirementsAnalyst"
    }
    name(): string {
        return this.translate('RequirementsAnalyst.name');
    }


    execute(): Observable<string> {

        return new Observable<string>((observer) => {
            (async () => {
                try {

                    observer.next("\n开始需求分析");


                    const userReq = await this.readResult('text-requirement.txt');
                    const sysPrompt = await this.readPrompt('req-analysis.txt');

                    //分析需求,输出为prd
                    let analysisResult = '';
                    const response = await streamChat(sysPrompt, userReq);
                    for await (const content of response) {
                        analysisResult += content;
                        observer.next(content);
                    }

                    await this.writeResult('prd.txt', analysisResult);
                    await this.writeProjectResult('prd.txt', analysisResult);

                    // const analysisResult = await this.readResult('prd.txt');
                    //把需求汇总出模块
                    const moduleSummaryPrompt = await this.readPrompt('module_summary.txt');

                    let moduleArray = await chat(moduleSummaryPrompt, analysisResult);
                    moduleArray= this.extractCode(moduleArray)
                    const modules:string[] = JSON.parse(moduleArray);


                    const textPickPrompt = await this.readPrompt('text-pick.txt');

                    for (const module of modules) {
                            const moduleFolderPath = await ElectronAPI.pathJoin(this.requirement.projectName,"generation",this.requirement.id,"modules",module);
                            await ElectronAPI.createUserFolder(moduleFolderPath)

                            //项目中写一份
                            const moduleFolderPath1 = await ElectronAPI.pathJoin(this.requirement.projectName,"modules",module);
                            await ElectronAPI.createUserFolder(moduleFolderPath1)

                            const prdText = await chat(textPickPrompt, analysisResult+'\n# 提取模块:'+ module);

                            //项目中写一份
                            await ElectronAPI.writeUserFile(moduleFolderPath + '/prd.txt', prdText)
                            await ElectronAPI.writeUserFile(moduleFolderPath1 + '/prd.txt', prdText)

                    }



                    observer.complete();

                } catch (error) {
                    observer.error(error);
                }
            })();
        });
    }

}