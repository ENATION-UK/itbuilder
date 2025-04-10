import {Task} from "../../types/ITask";
import {Observable} from "rxjs";
import {ipcRenderer} from "electron";
import {ElectronAPI} from "../../utils/electron-api";
import {fix} from "../../utils/BugFix";
import {CodeWrite} from "./code-write";


export class ProjectReview extends Task {
    id(): string {
        return "ProjectReview"
    }

    name(): string {
        return this.translate("settings");

    }

    dependencies(): string[] {
        return []
    }


    execute(): Observable<string> {

        return new Observable<string>((observer) => {
            (async () => {
                try {
                    const maxTries = 20;

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
                            console.error("Error running mvn command:", error);
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