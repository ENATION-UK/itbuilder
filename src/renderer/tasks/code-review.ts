import {Task} from "../types/ITask";
import {Observable} from "rxjs";
import {streamChat} from "../utils/ModelCall";

export class CodeReview extends Task {
    id(): string {
        return "CodeReview"
    }
    name(): string {
        return this.translate('CodeReview.name');

    }

    dependencies(): string[] {
        return ['RequirementsAnalyst', 'DatabaseDesign']
    }


    execute(): Observable<string> {

        return new Observable<string>((observer) => {
            (async () => {
                try {

                    observer.next("\n开始code review");

                    const sysPrompt = await this.readPrompt('code-review.txt');
                    const ddl = await this.readResult(`modules/${this.requirement.module}/ddl.txt`);
                    const apiDesign = await this.readResult(`modules/${this.requirement.module}/api-design.txt`);
                    const standards = await this.readResult('standard.txt');

                    const code = await this.readResult(`modules/${this.requirement.module}/code.txt`);

                    const requirement = await this.readResult(`modules/${this.requirement.module}/prd.txt`);


                    let apiResult = '';

                    let  userInput = `
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

                    await this.writeResult(`modules/${this.requirement.module}/code-review.txt`, apiResult);

                    const codeFix = await this.readPrompt('code-fix.txt');
                    userInput+= "\n\n # 代码审查结果 \n"+ apiResult;

                    const fixResponse = await streamChat(codeFix, userInput);
                    apiResult = '';
                    for await (const content of fixResponse) {
                        apiResult += content;
                        observer.next(content);
                    }

                    await this.writeResult(`modules/${this.requirement.module}/code-fix.txt`, apiResult);
                    await this.writeCodes(apiResult);

                    observer.next("\n代码优化完成");
                    observer.complete();

                } catch (error) {
                    observer.error(error);
                }
            })();
        });
    }

}