<script setup  lang="ts">

import { ScanCode } from '../tasks/scan-code'
import {getEmbedding,findMostSimilar} from "../utils/ModelCall";
import {ElectronAPI} from "../utils/electron-api";

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
// 初始化一次：生成每个文档的 embedding（可以保存到本地 JSON 文件）
async function indexDocs(docs) {


  const cachePath = '/Users/wangfeng/Library/Application Support/itBuilder/Projects/的/workspace/rag/docs-embeddings.json';

  try {
    const cache = await ElectronAPI.readFile(cachePath);
    const parsed = JSON.parse(cache);
    console.log("找到直接使用")
    return parsed;
  } catch (err) {
    console.log("未找到缓存文件，重新生成 embeddings...");
  }

  for (let doc of docs) {
    doc.embedding = await getEmbedding(doc.text);
  }

  await ElectronAPI.writeFile(cachePath, JSON.stringify(docs, null, 2));
  return docs;
}

const requirement: Requirement = {
  projectName:"的",
  id:"1",
  module:"内容创作及发布模块"
};

const task = new ScanCode();
task.setRequirement(requirement)


async function search(query) {
  let queryEmbedding = await getEmbedding(query);
  const enrichedDocs = await indexDocs(docs);  // 真实应用中提前生成 & 存储


  // 2. 将文档向量添加到索引
  for (const doc of enrichedDocs) {
    const idx = enrichedDocs.indexOf(doc);

    await ElectronAPI.addVector(idx, doc.embedding)

  }
  //
  let results = findMostSimilar(queryEmbedding, enrichedDocs);
  console.log("匹配结果1：", results);

  // 4. 执行搜索
  const results2 = await ElectronAPI.searchVector(queryEmbedding, 5)

  // 4. 执行搜索
  const { neighbors, distances } = results2.result;

  results = neighbors.map((docIndex, rank) => ({
    doc: docs[docIndex],
    similarity: 1 - distances[rank], // 余弦相似度转换
    rank: rank + 1
  }));

  results.forEach(res => {
    console.log(`[相似度 ${res.similarity.toFixed(3)}] ${res.doc.id}: ${res.doc.text}`);
  });

}



const run1 = async () => {
  await task.execute().subscribe((data) => {
    console.log(data);
  });
};




const run = async () => {
   await search("用户注册登录时增加人机校验");

};


</script>

<template>
 <button @click="run">run</button>
</template>
<style>


</style>