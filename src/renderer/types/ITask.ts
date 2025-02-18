import  { Observable,Subject } from "rxjs";
import OpenAI from "openai";
import { ElectronAPI } from '../utils/electron-api.ts';
import { settings, loadSettings } from '../utils/settings.ts';

// 定义任务接口
export interface ITask  {
    name(): string;
    execute(): Observable<string>;
    dependencies(): string[];

}



// 基础任务类
export abstract class Task implements ITask {
    private client: OpenAI | null = null;

    private getClient(): OpenAI {
        if (!this.client) {
            this.client = new OpenAI({
                apiKey: settings.apiKey || "",
                baseURL: settings.apiUrl || "https://api.openai.com/v1",
                dangerouslyAllowBrowser: true,
            });
        }
        return this.client;
    }


    async readPrompt(promptPath: string): Promise<string> {
        let fullPath = `src/prompts/${promptPath}`
        const content = await ElectronAPI.readAppFile(fullPath);
        return content;
    }

    async readResult(resultPath: string): Promise<string> {
        const content = await ElectronAPI.readUserFile(resultPath);
        return content;
    }

    async writeResult(resultPath: string, content: string): Promise<string> {
        const result = await ElectronAPI.writeUserFile(resultPath, content);
        return result;
    }

    protected async *streamChat(sysPrompt: string, userIdea: string): AsyncGenerator<string>{
        await loadSettings(); // 确保 settings 加载完成
        const client = this.getClient();
        const chatCompletion = await client.chat.completions.create({
            messages: [
                {role: 'system', content: sysPrompt},
                {role: 'user', content: userIdea}
            ],
            model: settings.modelName,
            max_tokens: parseInt(settings.maxToken) || 2000,
            temperature: this.temperature(),
            stream: true
        });

        for await (const chunk of chatCompletion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                yield content; // 逐步产出数据
            }
        }
    }

    public async chat(sysPrompt: string, userIdea: string): Promise<string | null> {
        try {
            return await this.innerChat(sysPrompt, userIdea);
        } catch (e) {
            console.error("====chat error : =====\n\n", e);
            // 重试一次
            return await this.innerChat(sysPrompt, userIdea);
        }
    }


    protected extractCode(str: string | null): string {
        if (!str) {
            return '';
        }
        // 先去掉特定的代码标识，如 ```json, ```sql, ```mermaid
        str = str.replace(/```(json|sql|mermaid)/g, "```");

        // 正则匹配 ``` 包裹的代码
        const match = str.match(/```[\r\n]?([\s\S]*?)```/);

        return match ? match[1].trim() : str;
    }

    private async innerChat(sysPrompt: string, userIdea: string): Promise<string | null> {

        await loadSettings(); // 确保 settings 加载完成
        const client = this.getClient();

        const chatCompletion = await client.chat.completions.create({
            messages: [
                {role: 'system', content: sysPrompt},
                {role: 'user', content: userIdea}
            ],
            model: settings.modelName,
            max_tokens: parseInt(settings.maxToken) || 2000,
            // model: 'deepseek-reasoner',
            temperature: this.temperature(),
        });

        return chatCompletion.choices[0].message.content;
    }

    protected temperature(): number {
        return 1.99;
    }


    abstract name(): string;

    protected outputStream = new Subject<string>(); // 用于流式输出


    // 任务执行逻辑 (需子类实现)
    abstract execute(): Observable<string>;

    dependencies(): string[] {
        return [];
    }
}