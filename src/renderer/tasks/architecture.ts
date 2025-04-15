import {Task} from "../types/ITask";
import {Observable} from "rxjs";
import {ApiDesign} from "./architecture/api-design";
import {DatabaseDesign} from "./architecture/database-design";
import {DefiningStandards} from "./architecture/defining-standards";


export class Architecture extends Task {

    id(): string {
        return "Architecture"
    }

    name(): string {
        return this.translate('Architecture.name');
    }


    dependencies(): string[] {
        return ['RequirementsAnalyst']
    }

    isGroup(): boolean {
        return true;
    }

    children(): ITask[] {
        return [new DefiningStandards(),new DatabaseDesign(),new ApiDesign()];
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