import {Task} from "../../types/ITask";
import {Observable} from "rxjs";


export class Child3 extends Task {

    id(): string {
        return "Child3"
    }

    name(): string {
        return "Child3"
    }


    dependencies(): string[] {
        return ["Child2"]
    }



    execute(): Observable<string> {
        return new Observable<string>((observer) => {
            (async () => {
                try {
                    observer.next("\nChild3"+ new Date());

                    await new Promise(resolve => setTimeout(resolve, 3000));

                    observer.next("\nChild3完成"+ new Date());
                    observer.complete();

                } catch (error) {
                    observer.error(error);
                    observer.next("\nChild3出错");
                } finally {
                    // 更新进度至100%
                }
            })();
        });
    }

}