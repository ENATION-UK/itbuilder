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
        return ['Architecture']
    }


    execute(): Observable<string> {

        return new Observable<string>((observer) => {
            (async () => {
                try {

                    observer.next("\n开始初始化工程");

                    const sysPrompt = await this.readPrompt('java-project.txt');
                    const md2Code = await this.readPrompt('api-source.txt');

                    //读取出定义的规范，然后清理掉业务的文件，只保留框架、配置性文件，以便做项目的初始化
                    //如果有业务性文件，不方便将来代码的生成，因为那样相当于基于一个示例代码去合并，产生不必要的麻烦
                    const standard = await this.readResult("standard.txt");
                    const cleanFolder = await this.readPrompt('clean-folder.txt');

                    //经过清理的，只剩下基础框架的线图
                    const baseLineChart = await chat(cleanFolder, standard);


                    const  requirement=`
# 基础框架                    
-  Spring Boot、MyBatis Plus和lombok框架
- 使用mysql 数据库 ,druid连接池
# 规范
${baseLineChart}
`;                  //根据基础规范和框架生成项目的目录结构及文件
                    const projectInit = await chat(sysPrompt, requirement);

                    //将 markdown 转换成代码
                    const markdownRes = await chat(md2Code, projectInit);

                    await this.writeResult('project-init.txt', projectInit);
                    await this.writeResult('project-md.txt', markdownRes);
                    await this.writeCodes( markdownRes )

                    observer.next("\napi项目初始化完成");


                    observer.complete();

                } catch (error) {
                    observer.error(error);
                }
            })();
        });
    }

}