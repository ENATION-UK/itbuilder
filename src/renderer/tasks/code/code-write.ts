import {Task} from "../../types/ITask";
import {Observable, Subscriber} from "rxjs";
import {streamChat} from "../../utils/ModelCall";


export class CodeWrite extends Task {
    id(): string {
        return "CodeWrite"
    }

    name(): string {
        return "编写代码"

    }

    dependencies(): string[] {
        return ["ProjectInit"]
    }


    execute(): Observable<string> {

        return new Observable<string>((observer) => {
            (async () => {
                try {
                    const modules = await this.getModules();
                    for (const module of modules) {
                        await this.extracted(observer, module);
                    }
                    observer.complete();

                } catch (error) {
                    observer.error(error);
                }
            })();
        });
    }


    private async extracted(observer: Subscriber<string>, module: string) {
        observer.next(`\n开始编写[${module}]的代码`);
        const sysPrompt = await this.readPrompt('api-dev.txt');
        const ddl = await this.readResult(`modules/${module}/ddl.txt`);
        const apiDesign = await this.readResult(`modules/${module}/api-design.txt`);
        const standards = await this.readResult('standard.txt');

        const requirement = await this.readResult(`modules/${module}/prd.txt`);

        const prompt = `
# 需求
 ${requirement}
# 数据库结构
${ddl}
# API设计
${apiDesign}

# 规范定义
${standards}
`;
        const response = await streamChat(sysPrompt, prompt);
        let codeResult = '';
        for await (const content of response) {
            codeResult += content;
            observer.next(content);
        }

        await this.writeResult("modules/" + module + "/code.txt", codeResult);
        await this.writeCodes(codeResult)
    }
}