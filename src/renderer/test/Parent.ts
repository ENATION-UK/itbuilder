import {Task} from "../types/ITask";
import {Observable} from "rxjs";
import {executeChildrenTasks} from "../utils/TaskUtil";
import {Child2} from "./children/Child2";
import {Child1} from "./children/Child1";
import {Child3} from "./children/Child3";


export class Parent extends Task {

    id(): string {
        return "Parent"
    }

    name(): string {
        return "Parent"
    }


    dependencies(): string[] {
        return ["Task1"]
    }

    isGroup(): boolean {
        return true;
    }

    children(): ITask[] {
        return [new Child3(),new Child1(),new Child2()];
    }

    execute(): Observable<string> {
        return new Observable<string>((observer) => {
            (async () => {
                try {
                    observer.next("\n开始Parent ->  "+ + new Date());

                    await executeChildrenTasks(this.children(), observer);

                    observer.next("\nParent完成->  "+ + new Date());
                    observer.complete();

                } catch (error) {
                    observer.error(error);
                    observer.next("\nParent出错");
                } finally {
                    // 更新进度至100%
                }
            })();
        });
    }

}