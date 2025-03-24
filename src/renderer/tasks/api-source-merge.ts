import { Task } from "../types/ITask";
import { Observable } from "rxjs";

import {ElectronAPI} from "../utils/electron-api";
// eslint-disable-next-line import/no-unresolved
import {Subscriber} from "rxjs/internal/Subscriber";
import {streamChat} from "../utils/ModelCall";

export class ApiSourceMerge extends Task {
    id(): string {
        return "ApiSourceMerge";
    }

    name(): string {
        return this.translate('ApiSourceMerge.name');
    }

    dependencies(): string[] {
        return ['ApiDeveloper'];
    }

    execute(): Observable<string> {
        return new Observable<string>((observer) => {
            (async () => {
                try {
                    observer.next("\n开始代码合并");

                    const sysPrompt = await this.readPrompt('file-merge.txt');
                    const apiFolder = await ElectronAPI.pathJoin(this.requirement.projectName,"generation", this.requirement.id,"api");
                    const modules = await ElectronAPI.listUserFolder(apiFolder)

                    for (const module of modules) {

                        if (module.type == 'file') {
                            continue
                        }

                        const modulePath = await ElectronAPI.pathJoin(this.requirement.projectName,"generation", this.requirement.id,"api", module.name);
                        const files = await ElectronAPI.listUserFolder(modulePath);

                        try {
                            observer.next(`合并[${module}]...`);
                            await this.merge(sysPrompt, module, files,observer);
                            observer.next(`合并[${module}]成功`);
                        } catch (error) {
                            observer.next(`合并[${module}]失败`);
                            console.error(module, error);
                        }
                    }

                    observer.next("\n代码合并完成");
                    observer.complete();
                } catch (error) {
                    observer.error(error);
                }
            })();
        });
    }




    /**
     * 合并文件内容
     * @param sysPrompt 系统提示词
     * @param module 模块目录
     * @param files 文件数组
     * @param observer
     */
    private async merge(sysPrompt: string, module: FileInfo, files: FileInfo[],observer: Subscriber<string>): Promise<void> {
        if (files.length === 0) {
            return;
        }

        if (files.length === 1) {
            const file = files[0];
            if (!file.name.endsWith(".txt")) {
                return;
            }

            const content = await ElectronAPI.readFile(file.path);
            await this.writeResult(`api/${module}/merge.txt`,content)
            return;
        }

        let userInput = "";
        for (const file of files) {
            if (!file.name.endsWith(".txt")) {
                return;
            }
            const functionName = file.name.replace(".txt", "");
            userInput += `# ${functionName}\n\n`;
            const content = await ElectronAPI.readFile(file.path);
            userInput += content;
            userInput += "\n\n";
        }

        const response = await streamChat(sysPrompt, userInput);
        let mergedContent = "";
        for await (const content of response) {
            mergedContent += content;
            observer.next(content);
        }

        await this.writeResult(`api/${module.name}/merge.txt`,mergedContent)
    }

    protected temperature(): number {
        return 0.1;
    }
}