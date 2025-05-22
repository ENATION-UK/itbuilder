import {Task} from "../types/ITask";
import {Observable} from "rxjs";
import {ElectronAPI} from "../utils/electron-api";
import pLimit from 'p-limit';
import {getProjectPath} from "../utils/project";
import {getEmbedding} from "../utils/ModelCall";


export class ScanCode extends Task {

    id(): string {
        return "ScanCode"
    }

    name(): string {
        return this.translate('ScanCode.name');
    }


    dependencies(): string[] {
        return ['ScanCode']
    }


    execute(): Observable<string> {
        return new Observable<string>((observer) => {
            (async () => {
                try {
                    observer.next("\n开始扫描源码");

                    // const files = await ElectronAPI.listFolder('/Users/wangfeng/workspace/ts/full/api/7.3.1_dev/javashop-core/src/main/java/com/enation/app/javashop/model/goodssearch');
                    await this.folderCodesAnalyst('/Users/wangfeng/Library/Application Support/itBuilder/Projects/的/project/src');
                    await ElectronAPI.saveIndex();
                    // await ElectronAPI.writeUserFile(apiCodesJsonPath, JSON.stringify(moduleInfos, null, 2));


                    observer.next("\n扫描源码完成");
                    observer.complete();

                } catch (error) {
                    observer.error(error);
                    observer.next("\n扫描源码出错");
                } finally {
                    // 更新进度至100%
                }
            })();
        });
    }


    private async folderCodesAnalyst(folderPath: string) {
        const projectPath = await getProjectPath(this.requirement.projectName);
        const files = await ElectronAPI.listFolder(folderPath);

        const sourceCodes: SourceCode[] = [];
        const limit = pLimit(2); // 控制最大并发数为 5

        files.sort((a, b) => {
            if (a.type === b.type) return 0;
            return a.type === 'file' ? -1 : 1;
        });

        const tasks = files.map(item =>
            limit(async () => {
                if (item.type === 'file' && item.path.endsWith('.java')) {

                    const content = await ElectronAPI.readFile(item.path);
                    const sourceCode = await this.codeAnalyst(content);
                    const path = item.path.replaceAll(projectPath, '');
                    sourceCode.path = path;
                    sourceCode.embedding = await getEmbedding(sourceCode.description);
                    sourceCodes.push(sourceCode);
                    const id = await this.insertSourceCode(sourceCode);
                    await ElectronAPI.addVector(id, sourceCode.embedding);
                } else {
                    await this.folderCodesAnalyst(item.path); // 递归处理子目录
                }
            })
        );

        await Promise.all(tasks); // 并发运行当前层任务
        console.log(folderPath,"扫描完成")
        // 写入 codes.json
        const fPath = folderPath.replaceAll(projectPath, '');
        const codesInfo = JSON.stringify(sourceCodes, null, 2);
        await ElectronAPI.writeUserFile(`${this.requirement.projectName}/workspace/rag/codes/${fPath}/codes.json`, codesInfo);
    }

    private convertToCommaString(input: any): string | null {
        if (Array.isArray(input)) {
            return input.join(',');
        }
        return input; // 或抛错、返回默认值，根据你的需求
    }
     private  async insertSourceCode(data: Omit<SourceCode, 'id'>): Promise<number> {
        // console.log(data)
        const { module_id, module, path,type, keywords, description } = data;
         const result = await ElectronAPI.runQuery(`INSERT INTO source_code (module_name,path, type, keywords, description) VALUES (?,?, ?, ?, ?)`,
             [module, path,type, this.convertToCommaString(keywords), description])
        // console.log(result)
        return result.lastInsertRowid as number;
    }

}