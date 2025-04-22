import {Task} from "../../types/ITask";
import {Observable,Subscriber} from "rxjs";
import {streamChat} from "../../utils/ModelCall";

export class CodeReview extends Task {
    id(): string {
        return "CodeReview"
    }
    name(): string {
        return "代码审查"

    }

    dependencies(): string[] {
        return ["CodeWrite"]
    }


    execute(): Observable<string> {

        return new Observable<string>((observer) => {
            (async () => {
                try {
                    const modules = await this.getModules();
                    for (const module of modules) {
                        await this.extracted(observer,module);
                    }
                    observer.next("\n代码优化完成");
                    observer.complete();

                } catch (error) {
                    observer.error(error);
                }
            })();
        });
    }

    private async extracted(observer: Subscriber<string>,module: string) {
        observer.next("\n开始code review");

        const sysPrompt = await this.readPrompt('code-review.txt');
        const ddl = await this.readResult(`modules/${module}/ddl.txt`);
        const apiDesign = await this.readResult(`modules/${module}/api-design.txt`);
        const standards = await this.readResult('standard.txt');

        const code = await this.readResult(`modules/${module}/code.txt`);

        const requirement = await this.readResult(`modules/${module}/prd.txt`);


        let apiResult = '';

        let userInput = `
# 需求
 ${requirement}
# 数据库结构
${ddl}
# API设计
${apiDesign}

# 规范定义
${standards}

# 现有代码
${code}
`;

        const response = await streamChat(sysPrompt, userInput);

        for await (const content of response) {
            apiResult += content;
            observer.next(content);
        }

        await this.writeResult(`modules/${module}/code-review.txt`, apiResult);

        const codeFix = await this.readPrompt('code-fix.txt');
        userInput += "\n\n # 代码审查结果 \n" + apiResult;

        const fixResponse = await streamChat(codeFix, userInput);
        apiResult = '';
        for await (const content of fixResponse) {
            apiResult += content;
            observer.next(content);
        }

        await this.writeResult(`modules/${module}/code-fix.txt`, apiResult);
        await this.writeCodes(apiResult);
    }
}