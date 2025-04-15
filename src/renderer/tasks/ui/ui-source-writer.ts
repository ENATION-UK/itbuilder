import { Task } from "../../types/ITask";
import {  Observable } from "rxjs";
// eslint-disable-next-line import/no-unresolved
import {Subscriber} from "rxjs/internal/Subscriber";
import {Module,Page} from "../../types/Module";


export class UISourceWriter extends Task {


    id(): string {
        return "UISourceWriter"
    }
    name(): string {
        return this.translate('UISourceWriter.name');
    }

    dependencies(): string[] {
        return ['PageDesign']
    }

    execute(): Observable<string> {

        return new Observable<string>((observer) => {
            (async () => {
                try {
                    observer.next("\n开始创建UI源文件");

                    const sysPrompt = await this.readPrompt('bootstrap-ui-dev.txt');

                    const jsonText = await this.readResult('page-to-json.txt');
                    const moduleList:Module[] = JSON.parse(jsonText);


                    for (const module of moduleList) {
                        observer.next(`\n开始创建[${module.moduleName}]模块的UI源文件`);

                        for (const page of module.pages) {
                            try {
                                observer.next(`\n开始创建[${page.pageName}]的UI源文件`);
                                await this.write(sysPrompt, module.moduleName, page,observer);
                                observer.next(`\n创建[${page.pageName}]的UI源文件完成`);
                            } catch (error) {
                                observer.error(`创建[${page.pageName}]的UI源出错`);
                            }
                        }
                    }

                    observer.next("\nUI源文件创建完成");
                    observer.complete();


                } catch (error) {
                    observer.error("UI源文件创建过程中出错");
                }
            })();
        });
    }




    private async write(sysPrompt: string, moduleName: string, page: Page,observer: Subscriber<string>): Promise<void> {
        const prompt = `# ${page.pageName}:\n## 功能说明\n${page.functionDescription}\n## 布局及元素\n${page.pageItem}\n## 操作体验\n${page.userInteraction}\n## 风格\n${page.style}`;

        const response = await streamChat(sysPrompt, prompt);

        let apiResult = '';
        for await (const content of response) {
            apiResult += content;
            observer.next(content);
        }

        const path = `/html/${moduleName}/${page.pageName}.html`;
        await this.writeResult(path, apiResult);
    }



}
