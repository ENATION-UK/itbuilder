import  {OpenAI} from 'openai';
import {ChatCompletionMessage, ChatCompletionMessageParam} from 'openai/resources/chat';
import {loadSettings, settings} from "./settings";
import {KeyManager} from "./KeyManager";


// 配置项
const MODEL = "qwen-plus";
const MAX_TOKENS = 8192;

/**
 * 处理 function call 并调用回调执行相应函数
 * @param messages 消息队列
 * @param functions 提供给大模型的 function 定义
 * @param executeFunction 用户自定义的回调函数，接收 function_name 和 args，并返回执行结果
 * @returns 返回最终的 function_call 结果
 */
export async function functionChat(
    messages: ChatCompletionMessageParam[],
    functions:  OpenAI.Chat.ChatCompletionCreateParams.Function[],
    executeFunction: (functionName: string, args: any) => Promise<string>
) {
    await loadSettings(); // 确保 settings 加载完成
    const keyManager = new KeyManager(settings.apiKey);
    const {client, release} = await keyManager.getClient();

    try {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const response = await client.chat.completions.create({
                model: MODEL,
                messages: messages,
                max_tokens: MAX_TOKENS,
                functions: functions,
            });

            const resultMessage = response.choices[0].message;
            messages.push(resultMessage);

            // 如果没有 function_call，直接返回最终结果
            if (!resultMessage.function_call) {
                console.log("最终响应:", resultMessage.content);
                return resultMessage;
            }

            // 解析 function_call 逻辑
            const {name, arguments: args} = resultMessage.function_call;
            const parsedArgs = JSON.parse(args);

            // 通过回调执行 function_call
            const functionResult = await executeFunction(name, parsedArgs);

            // 将 function_call 结果加入 messages
            messages.push({
                role: "function",
                name: name,
                content: functionResult,
            });
        }
    } finally {
        release(); // 确保释放信号量
    }

}

export async function* streamChat(sysPrompt: string, userIdea: string): AsyncGenerator<string> {

    const {client, release} = await this.keyManager.getClient();

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


export async function chat(sysPrompt: string, userIdea: string): Promise<string | null> {
    try {
        return await this.innerChat(sysPrompt, userIdea);
    } catch (e) {
        // 重试一次
        return await this.innerChat(sysPrompt, userIdea);
    }
}

async function innerChat(sysPrompt: string, userIdea: string): Promise<string | null> {
    const {client, release} = await this.keyManager.getClient(); // 获取客户端，并控制并发

    try {
        const chatCompletion = await client.chat.completions.create({
            messages: [
                {role: 'system', content: sysPrompt},
                {role: 'user', content: userIdea}
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
