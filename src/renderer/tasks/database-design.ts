import {Task} from "../types/ITask";
import {Observable} from "rxjs";
import {streamChat} from "../utils/ModelCall";

export class DatabaseDesign extends Task {

    id(): string {
        return "DatabaseDesign"
    }

    name(): string {
        return this.translate('DatabaseDesign.name');
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
                    const sysPrompt = await this.readPrompt('database-design.txt');

                    //需求分析结果
                    const reqAnalysis = await this.readResult('prd.txt');
                    let ddlResult = '';
                    //
                    // //通过ai获取数据库设计结果
                    const response = await streamChat(sysPrompt, reqAnalysis);

                    for await (const content of response) {
                        ddlResult += content;
                        observer.next(content);
                    }

                    //写入数据库设计结果
                    const sql = await this.extractCode(ddlResult);
                    await this.writeResult('ddl.txt', sql);
                    // const sql = await this.readResult('ddl.txt');

                    //为每个模块写入数据库设计结果
                    const modules = await this.getModules();
                    for (const module of modules) {

                        //提取某个模块的表结构
                        ddlResult = '';

                        const pickPrompt =`${sql}\n请提取模块'${module}'的表结构`;

                        const ddlPick = await this.readPrompt('ddl-pick.txt');
                        //通过ai获取数据库设计结果
                        const picRes = await streamChat(ddlPick, pickPrompt);

                        for await (const content of picRes) {
                            ddlResult += content;
                            observer.next(content);
                        }
                        await this.writeResult(`modules/${module}/ddl.txt`, ddlResult);
                    }


                    observer.next("\n数据库设计完成");
                    observer.complete();

                } catch (error) {
                    observer.error(error);
                }
            })();
        });
    }

}