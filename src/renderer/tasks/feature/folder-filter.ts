import {Task} from "../../types/ITask";
import {Observable} from "rxjs";
import {ElectronAPI} from "../../utils/electron-api";
import {chat, streamChat} from "../../utils/ModelCall";

export class FolderFilter extends Task {
    PAGE_SIZE = 50

    id(): string {
        return "FolderFilter"
    }

    name(): string {
        return this.translate('FolderFilter.name');
    }


    dependencies(): string[] {
        return []
    }


    execute(): Observable<string> {
        return new Observable<string>((observer) => {
            (async () => {
                try {
                    observer.next("\n开始查找目录");
                    const result = await this.processFoldersInBatches();
                    const resultText= result.join("\n");
                    await this.writeResult("folder-step1.txt", resultText);

                    const architecture = await this.readResult("architecture.md");
                    const sysPrompt = await this.readPrompt("feature/folder-filter-step2.txt");
                    const userInput = `
${architecture} 
# 目录汇总
${resultText}
 `
                    let step2Result = '';
                    const response = await streamChat(sysPrompt, userInput);


                    for await (const content of response) {
                        step2Result += content;
                        observer.next(content);
                    }

                    await this.writeResult("folder-step2.txt", step2Result);


                    observer.next("\n查找目录完成");
                    observer.complete();

                } catch (error) {
                    observer.error(error);
                    observer.next("\n查找目录出错");
                } finally {
                    // 更新进度至100%
                }
            })();
        });
    }

    async processFoldersInBatches() {
        let offset = 0;
        let batch: SourceFolder[];
        const allResults: string[] = [];
        const architecture = await this.readResult("architecture.md");
        const sysPrompt = await this.readPrompt("feature/folder-filter-step1.txt");

        do {
            batch = await this.fetchFoldersByPage(offset, this.PAGE_SIZE);

            if (batch.length === 0) break;

            const folderJson = JSON.stringify(batch, null, 2); // 格式化美化输出
            const userInput = `
${architecture} 
# 工程目录
${folderJson}
 `
            const result = await chat(sysPrompt, userInput);

            allResults.push(result);
            offset += this.PAGE_SIZE;

        } while (batch.length === this.PAGE_SIZE);

        return allResults; // 所有分页批次的大模型返回内容
    }

    async fetchFoldersByPage(offset: number, limit: number): Promise<SourceFolder[]> {

        const sql = `SELECT id, path, type, description, keywords
                     FROM source_folder order by type LIMIT ?
                     OFFSET ?`;
        const rows = await ElectronAPI.fetchAll(sql, [limit, offset]);

        // 格式化 keywords 字段（从 TEXT -> string[]）
        return rows.map((row: any) => ({
            ...row,
            keywords: row.keywords ? row.keywords.split(',').map((k: string) => k.trim()) : null,
        }));
    }
}