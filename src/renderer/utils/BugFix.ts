import OpenAI from "openai";
import { ElectronAPI } from "./electron-api";
import { ChatCompletionMessageParam } from "openai/resources/chat";
import {functionChat} from "./ModelCall";
// 定义函数
const functions: OpenAI.Chat.ChatCompletionCreateParams.Function[] = [
    {
        name: "writeSourceFiles",
        description: "批量写入:将源码内容写入到相应的文件路径",
        parameters: {
            type: "object",
            properties: {
                sourceFiles: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            path: { type: "string", description: "源码文件的路径" },
                            content: { type: "string", description: "源码文件的内容" },
                        },
                        required: ["path", "content"],
                    },
                },
            },
            required: ["sourceFiles"],
        },
    },
    {
        name: "getCodeContent",
        description: "获取文件内容",
        parameters: {
            type: "object",
            properties: {
                path: { type: "string", description: "代码文件路径" },
            },
            required: ["path"],
        },
    },
];



// 读取代码内容
async function getCodeContent(path: string) {
    try {
        const fullPath = await   ElectronAPI.pathJoin("test4",path)
        console.log(`调用获取代码内容: ${fullPath}`);
        return await ElectronAPI.readUserFile(fullPath);
    } catch (error) {
        console.error("获取代码内容时出错:", error);
        return "获取代码内容时出错";
    }
}

// 写入代码文件
async function writeSourceFiles(sourceFiles: { path: string; content: string }[]) {
    try {
        for (const file of sourceFiles) {
            const fullPath = await   ElectronAPI.pathJoin("test4",file.path)
            await ElectronAPI.writeUserFile(fullPath, file.content);
            console.log(`成功写入文件: ${file.path}`);
            console.log(`写入内容: ${file.content}`);
        }
        return "所有文件写入成功";
    } catch (error) {
        console.error("写入文件时出错:", error);
        return "写入文件时出错";
    }
}
// 处理 function call 逻辑的回调
async function executeFunctionCall(name: string, args: any): Promise<string> {
    try {
        switch (name) {
            case "getCodeContent":
                return await getCodeContent(args.path);
            case "writeSourceFiles":
                return await writeSourceFiles(args.sourceFiles);
            default:
                return "未知的函数调用";
        }
    } catch (error) {
        console.error(`执行函数 ${name} 出错:`, error);
        return `执行 ${name} 出错`;
    }
}
// 主入口
export async function fix(bug: string) {
    try {
        const sysPrompt = await ElectronAPI.readAppFile("prompts/exe-bug-fix.txt");
        // const userInput = await ElectronAPI.readAppFile("mock/bug.txt");

        const messages: ChatCompletionMessageParam[] = [
            { role: "system", content: sysPrompt },
            { role: "user", content: bug },
        ];

        await functionChat(messages,functions,executeFunctionCall)

    } catch (error) {
        console.error("程序执行出错:", error);
    }
}