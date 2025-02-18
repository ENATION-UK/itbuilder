<template>
    about
</template>
<script setup lang="ts">
// 定义任务接口
export interface ITask {
  name(): string;
  dependencies(): string[];
}

// 任务类实现
class Task implements ITask {
  constructor(private taskName: string, private deps: string[]) {}

  name(): string {
    return this.taskName;
  }

  dependencies(): string[] {
    return this.deps;
  }
}

// 任务实例
const tasks: ITask[] = [
  new Task("RequirementsAnalyst", []),
  new Task("DatabaseDesign", ["RequirementsAnalyst"]),
  new Task("DefiningStandards", ["RequirementsAnalyst"]),
  new Task("ApiDesign", ["RequirementsAnalyst", "DatabaseDesign"]),
  new Task("ApiDeveloper", ["RequirementsAnalyst", "DefiningStandards", "DatabaseDesign"]),
];

// 任务映射
const taskMap = new Map<string, ITask>();
tasks.forEach((task) => taskMap.set(task.name(), task));
function optimizeDependencies(taskMap: Map<string, ITask>): Map<string, string[]> {
  const optimizedMap = new Map<string, string[]>();

  // 遍历每个任务
  taskMap.forEach((task, taskName) => {
    const dependencies = task.dependencies();
    const optimizedDependencies = new Set<string>(dependencies);

    // 遍历每个依赖关系
    dependencies.forEach(dep => {
      // 获取依赖任务的依赖关系
      const depTask = taskMap.get(dep);
      if (depTask) {
        const depDependencies = depTask.dependencies();

        // 检查当前任务的依赖是否可以通过依赖任务的依赖关系间接满足
        depDependencies.forEach(depDep => {
          if (optimizedDependencies.has(depDep)) {
            optimizedDependencies.delete(depDep);
          }
        });
      }
    });

    // 将优化后的依赖关系存入新的 Map
    optimizedMap.set(taskName, Array.from(optimizedDependencies));
  });

  return optimizedMap;
}


// 测试优化依赖关系
const optimizedDependencies = optimizeDependencies(taskMap);

// 打印结果
optimizedDependencies.forEach((deps, taskName) => {
  console.log(`${taskName}: ${deps.join(", ")}`);
});
</script>