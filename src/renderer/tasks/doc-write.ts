import {Task} from "../types/ITask";
import {Observable} from "rxjs";
import {MindCreator} from "./doc/mind-creator";
import {FlowCreator} from "./doc/flow-creator";


export class DocWrite extends Task {

    id(): string {
        return "DocWrite"
    }

    name(): string {
        return this.translate('DocWrite.name');
    }


    dependencies(): string[] {
        return ['RequirementsAnalyst']
    }

    isGroup(): boolean {
        return true;
    }

    children(): ITask[] {
        return [new MindCreator(),new FlowCreator()];
    }

    execute(): Observable<string> {
        return new Observable<string>((observer) => {
            (async () => {
                try {
                    observer.next("\n开始生成脑图");


                    observer.next("\n脑图完成");
                    observer.complete();

                } catch (error) {
                    observer.error(error);
                    observer.next("\n脑图设计出错");
                } finally {
                    // 更新进度至100%
                }
            })();
        });
    }

}