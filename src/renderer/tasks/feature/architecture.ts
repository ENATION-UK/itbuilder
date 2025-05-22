import {Task} from "../../types/ITask";
import {Observable} from "rxjs";
import {searchCode} from "../../utils/SourceCodeSearch";
import {ElectronAPI} from "../../utils/electron-api";
import {streamChat} from "../../utils/ModelCall";

export class Architecture extends Task {

    id(): string {
        return "DocWrite"
    }

    name(): string {
        return this.translate('Architecture.name');
    }


    dependencies(): string[] {
        return ['ScanCode']
    }


    execute(): Observable<string> {
        return new Observable<string>((observer) => {
            (async () => {
                try {
                    observer.next("\n开始编写代码");
                    observer.next("\n编写代码完成");
                    const sysPrompt = await this.readPrompt("feature/architecture.txt");

                    // const req = "文件上传要支持aws的S3";
                    const req = `
1、企业用户增加“福利积分”发放功能及积分使用范围功能
注意:"福利积分"不是原商城的积分，是新的一套积分体系，由企业用户发放给他的员工的
详情需求： 
1)福利积分按员工发放且福利积分与商品存在绑定关系，发放时需选择使用商品；
2)福利积分发放需要审批流，审批通过即可发放；
3)企业需支持福利积分充值，福利积分发放不可超过未使用积分总数。
4)会员PC端、平台端新增福利积分对账报表功能。
                    `;
                    const sourceCodes = await searchCode(req);

                    let codes = "";
                    for (const sc of sourceCodes) {

                        const desc = `
 ## ${sc.path}
 - 类型
 ${sc.type}
 - 所属模块
 ${sc.module_name}
 - 源码关键字
 ${sc.keywords}
 - 功能描述
 ${sc.description}
 `;

                        codes += desc
                    }

                    const input = `
# 需求
${req}

# 现有源码
${codes}
`;


                    const response = await streamChat(sysPrompt, input);
                    let result = '';

                    for await (const content of response) {
                        result += content;
                        observer.next(content);
                    }


                    await this.writeResult("architecture.md", result)


                    observer.complete();

                } catch (error) {
                    observer.error(error);
                    observer.next("\n编写代码出错");
                } finally {
                    // 更新进度至100%
                }
            })();
        });
    }
}