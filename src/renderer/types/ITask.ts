import {Observable, Subject} from "rxjs";
import {ElectronAPI} from '../utils/electron-api';
import {settings} from '../utils/settings';
import  i18n  from '../i18n';
import {KeyManager} from '../utils/KeyManager'
import {chat} from '../utils/ModelCall'
// 基础任务类
export abstract class Task implements ITask {
    protected requirement: Requirement | null = null;
    private keyManager: KeyManager;

    protected translate = i18n.global.t;

    constructor() {
        this.keyManager = new KeyManager(settings.apiKey);
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




    protected async extractCode(str: string | null): Promise<string> {
        if (!str) {
            return '';
        }
        str = await this.jsonFix(str)
        // 先去掉特定的代码标识，如 ```json, ```sql, ```mermaid
        str = str.replace(/```(json|sql|mermaid)/g, "```");

        // 正则匹配 ``` 包裹的代码
        const match = str.match(/```[\r\n]?([\s\S]*?)```/);
        return match ? match[1].trim() : str
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

        // 正则表达式匹配路径和代码块
        const pathRegex = /#\s*`([^`]+)`/g; // 全局匹配路径
        const codeBlockRegex = /```(?:[a-zA-Z]+)?\s*([\s\S]*?)\s*```/g; // 全局匹配代码块，支持任意语言标识

        // 提取所有路径
        const pathMatches = [...markdown.matchAll(pathRegex)];
        // 提取所有代码块
        const codeMatches = [...markdown.matchAll(codeBlockRegex)];

        // 确保路径和代码块数量一致
        if (pathMatches.length !== codeMatches.length) {
            throw new Error("路径和代码块数量不匹配");
        }

        // 将路径和代码封装为 FileContent 对象
        for (let i = 0; i < pathMatches.length; i++) {
            const path = pathMatches[i][1]; // 提取路径
            const content = codeMatches[i][1].trim(); // 提取代码并去除空白
            fileContents.push({path, content});
        }

        return fileContents;
    }


    protected async writeCodes(
        markdown: string,
        callback?: (info: FileContent) => void
    ) {
        const jsonArray = this.extractAllFileContents(markdown);
        for (const item of jsonArray) {
            const filePath = await ElectronAPI.pathJoin('project', item.path);
            console.log(filePath)
            await ElectronAPI.writeUserFile(filePath, item.content);
            const topProjectPath = await ElectronAPI.pathJoin(
                this.requirement.projectName,
                'project',
                item.path
            );
            await this.writeResult(topProjectPath, item.content);

            if (callback) {
                // 调用传入的回调函数
                callback(item);
            }
        }
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