import {Task} from "../../types/ITask";
import {Observable} from "rxjs";
import {ElectronAPI} from "../../utils/electron-api";
// eslint-disable-next-line import/no-unresolved
import {Subscriber} from 'rxjs/internal/Subscriber';
import {chat} from "../../utils/ModelCall";

export class ApiSourceWriter extends Task {
    id(): string {
        return "ApiSourceWriter"
    }

    name(): string {
        return this.translate('ApiSourceWriter.name');
    }

    dependencies(): string[] {
        return ['ApiDeveloper', 'DefiningStandards', 'ApiSourceMerge']
    }

    execute(): Observable<string> {
        return new Observable<string>((observer) => {
            (async () => {
                try {

                    observer.next("\n开始写入工程");

                    const sysPrompt = await this.readPrompt('api-source.txt');
                    const projectStructure = await this.readResult('standard.txt');

                    const apiPath = await ElectronAPI.pathJoin(this.requirement.projectName, "generation",this.requirement.id, "api");
                    const files = await ElectronAPI.listUserFolder(apiPath);


                    for (const module of files) {
                        if (module.type == 'file') {
                            continue;
                        }

                        observer.next(`\n开始写入[${module.name}]`);

                        const mergeFilePath = await ElectronAPI.pathJoin(apiPath, module.name, 'merge.txt')

                        try {

                            if (await ElectronAPI.userFileExists(mergeFilePath)) {
                                await this.write(sysPrompt, projectStructure, module.name, observer);
                            }
                        } catch (e) {
                            console.error(e)
                            observer.error(`写入[${module.name}]出错`);
                        }

                    }
                    observer.next("\n工程写入完成");
                    observer.complete();

                } catch (error) {
                    observer.error(error);
                }
            })();
        });
    }


    private async write(sysPrompt: string, projectStructure: string, moduleName: string, observer: Subscriber<string>) {

        const mergeFilePath = await ElectronAPI.pathJoin("api", moduleName, 'merge.txt')
        const allCode = await this.readResult(mergeFilePath);
        const userInput = `${allCode}\n # 工程结构规范:\n${projectStructure}`;
        const response = await chat(sysPrompt, userInput);


        await this.writeResult(  await ElectronAPI.pathJoin(moduleName, 'codes.md'), response)

        const apiCodesJsonPath = await ElectronAPI.pathJoin(this.requirement.projectName , 'api-codes.json')

        // 读取现有的 api-codes.json 文件
        let moduleInfos: ModuleInfo[]= [];
        try {

            const content = await ElectronAPI.readUserFile(apiCodesJsonPath);
            moduleInfos = JSON.parse(content);
        } catch (error) {
            // 如果文件不存在或读取失败，使用空数组
            console.warn('无法读取 api-codes.json，使用空数组');
        }
        const codes = findCodesByModuleName(moduleInfos,moduleName);

        await this.writeCodes( response, async (item) => {
            const functionInfo = await this.codeAnalyst(item.content);
            functionInfo.path =  item.path
            codes.push(functionInfo)

            observer.next(`写入${item.path}`);
        })

        await ElectronAPI.writeUserFile(apiCodesJsonPath, JSON.stringify(moduleInfos, null, 2));

    }
}
function findCodesByModuleName(moduleInfoArray: ModuleInfo[],moduleName: string): FunctionInfo[] {
    let module = moduleInfoArray.find(item => item.moduleName === moduleName);
    if (!module) {
        module = {
            moduleName: moduleName,
            codes: []
        }
        moduleInfoArray.push(module)
    }
    return   module.codes ;
}


