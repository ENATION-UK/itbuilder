import {Observable, Subject} from "rxjs";
import {ElectronAPI} from '../utils/electron-api';
import {settings} from '../utils/settings';
import {useI18n} from 'vue-i18n';
import * as console from "node:console";
import {KeyManager} from '../utils/KeyManager'

// 基础任务类
export abstract class Task implements ITask {
    protected requirement: Requirement | null = null;
    private keyManager: KeyManager;

    protected i18n = useI18n();

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

    protected async *streamChat(sysPrompt: string, userIdea: string): AsyncGenerator<string> {

        const { client, release } = await this.keyManager.getClient();

        const chatCompletion = await client.chat.completions.create({
            messages: [
                { role: 'system', content: sysPrompt },
                { role: 'user', content: userIdea }
            ],
            model: settings.modelName,
            max_tokens: parseInt(settings.maxToken) || 2000,
            temperature: this.temperature(),
            stream: true
        });

        try {
            for await (const chunk of chatCompletion) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                    yield content; // 逐步产出数据
                }
            }
        } finally {
            release(); // 确保释放信号量
        }
    }


    public async chat(sysPrompt: string, userIdea: string): Promise<string | null> {
        try {
            return await this.innerChat(sysPrompt, userIdea);
        } catch (e) {
             // 重试一次
            return await this.innerChat(sysPrompt, userIdea);
        }
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
            json = await this.innerChat(sysPrompt, json)
            return json;
        }

    }

    protected async codeAnalyst(code:string): Promise<FunctionInfo>{
        const sysPrompt = await this.readPrompt("code-analyst.txt");
        let jsonText =  await this.innerChat(sysPrompt, code);
        jsonText = await this.extractCode(jsonText);
        return JSON.parse(jsonText);
    }

// 在 Task 类中
    private async innerChat(sysPrompt: string, userIdea: string): Promise<string | null> {
        const { client, release } = await this.keyManager.getClient(); // 获取客户端，并控制并发

        try {
            const chatCompletion = await client.chat.completions.create({
                messages: [
                    { role: 'system', content: sysPrompt },
                    { role: 'user', content: userIdea }
                ],
                model: settings.modelName,
                max_tokens: parseInt(settings.maxToken) || 2000,
                temperature: this.temperature(),
            });

            return chatCompletion.choices[0]?.message?.content || null; // 返回生成的内容
        } finally {
            release(); // 确保释放信号量
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