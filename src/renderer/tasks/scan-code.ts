import {Task} from "../types/ITask";
import {Observable} from "rxjs";
import {ElectronAPI} from "../utils/electron-api";
import {dirAnalyst} from "../utils/code-analyst";
import {getProjectPath} from "../utils/project";


export class ScanCode extends Task {

    id(): string {
        return "DocWrite"
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
                    // const apiCodesJsonPath = await ElectronAPI.pathJoin(this.requirement.projectName, 'api-codes.json')
                    //
                    // // 读取现有的 api-codes.json 文件
                    // let moduleInfos: ModuleInfo[] = [];
                    // try {
                    //
                    //     const content = await ElectronAPI.readUserFile(apiCodesJsonPath);
                    //     moduleInfos = JSON.parse(content);
                    // } catch (error) {
                    //     // 如果文件不存在或读取失败，使用空数组
                    //     console.warn('无法读取 api-codes.json，使用空数组');
                    // }

                    // const files = await ElectronAPI.listFolder('/Users/wangfeng/workspace/ts/full/api/7.3.1_dev/javashop-core/src/main/java/com/enation/app/javashop/model/goodssearch');
                    await this.codesAnalyst1('/Users/wangfeng/Library/Application Support/itBuilder/Projects/的/project/goodssearch');

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
    private getLastPathSegment(path: string): string {
        // 去掉末尾可能存在的斜杠
        const trimmedPath = path.replace(/\/+$/, '');
        // 用斜杠分隔，并取最后一个部分
        const segments = trimmedPath.split('/');
        return segments[segments.length - 1];
    }

    private async codesAnalyst1(folderPath:string){


        const projectPath = await getProjectPath(this.requirement.projectName)
        const files = await ElectronAPI.listFolder(folderPath);
        const folderName = this.getLastPathSegment(folderPath);

        const moduleInfos: FunctionInfo[] = [];
        // 排序逻辑：type 为 'file' 的排在前面；其他不变
        files.sort((a, b) => {
            if (a.type === b.type) {
                return 0; // type 相同，不改变顺序
            }
            return a.type === 'file' ? -1 : 1; // file 放前面
        });

        for (const item of files) {
            if (item.type === 'file') {
                const content = await ElectronAPI.readFile(item.path)
                const functionInfo = await this.codeAnalyst(content);
                const fileName = this.getLastPathSegment(item.path);
                functionInfo.path = fileName
                moduleInfos.push(functionInfo)

            }else {
                await this.codesAnalyst1(item.path)
            }
        }

        //写入到codes文件夹的codes.json
        const fPath = folderPath.replaceAll(projectPath, '')
        const codesInfo = JSON.stringify(moduleInfos, null, 2);
        await ElectronAPI.writeUserFile(`${this.requirement.projectName}/workspace/rag/codes/${fPath}/codes.json`, codesInfo)
    }



}