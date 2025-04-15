import {Task} from "../../types/ITask";
import {Observable} from "rxjs";
import {streamChat} from "../../utils/ModelCall";


export class CodeWrite extends Task {
    id(): string {
        return "CodeWrite"
    }

    name(): string {
        return "编写代码"

    }

    dependencies(): string[] {
        return []
    }



    execute(): Observable<string> {

        return new Observable<string>((observer) => {
            (async () => {
                try {

                    observer.next(`\n开始编写[${this.requirement.module}]的代码`);
                    const sysPrompt = await this.readPrompt('api-dev.txt');
                    const ddl = await this.readResult(`modules/${this.requirement.module}/ddl.txt`);
                    const apiDesign = await this.readResult(`modules/${this.requirement.module}/api-design.txt`);
                    const standards = await this.readResult('standard.txt');

                    const requirement = await this.readResult(`modules/${this.requirement.module}/prd.txt`);

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

                    await this.writeResult("modules/"+this.requirement.module+"/code.txt", codeResult);
                    await this.writeCodes(codeResult)

                    observer.next("\n写入完成");
                    observer.complete();

                } catch (error) {
                    observer.error(error);
                }
            })();
        });
    }


}