import {Task} from "../types/ITask";
import {Observable} from "rxjs";
import { ipcRenderer } from "electron";
import {ElectronAPI} from "../utils/electron-api";
import {fix} from "../utils/BugFix";


export class BugFix extends Task {
    id(): string {
        return "MavenExe"
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
                    const cmd = "/Users/wangfeng/Library/Application Support/itBuilder/Projects/test4/project";
                    observer.next("\n开始执行maven");


                    try {
                        const result = await  ElectronAPI.runMavenCommand(["clean", "install"],cmd);
                        console.log("Maven output:", result);
                    } catch (error) {
                        observer.next("\n开始修复bug");
                       const standard=await this.readResult("standard.txt");
                        console.error("Error running mvn command:", error);
                        const bug = `# 目录结构\n ${standard} \n\n # 错误信息 \n\n ${error}`;
                        await fix(bug)
                    }

                    observer.next("\n执行maven完成");
                    observer.complete();

                } catch (error) {
                    observer.error(error);
                }
            })();
        });
    }



}