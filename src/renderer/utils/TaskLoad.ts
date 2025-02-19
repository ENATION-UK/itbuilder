import type {ITask} from "../types/ITask.ts";

export function optimizeTaskMap(taskMap: Map<string, ITask>): Map<string, string[]> {
    // 用一个缓存对象存储每个任务的优化后依赖关系
    const optimizedDepsCache = new Map<string, Set<string>>();

    // 递归函数：查找一个任务的所有间接依赖
    function getAllDependencies(taskName: string): Set<string> {
        if (optimizedDepsCache.has(taskName)) {
            return optimizedDepsCache.get(taskName)!;
        }

        const task = taskMap.get(taskName);
        if (!task) {
            return new Set();
        }

        // 获取任务的直接依赖
        let allDeps = new Set<string>(task.dependencies());

        // 遍历直接依赖，递归地获取它们的间接依赖
        task.dependencies().forEach((dep) => {
            getAllDependencies(dep).forEach((depOfDep) => {
                allDeps.add(depOfDep);
            });
        });

        optimizedDepsCache.set(taskName, allDeps);
        return allDeps;
    }

    // 构建优化后的依赖关系图
    const optimizedMap = new Map<string, string[]>();

    taskMap.forEach((task) => {
        const taskName = task.id();
        const allDeps = getAllDependencies(taskName);

        // 从间接依赖中移除直接依赖
        const directDeps = new Set(task.dependencies());
        const optimizedDeps = Array.from(allDeps).filter((dep) => !directDeps.has(dep));

        optimizedMap.set(taskName, optimizedDeps);
    });

    return optimizedMap;
}

export {}