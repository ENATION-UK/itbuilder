import {Task} from "../types/ITask";
import {Observable} from "rxjs";
import {PageDesign} from "./ui/page-design";
import {UISourceWriter} from "./ui/ui-source-writer";


export class UIDeveloper extends Task {

    id(): string {
        return "UIDeveloper"
    }

    name(): string {
        return this.translate('UIDeveloper.name');
    }


    dependencies(): string[] {
        return ['RequirementsAnalyst']
    }

    isGroup(): boolean {
        return true;
    }

    children(): ITask[] {
        return [new PageDesign(),new UISourceWriter()];
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