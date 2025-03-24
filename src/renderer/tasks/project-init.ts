import {Task} from "../types/ITask";
import {Observable} from "rxjs";
import {chat} from "../utils/ModelCall";


export class ProjectInit extends Task {
    id(): string {
        return "ProjectInit"
    }
    name(): string {
        return this.translate('ProjectInit.name');

    }

    dependencies(): string[] {
        return ['RequirementsAnalyst']
    }


    execute(): Observable<string> {

        return new Observable<string>((observer) => {
            (async () => {
                try {

                    observer.next("\n开始初始化工程");

                    const sysPrompt = await this.readPrompt('java-project.txt');
                    const markdown = await this.readPrompt('api-source.txt');
                    // const requirement = await this.readResult('req-analysis.txt');
                    // let apiResult = '';
                    const  requirement=`
-  Spring Boot、MyBatis Plus和lombok框架
- 使用mysql 数据库 ,druid连接池
`;
                    const response = await chat(sysPrompt, requirement);
                    const markdownRes = await chat(markdown, response);

                    await this.writeResult('project-init.txt', response);
                    await this.writeResult('project-folder.txt', markdownRes);
                    await this.writeCodes( markdownRes )

                    observer.next("\napi设计完成");
                    observer.complete();

                } catch (error) {
                    observer.error(error);
                }
            })();
        });
    }

}