import {OpenAI} from "openai";
import {loadSettings, settings} from "./settings";
// Semaphore 类用于控制并发
class Semaphore {
    private queue: (() => void)[] = [];
    private activeCount = 0;
    private maxConcurrency: number;

    constructor(maxConcurrency: number) {
        this.maxConcurrency = maxConcurrency;
    }

    async acquire(): Promise<void> {
        if (this.activeCount < this.maxConcurrency) {
            this.activeCount++;
            return;
        }

        // 等待前面任务释放信号量
        await new Promise<void>((resolve) => {
            this.queue.push(resolve);
        });
        this.activeCount++;
    }

    release(): void {
        this.activeCount--;
        if (this.queue.length > 0) {
            // 释放信号量给等待的任务
            const resolve = this.queue.shift();
            if (resolve) resolve();
        }
    }
}

// KeyManager 类用于管理所有的 API keys
export class KeyManager {
    private keys: string[];
    private keyIndex = 0;
    private semaphores: Map<string, Semaphore> = new Map();

    constructor(keys: string[]) {
        this.keys = keys;
        // 为每个 key 创建一个信号量
        keys.forEach((key) => {
            this.semaphores.set(key, new Semaphore(2)); // 每个 key 的并发数为 2
        });
    }

    // 获取下一个 key，轮询方式
    private getNextKey(): string {
        const key = this.keys[this.keyIndex];
        this.keyIndex = (this.keyIndex + 1) % this.keys.length;
        return key;
    }

    // 获取客户端，确保每个请求都在合适的并发限制内
    async getClient(): Promise<{ client: OpenAI; release: () => void }> {
        const key = this.getNextKey();

        const semaphore = this.semaphores.get(key);
        if (semaphore) {
            await semaphore.acquire();
            const client = new OpenAI({
                apiKey: key,
                baseURL: settings.apiUrl || "https://api.openai.com/v1",
                dangerouslyAllowBrowser: true,
            });

            return {
                client,
                release: () => semaphore.release() // 使用完后释放信号量
            };
        }
        throw new Error('No API key available');
    }
}