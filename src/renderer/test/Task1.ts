import {Task} from "../types/ITask";
import {Observable} from "rxjs";
import {executeChildrenTasks} from "../utils/TaskUtil";


export class Task1 extends Task {

    id(): string {
        return "Task1"
    }

    name(): string {
        return "Task1"
    }


    dependencies(): string[] {
        return []
    }



    execute(): Observable<string> {
        return new Observable<string>((observer) => {
            (async () => {
                try {
                    observer.next("\n开始Task1");

                    await new Promise(resolve => setTimeout(resolve, 3000));


                    observer.next("\nTask1完成");
                    observer.complete();

                } catch (error) {
                    observer.error(error);
                    observer.next("\nTask1写出错");
                } finally {
                    // 更新进度至100%
                }
            })();
        });
    }

}