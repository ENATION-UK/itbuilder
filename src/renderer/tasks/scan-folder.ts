import {Task} from "../types/ITask";
import {Observable} from "rxjs";
import {ElectronAPI} from "../utils/electron-api";
import pLimit from 'p-limit';
import {getProjectPath} from "../utils/project";
import {chat, getEmbedding} from "../utils/ModelCall";
import {querySourceCodeByPath} from "../utils/SourceCodeSearch";


export class ScanFolder extends Task {

    id(): string {
        return "ScanFolder"
    }

    name(): string {
        return this.translate('ScanFolder.name');
    }


    dependencies(): string[] {
        return ['ScanFolder']
    }


    execute(): Observable<string> {
        return new Observable<string>((observer) => {
            (async () => {
                try {
                    observer.next("\n开始扫描源码");

                    await this.analyzeFolder('/Users/wangfeng/Library/Application Support/itBuilder/Projects/的/project/src/main/java/com/enation/app');


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

    async analyzeFolder(dirPath: string) {
        const projectPath = await getProjectPath(this.requirement.projectName);


        // 递归终止条件：当目录没有子目录时
        const entries = await ElectronAPI.listFolder(dirPath);
        // 先处理子目录
        const subFolders = entries.filter(d => d.isDirectory());
        for (const folder of subFolders) {
            await this.analyzeFolder(await ElectronAPI.pathJoin(dirPath, folder.name));
        }

        // 处理当前目录
        const children = {
            folders: await this.getChildFoldersDescription(dirPath),
            files: await this.getChildFilesDescription(dirPath)
        };

        const folderInfo = await this.folderAiAnalyst(children);
        const rPath = dirPath.replaceAll(projectPath, '');
        await this.saveFolderToDB(rPath, folderInfo);
    }

    async getChildFoldersDescription(dirPath: string): Promise<SourceFolder[]> {
        const entries = await ElectronAPI.listFolder(dirPath);
        const projectPath = await getProjectPath(this.requirement.projectName);

        const limit = pLimit(3);
        return Promise.all(
            entries.filter(d => d.isDirectory())
                .map(d => limit(async () => {
                    const folderPath = d.path.replaceAll(projectPath, '');
                    console.log("query folder",folderPath)
                    const record: SourceFolder = await ElectronAPI.fetchOne(
                        'SELECT * FROM source_folder WHERE path = ?',
                        [folderPath]
                    );
                    console.log("result",record)
                    return record;
                }))
        );
    }

    async getChildFilesDescription(dirPath: string): Promise<SourceCode[]> {
        const entries = await ElectronAPI.listFolder(dirPath);
        const limit = pLimit(3);
        const projectPath = await getProjectPath(this.requirement.projectName);

        return Promise.all(
            entries.filter(d => d.isFile())
                .map(f => limit(async () => {
                    const filePath = await ElectronAPI.pathJoin(dirPath, f.name);
                    // const content = await ElectronAPI.readFile(filePath);
                    // const analysis = await this.codeAnalyst(content);
                    const rPath = filePath.replaceAll(projectPath, '');
                    console.log("query code",rPath)
                    const analysis = await querySourceCodeByPath(rPath)
                    console.log("result",analysis)
                    return analysis;
                }))
        );
    }

    async folderAiAnalyst(children: {
        folders: Array<SourceFolder>;
        files: Array<SourceCode>;
    }): Promise<SourceFolder> {
        const systemPrompt = await this.readPrompt("folder-analyst.txt");
        console.log("children",children)
        const folderInfo = children.folders.filter(f => f).length > 0
            ? children.folders.filter(f => f).map(f =>
                `- [目录] ${f.path}:\n  类型: ${f.type}\n  描述: ${f.description}`
            ).join('\n')
            : '无';

        const fileInfo = children.files.filter(f => f).length > 0
            ? children.files.filter(f => f).map(f =>
                `- [文件] ${f.path}:\n  类型: ${f.type}\n  描述: ${f.description}`
            ).join('\n')
            : '无';

        const userPrompt = `# 子目录信息：
${folderInfo}

# 子文件信息：
${fileInfo}
`;

        const response = await chat(systemPrompt, userPrompt);

        let  json = this.extractCode(response);
        json= await this.jsonFix(json)
        const sourceFolder: SourceFolder = JSON.parse(json);
        // sourceFolder.embedding = await getEmbedding(sourceFolder.description);
        return sourceFolder
    }


    async saveFolderToDB(dirPath: string, folder: SourceFolder) {

        const result = await ElectronAPI.runQuery(
            `INSERT INTO source_folder (path, type, description, keywords)
             VALUES (?, ?, ?, ?)`
            ,
            [
                dirPath,
                folder.type,
                folder.description,
                this.convertToCommaString(folder.keywords)
            ]
        );

        console.log(result)
    }

    private convertToCommaString(input: any): string | null {
        if (Array.isArray(input)) {
            return input.join(',');
        }
        return input; // 或抛错、返回默认值，根据你的需求
    }

}