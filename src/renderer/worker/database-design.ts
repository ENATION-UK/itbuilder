import { Task } from "../types/ITask.ts";
import {  Observable } from "rxjs";

export  class DatabaseDesign extends Task {

    name(): string {
        return "DatabaseDesign"
    }


    dependencies(): string[] {
        return ['RequirementsAnalyst']
    }

    execute(): Observable<string> {

        return new Observable<string>((observer) => {
            (async () => {
                try {

                    observer.next("\n开始数据库设计");


                    //数据库设计提示词
                    let sysPrompt = await this.readPrompt('database-design.txt');

                    //需求分析结果
                    let reqAnalysis = await this.readResult('req-analysis.txt');
                    let ddlResult = '';

                    //通过ai获取数据库设计结果
                    let response = await this.streamChat(sysPrompt,reqAnalysis);

                    for await (const content of response) {
                        ddlResult += content;
                        observer.next(content);
                    }

                    //写入数据库设计结果
                    let sqlJson = this.extractCode(ddlResult);
                    await this.writeResult('ddl.txt',sqlJson);
                    observer.next("\n数据库设计完成");
                    observer.complete();

                } catch (error) {
                    observer.error(error);
                }
            })();
        });
    }

}