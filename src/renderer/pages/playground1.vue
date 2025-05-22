<script setup  lang="ts">


import {searchCode} from "../utils/SourceCodeSearch";
import {ElectronAPI} from "../utils/electron-api";




const run = async () => {
   // await search("用户注册登录时增加人机校验");
  const req=`
2、新增比价功能：
1)商家端，商品上架流程，新增京东/天猫对应商品链接、商品参考价及截图字段；
2)平台端，商品审批增加溢价阈值设置，商品审批列表新增溢价阈值过滤条件。可一件筛选出超过溢价阀值数据；
3)会员PC端、H5端增加一个京东/天猫参考价。
  `;
   const sourceCodes = await searchCode(req);
   console.log(sourceCodes)

};


</script>

<template>

 <button @click="run">search</button>
</template>
<style>

button{
  width: 100px;
  height: 40px;
  margin: 10px;
}
</style>