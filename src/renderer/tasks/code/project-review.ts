import {Task} from "../../types/ITask";
import {Observable} from "rxjs";
import {ElectronAPI} from "../../utils/electron-api";
import {fix} from "../../utils/BugFix";



export class ProjectReview extends Task {
    id(): string {
        return "ProjectReview"
    }

    name(): string {
        return "编译调试"

    }

    dependencies(): string[] {
        return ["CodeReview"]
    }


    execute(): Observable<string> {

        return new Observable<string>((observer) => {
            (async () => {
                try {
                    const modules = await this.getModules();
                    const maxTries = 20*modules.length;

                    for (let i = 0; i <= maxTries; i++) {


                        const userDataPath = await ElectronAPI.getUserDataPath();
                        const fullPath = await ElectronAPI.pathJoin(userDataPath, "Projects", this.requirement.projectName, "project")

                        observer.next("\n开始执行bug fix "+ i + "次");

                        try {
                            const result = await ElectronAPI.runMavenCommand(["clean", "install"], fullPath);
                            console.log("Maven output:", result);
                            break;

                        } catch (error) {
                            observer.next("\n开始修复bug");
                            const standard = await this.readResult("standard.txt");
                            console.log("Error running mvn command:", error);
                            const bug = `
# 工程跟路径  \`${fullPath}\` 
# 错误信息 
 ${error}
 
# 规范
${standard}
`;
                            await fix(bug)
                        }
                    }

                    observer.next("\n执行bug fix完成");


                    observer.complete();

                } catch (error) {
                    observer.error(error);
                }
            })();
        });
    }


}