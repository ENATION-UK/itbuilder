import {Task} from "../../types/ITask";
import {Observable} from "rxjs";


export class Child1 extends Task {

    id(): string {
        return "Child1"
    }

    name(): string {
        return "Child1"
    }


    dependencies(): string[] {
        return []
    }



    execute(): Observable<string> {
        return new Observable<string>((observer) => {
            (async () => {
                try {
                    observer.next("\nChild1");

                    await new Promise(resolve => setTimeout(resolve, 3000));

                    observer.next("\nChild1完成");
                    observer.complete();

                } catch (error) {
                    observer.error(error);
                    observer.next("\nChild1出错");
                } finally {
                    // 更新进度至100%
                }
            })();
        });
    }

}