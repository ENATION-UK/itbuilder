import {env, FeatureExtractionPipeline, pipeline} from '@huggingface/transformers';
import {Tensor} from "@huggingface/transformers/types/utils/tensor";
import IpcMainInvokeEvent = Electron.IpcMainInvokeEvent;

const EMBEDDING_TASK = "feature-extraction";

class EmbeddingsPipeline {
    static readonly model: string = 'Qwen3-Embedding-0.6B-ONNX';
    private static instance: FeatureExtractionPipeline | null = null;

    static async getInstance(): Promise<FeatureExtractionPipeline> {
        if (this.instance === null) {
            // Dynamically import the Transformers.js library
            // Error: Could not dynamically require "../bin/napi-v3/darwin/arm64/onnxruntime_binding.node"
            // let { pipeline, env } = await import('@huggingface/transformers');

            // NOTE: Uncomment this to change the cache directory
            // env.cacheDir = './.cache';

            env.allowLocalModels = true; // 允许使用本地模型
            env.allowRemoteModels = false; // 禁用远程模型下载
            env.localModelPath = '/Users/johnzhang/git-repo/'; // 设置本地模型路径

            this.instance = await pipeline<typeof EMBEDDING_TASK>(EMBEDDING_TASK, this.model, {
                // quantized: true, // 明确使用量化模型: model_quantized.onnx
                // model_file_name: "model",
                dtype: 'q8',
                // device: 'gpu'    //如果支持
            });
        }
        return this.instance;
    }
}

async function runEmbedding(event: IpcMainInvokeEvent, text: string | string[]): Promise<any> {
    const extractor = await EmbeddingsPipeline.getInstance();
    const result: Tensor = await extractor(text, {pooling: 'mean', normalize: true});
    console.log(result);
    return {
        data: result.data,
        size: result.size,
        location: result.location,
    };
}

export { runEmbedding };
