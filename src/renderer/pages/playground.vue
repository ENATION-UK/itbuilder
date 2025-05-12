<script setup  lang="ts">

import { ScanCode } from '../tasks/scan-code'
import {getEmbedding,findMostSimilar} from "../utils/ModelCall";

import { loadHnswlib } from 'hnswlib-wasm';
import {ElectronAPI} from "../utils/electron-api";
// 余弦相似度
function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}
// 假设你已经分析源码，保存这些信息
const docs = [
  { id: "ProductList.vue", text: "展示商品列表，包括搜索、筛选、分页功能" },
  { id: "Cart.vue", text: "处理用户购物车，包含添加、删除商品" },
  { id: "Order.vue", text: "订单结算页面，计算订单价格，处理支付" },
  { id: "ProductDetail.vue", text: "展示商品详情，包含图片、描述、规格信息" },
  { id: "Login.vue", text: "用户登录页面，验证用户名和密码" },
  { id: "Register.vue", text: "用户注册页面，输入个人信息并提交" },
  { id: "UserProfile.vue", text: "展示和编辑用户个人资料，包括头像和联系方式" },
  { id: "SearchResult.vue", text: "根据关键词展示搜索结果，支持排序和筛选" },
  { id: "PaymentResult.vue", text: "显示支付结果，包括成功或失败提示" },
  { id: "AddressForm.vue", text: "填写和编辑收货地址，支持选择省市区" },
  { id: "Wishlist.vue", text: "收藏夹页面，展示用户喜欢的商品" },
  { id: "Review.vue", text: "用户评论模块，展示与提交评论内容" },
  { id: "AdminDashboard.vue", text: "管理员后台主页，概览订单和用户统计数据" },
  { id: "CategoryManagement.vue", text: "后台分类管理模块，添加、编辑、删除分类" },
  { id: "Inventory.vue", text: "库存管理页面，展示库存数量，支持调整库存" },
];
// 全量+余弦方法
async function bruteForceSearch(docs, query, k = 3) {
  const queryEmbedding = await getEmbedding(query);
  const scored = docs.map(doc => ({
    ...doc,
    embedding: doc.embedding,
    similarity: cosineSimilarity(doc.embedding, queryEmbedding),
  }));
  return scored.sort((a, b) => b.similarity - a.similarity).slice(0, k);
}

// HNSW方法
async function hnswSearch(docs, query, k = 3) {
  // 定义参数

  const maxElements = 100; // 最大元素数量
  const M = 16;           // HNSW 参数：层间连接数
  const efConstruction = 200; // 构建时的搜索范围
  const efSearch = 50;    // 搜索时的范围



  const dim = docs[0].embedding.length;
  const hnswlib = await loadHnswlib();
  const index = new hnswlib.HierarchicalNSW("cosine", dim,"test1.dat");
  index.initIndex(maxElements, M, efConstruction, 0);

  const vectors = docs.map(doc => doc.embedding);
  const ids = docs.map((_, i) => i);
  index.addItems(vectors, ids,true);
  // 设置搜索参数
  index.setEfSearch(efSearch);
  const queryEmbedding = await getEmbedding(query);
  const result = index.searchKnn(queryEmbedding, k,undefined);
  return result.neighbors.map(i => docs[i]);
}


const run = async () => {
  await ElectronAPI.addVector(1, Array(128).fill(0.5));  // 添加向量
  const res = await ElectronAPI.searchVector(Array(128).fill(0.5), 5);
  // console.log('搜索结果:', res);
  // await ElectronAPI.saveIndex();
};


</script>

<template>
 <button @click="run">run</button>
</template>
<style>


</style>