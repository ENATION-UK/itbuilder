import {Task} from "../types/ITask";
import {Observable} from "rxjs";
import {ElectronAPI} from "../utils/electron-api";
// eslint-disable-next-line import/no-unresolved
import {Subscriber} from 'rxjs/internal/Subscriber';

export class ApiSourceWriter extends Task {
    id(): string {
        return "ApiSourceWriter"
    }

    name(): string {
        return this.i18n.t('ApiSourceWriter.name');
    }

    dependencies(): string[] {
        return ['ApiDeveloper', 'DefiningStandards','ApiSourceMerge']
    }

    execute(): Observable<string> {
        return new Observable<string>((observer) => {
            (async () => {
                try {

                    observer.next("\n开始写入工程");

                    const sysPrompt = await this.readPrompt('api-source.txt');
                    const projectStructure = await this.readResult('standard.txt');

                    const files = await ElectronAPI.listUserFolder("api");


                    for (const module of files) {
                        if (module.type == 'file') {
                            continue;
                        }

                        if (module.name != 'Security') {
                            continue;
                        }
                        observer.next(`\n开始写入[${module.name}]`);
                        const mergeFilePath = await ElectronAPI.pathJoin('api', module.name, 'merge.txt')

                        try {

                            if (await ElectronAPI.userFileExists(mergeFilePath)) {
                                await this.write(sysPrompt, projectStructure, mergeFilePath,observer);
                            }
                        } catch (e) {
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


    private async write(sysPrompt: string, projectStructure: string, mergeFilePath: string, observer: Subscriber<string>) {

            const allCode = await this.readResult(mergeFilePath);
            const userInput = `${allCode}\n # 工程结构：\n${projectStructure}`;
            const response = await this.chat(sysPrompt, userInput);



            const jsonText = this.extractCode(response);


            const jsonArray: FileContent[]  = JSON.parse(jsonText);

            for (const item of jsonArray) {
                const filePath  = await ElectronAPI.pathJoin( 'project', item.path);
                await this.writeResult(filePath,item.content)
                observer.next(`写入${item.path}`);
            }


    }
}

// 封装对象
interface FileContent {
    path: string;
    content: string;
}