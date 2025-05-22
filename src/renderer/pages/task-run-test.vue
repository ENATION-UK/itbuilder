<script setup  lang="ts">
import {ScanCode} from "../tasks/scan-code";
import {FeatureDev} from "../tasks/feature-dev";
import {ElectronAPI} from "../utils/electron-api";
import {Architecture} from "../tasks/feature/architecture";
import {CodeChange} from "../tasks/feature/code-change";
import {FolderFilter} from "../tasks/feature/folder-filter";
import {ScanFolder} from "../tasks/scan-folder";

import {generateDirectoryLineGraph} from "../utils/FolderScan";

const requirement: Requirement = {
  projectName:"的",
  id:"2",
  module:"内容创作及发布模块"
};
const codeChange = new CodeChange();
codeChange.setRequirement(requirement)


const act = new Architecture();
act.setRequirement(requirement)

const scanTest = new ScanCode();
scanTest.setRequirement(requirement)

const devTask = new FeatureDev();
devTask.setRequirement(requirement)

const folderScanTask = new ScanFolder();
folderScanTask.setRequirement(requirement)

const folderFilterTask = new FolderFilter();
folderFilterTask.setRequirement(requirement)



async function changeFun() {
  await codeChange.execute().subscribe((data) => {
    console.log(data);
  });
}
async function actFun() {
  await act.execute().subscribe((data) => {
    console.log(data);
  });
}

async function scan() {
  await scanTest.execute().subscribe((data) => {
    console.log(data);
  });
}

async function write() {
  await devTask.execute().subscribe((data) => {
    console.log(data);
  });
}

async function folderFilter() {
  await folderFilterTask.execute().subscribe((data) => {
    console.log(data);
  });
}


const save = async () => {
  await ElectronAPI.saveIndex();
  console.log("save success")

};

const folderScan = async () => {
  await folderScanTask.execute().subscribe((data) => {
    console.log(data);
  });

};
</script>

<template>
 <button @click="scan">scan</button>
 <button @click="folderScan">扫描目录</button>
 <button @click="folderFilter">目录过滤</button>
 <button @click="write">write</button>
 <button @click="actFun">架构</button>
 <button @click="changeFun">查找代码变动</button>
 <button @click="save">save</button>
</template>


<style>
button{
  margin: 20px;
  padding: 10px;
}

</style>