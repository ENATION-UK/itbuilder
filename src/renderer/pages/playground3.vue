<script setup  lang="ts">
// 浏览器中通过 CDN 引入时，hnswlib 是全局变量
// 若使用 npm，需改为：import * as hnswlib from "hnswlib-wasm";
import { loadHnswlib } from 'hnswlib-wasm';
async function main() {
  // 初始化 HNSW 索引
  const hnswlib = await loadHnswlib();


  // 定义参数
  const dim = 128;        // 向量维度
  const maxElements = 100; // 最大元素数量
  const M = 16;           // HNSW 参数：层间连接数
  const efConstruction = 200; // 构建时的搜索范围
  const efSearch = 50;    // 搜索时的范围

  // 创建索引
  const index = new hnswlib.HierarchicalNSW("cosine", dim,"test.dat");
  index.initIndex(maxElements, M, efConstruction, 0);

  // 添加随机向量（示例）
  const numVectors = 10;
  const data = [];
  for (let i = 0; i < numVectors; i++) {
    const vec = new Float32Array(dim);
    for (let j = 0; j < dim; j++) {
      vec[j] = Math.random();
    }
    data.push(vec);
    index.addPoint(vec, i,true); // 第二个参数是唯一标识符（如 ID）
  }

  // 设置搜索参数
  index.setEfSearch(efSearch);

  // 执行搜索（查询最接近第 0 号向量的结果）
  const query = data[0];
  const k = 3; // 返回 Top-3 结果
  const result = index.searchKnn(query, k,undefined);

  console.log("搜索结果:", result);
  // 输出示例: { distances: Float32Array(3), neighbors: Uint32Array(3) }
}

main().catch(console.error);

</script>

<template>
 <button @click="main">run</button>
</template>
<style>


</style>