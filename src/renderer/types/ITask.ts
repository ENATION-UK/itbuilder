import {Observable, Subject} from "rxjs";
import {ElectronAPI} from '../utils/electron-api';
import i18n from '../i18n';
import {KeyManager} from '../utils/KeyManager'
import {chat} from '../utils/ModelCall'

// 基础任务类
export abstract class Task implements ITask {
    protected requirement: Requirement | null = null;
    private keyManager: KeyManager;

    protected translate = i18n.global.t;

    isGroup(): boolean {
        return false;
    }

    children(): ITask[] {
        return [];
    }


    setRequirement(requirement: Requirement): void {
        this.requirement = requirement;
    }


    async readPrompt(promptPath: string): Promise<string> {
        const fullPath = `prompts/${promptPath}`
        return await ElectronAPI.readAppFile(fullPath);
    }

    async readResult(resultPath: string): Promise<string> {
        resultPath=await ElectronAPI.pathJoin(this.requirement.projectName,"generation", this.requirement.id, resultPath)
        return await ElectronAPI.readUserFile(resultPath);
    }

    async writeResult(resultPath: string, content: string): Promise<string> {
        resultPath=await ElectronAPI.pathJoin(this.requirement.projectName,"generation", this.requirement.id, resultPath)
        return await ElectronAPI.writeUserFile(resultPath, content);
    }


     extractCode(text: string): string | null {
        const regex = /```(?:\w+)?\n(.*?)```/s;  // (?s) 等价于 /s 标志，允许 . 匹配换行符
        const match = text.match(regex);
        return match ? match[1] : text;
    }

    protected async jsonFix(json: string): Promise<string> {

        try {
            JSON.parse(json);
            return json;
        } catch (error) {
            const sysPrompt = await this.readPrompt("json-fix.txt")
            json = await chat(sysPrompt, json)
            return json;
        }

    }

    protected async codeAnalyst(code:string): Promise<FunctionInfo>{
        const sysPrompt = await this.readPrompt("code-analyst.txt");
        let jsonText =  await chat(sysPrompt, code);
        jsonText = await this.extractCode(jsonText);
        return JSON.parse(jsonText);
    }



    protected extractAllFileContents(markdown: string): FileContent[] {
        const fileContents: FileContent[] = [];

        // 先匹配所有路径 + 代码块
        const fileRegex = /`(\/[^\n`]+)`\s*\n```[a-zA-Z]*\s*([\s\S]*?)\s*```/g;

        let match;
        while ((match = fileRegex.exec(markdown)) !== null) {
            const path = match[1].trim();   // 提取文件路径
            const content = match[2].trim(); // 提取代码块内容
            fileContents.push({ path, content });
        }

        return fileContents;
    }


    protected async writeCodes(
        markdown: string,
        callback?: (info: FileContent) => void
    ) {
        const jsonArray = this.extractAllFileContents(markdown);
        // debugger
        for (const item of jsonArray) {

            const topProjectPath = await ElectronAPI.pathJoin(
                this.requirement.projectName,
                'project',
                item.path
            );
            console.log("写入", item.path);
            item.content = await this.mergeCode(topProjectPath, item.content)
            item.content = this.extractCode(item.content)
            await ElectronAPI.writeUserFile(topProjectPath, item.content)
            // await this.writeResult(topProjectPath, item.content);

            if (callback) {
                // 调用传入的回调函数
                callback(item);
            }
        }
    }

    private async mergeCode(path: string, code: string): Promise<string> {
        let originContent = '';
        try {
             originContent = await ElectronAPI.readUserFile(path);
        } catch (e){
            console.log("文件不存在",path);
        }

        //如果原文件为空则直接返回新代码即可
        if (originContent==''){
            return code;
        }

        const userInput=`# 代码版本1
        ${originContent}
        # 代码版本2
         ${code}
        `;
        const sysPrompt = await this.readPrompt('file-merge.txt');
        const response = await chat(sysPrompt, userInput);

        return response;
    }

    protected async getModules(): Promise<string[]> {
        const moduleFolderPath=await ElectronAPI.pathJoin(this.requirement.projectName,"generation", this.requirement.id, "modules")

        const folders = await ElectronAPI.listUserFolder(moduleFolderPath);

        return folders.filter((folder) => folder.type === 'directory').map((folder) => folder.name)
    }

    protected temperature(): number {
        return 1.99;
    }


    abstract id(): string;
    abstract name(): string;

    protected outputStream = new Subject<string>(); // 用于流式输出


    // 任务执行逻辑 (需子类实现)
    abstract execute(): Observable<string>;

    dependencies(): string[] {
        return [];
    }


}