import { Task } from "../types/ITask";
import {  Observable } from "rxjs";


export class RequirementsAnalyst extends Task {
    id(): string {
        return "RequirementsAnalyst"
    }
    name(): string {
        return "需求分析"
    }

    streamChatTest = async function() {
        // 模拟异步操作，比如网络请求
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('response data');
            }, 2000);
        });
    };

    execute(): Observable<string> {

        return new Observable<string>((observer) => {
            (async () => {
                try {

                    observer.next("\n开始需求分析");
                    // let response = await this.streamChatTest();
                    // console.log(response);
                    //
                    const userReq = await this.readResult('text-requirement.txt');
                    let sysPrompt = await this.readPrompt('req-analysis.txt');
                    let analysisResult = '';


                    const response = await this.streamChat(sysPrompt, userReq);
                    for await (const content of response) {
                        analysisResult += content;
                        observer.next(content);
                    }

                    await this.writeResult('req-analysis.txt', analysisResult);

                    //将需求分析整理为json
                    observer.next("\n将需求分析整理为json");
                    sysPrompt = await this.readPrompt('req-to-json.txt');
                    const jsonResult = await this.chat(sysPrompt, analysisResult);

                    const reqJson = this.extractCode(jsonResult);
                    await this.writeResult('req-json.txt', reqJson);

                    observer.complete();

                } catch (error) {
                    observer.error(error);
                }
            })();
        });
    }

}