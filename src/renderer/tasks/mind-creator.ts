import {Observable} from 'rxjs';
import {Task} from '../types/ITask'; // 假设Task类型定义在这个路径


export class MindCreator extends Task {

    id(): string {
        return "MindCreator";
    }

    name(): string {
        return this.i18n.t('MindCreator.name');
    }

    dependencies(): string[] {
        return ['RequirementsAnalyst'];
    }

    execute(): Observable<string> {
        return new Observable<string>((observer) => {
            (async () => {
                try {
                    observer.next("\n开始生成脑图");

                    const requirement = await this.readResult('req-analysis.txt');

                    const sysPrompt = await this.readPrompt('mind.txt');

                    let mindResult = '';
                    const response = await this.streamChat(sysPrompt, requirement);

                    for await (const content of response) {
                        mindResult += content;
                        observer.next(content);
                    }

                    // 假设jsonExtract是一个用于从字符串中提取JSON的函数
                    const text =  await this.extractCode(mindResult);  // 这里直接解析成JSON对象

                    await this.writeResult('mind.txt', text);

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