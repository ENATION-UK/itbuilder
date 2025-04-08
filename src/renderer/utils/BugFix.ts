import OpenAI from "openai";
import { ElectronAPI } from "./electron-api";
import { ChatCompletionMessageParam } from "openai/resources/chat";
import {functionChat} from "./ModelCall";
// 定义函数
const functions: OpenAI.Chat.ChatCompletionCreateParams.Function[] = [
    {
        name: "writeCode",
        description: "写入源码，将源码内容写入到相应的文件路径",
        parameters: {
            type: "object",
            properties: {
                path: { type: "string", description: "源码文件的路径" },
                content: { type: "string", description: "源码文件的内容" },
            },
            required: ["path", "content"],
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
        // const fullPath = await   ElectronAPI.pathJoin("test4",path)
        console.log(`调用获取代码内容: ${path}`);
        return await ElectronAPI.readFile(path);
    } catch (error) {
       // console.error("获取代码内容时出错:", error);
        // throw new Error("获取代码内容时出错:"); // 直接抛出错误，阻止后续执行
        console.log(`文件不存在: ${path}`)
        return "文件不存在";
    }
}

// 写入代码文件
async function writeSourceFile( path: string,content: string ) {
    try {

            // const fullPath = await   ElectronAPI.pathJoin("test4",file.path)
            await ElectronAPI.writeFile(path, content);
            console.log(`成功写入文件: ${path}`);
            console.log(`写入内容: ${content}`);

        return "所有文件写入成功";
    } catch (error) {
        console.error("写入文件时出错:", error);
        throw new Error("写入文件时出错");
    }
}
// 处理 function call 逻辑的回调
async function executeFunctionCall(name: string, args: any): Promise<string> {
    try {
        switch (name) {
            case "getCodeContent":
                return await getCodeContent(args.path);
            case "writeCode":
                return await writeSourceFile(args.path, args.content);
            default:
                return "未知的函数调用";
        }
    } catch (error) {
        console.error(`执行函数 ${name} 出错:`, error);
        return `执行 ${name} 出错`;
    }
}

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