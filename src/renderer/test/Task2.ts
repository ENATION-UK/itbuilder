import {Task} from "../types/ITask";
import {Observable} from "rxjs";
import {executeChildrenTasks} from "../utils/TaskUtil";


export class Task2 extends Task {

    id(): string {
        return "Task2"
    }

    name(): string {
        return "Task2"
    }


    dependencies(): string[] {
        return ["Parent"]
    }



    execute(): Observable<string> {
        return new Observable<string>((observer) => {
            (async () => {
                try {
                    observer.next("\n开始Task2");

                    await new Promise(resolve => setTimeout(resolve, 3000));


                    observer.next("\nTask2完成");
                    observer.complete();

                } catch (error) {
                    observer.error(error);
                    observer.next("\nTask2写出错");
                } finally {
                    // 更新进度至100%
                }
            })();
        });
    }

}