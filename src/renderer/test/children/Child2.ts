import {Task} from "../../types/ITask";
import {Observable} from "rxjs";


export class Child2 extends Task {

    id(): string {
        return "Child2"
    }

    name(): string {
        return "Child2"
    }


    dependencies(): string[] {
        return ["Child1"]
    }



    execute(): Observable<string> {
        return new Observable<string>((observer) => {
            (async () => {
                try {
                    observer.next("\nChild2");

                    await new Promise(resolve => setTimeout(resolve, 3000));

                    observer.next("\nChild2完成");
                    observer.complete();

                } catch (error) {
                    observer.error(error);
                    observer.next("\nChild2出错");
                } finally {
                    // 更新进度至100%
                }
            })();
        });
    }

}