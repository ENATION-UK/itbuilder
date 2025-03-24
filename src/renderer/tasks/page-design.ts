import {Observable} from 'rxjs';
import {Task} from "../types/ITask";
import {streamChat} from "../utils/ModelCall";

export class PageDesign extends Task {
    id(): string {
        return "PageDesign";
    }

    name(): string {
        return this.translate('PageDesign.name');
    }

    dependencies(): string[] {
        return ['RequirementsAnalyst'];
    }


    execute(): Observable<string> {
        return new Observable<string>((observer) => {
            (async () => {
                try {
                    observer.next("\n开始页面设计");

                    const requirement = await this.readResult('req-analysis.txt');
                    const sysPrompt = await this.readPrompt('page-design.txt');

                    let pageResult = '';
                    const response = await streamChat(sysPrompt, requirement);

                    for await (const content of response) {
                        pageResult += content;
                        observer.next(content);
                    }

                    await this.writeResult('page-design.txt', pageResult);

                    observer.next("\n将页面规划整理为json");

                    const jsonSysPrompt = await this.readPrompt('page-to-json.txt');
                    let jsonText = '';

                    const jsonResponse = await chat(jsonSysPrompt, pageResult);

                    jsonText = await this.extractCode(jsonResponse);

                    await this.writeResult('page-to-json.txt', jsonText);

                    observer.next("\n页面设计完成");
                    observer.complete();

                } catch (error) {
                    observer.error(error);
                    observer.next("\n页面设计出错");
                }
            })();
        });
    }
}