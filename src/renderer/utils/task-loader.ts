import {ref, nextTick} from "vue";
import type {TaskNode, TaskEdge, ITaskGraph} from "../types/ITaskGraph";

const tasks = import.meta.glob('../tasks/*.{ts,js}', {eager: true});

function optimizeDependencies(taskMap: Map<string, ITask>): Map<string, string[]> {
    const optimizedMap = new Map<string, string[]>();
    taskMap.forEach((task, taskName) => {
        const dependencies = task.dependencies();
        const optimizedDependencies = new Set<string>(dependencies);
        dependencies.forEach(dep => {
            const depTask = taskMap.get(dep);
            if (depTask) {
                const depDependencies = depTask.dependencies();
                depDependencies.forEach(depDep => {
                    if (optimizedDependencies.has(depDep)) {
                        optimizedDependencies.delete(depDep);
                    }
                });
            }
        });
        optimizedMap.set(taskName, Array.from(optimizedDependencies));
    });
    return optimizedMap;
}

function loadInternalPlugins(): ITask[] {

    const plugins: ITask[] = [];
    for (const path in tasks) {
        const module = tasks[path];
        const taskClass = Object.values(module)[0] as new () => ITask;
        plugins.push(new taskClass());
    }
    return plugins;
}

export function useTaskGraph(tasksFilter?: string[]) {
    const nodes = ref<TaskNode[]>([]);
    const edges = ref<TaskEdge[]>([]);

    let loadedTasks = loadInternalPlugins();

    if (tasksFilter) {
        loadedTasks = loadedTasks.filter(task => tasksFilter.includes(task.id()));
    }

    function buildNodes() {
        const taskMap = new Map<string, ITask>();
        loadedTasks.forEach(task => taskMap.set(task.id(), task));
        const taskDes = optimizeDependencies(taskMap);

        const levels = new Map<string, number>();

        function getLevel(taskName: string): number {
            if (levels.has(taskName)) return levels.get(taskName)!;
            const task = taskMap.get(taskName);
            if (!task) return 0;
            if (task.dependencies().length === 0) {
                levels.set(taskName, 0);
                return 0;
            }
            const maxDepLevel = Math.max(...task.dependencies().map(getLevel));
            levels.set(taskName, maxDepLevel + 1);
            return maxDepLevel + 1;
        }

        function toNode(task: ITask, parentNode?: string) {
            const node = {
                id: task.id(),
                label: task.name(),
                position: {x: 0, y: 0},
                data: {label: task.name(), status: 'wait'},
                sourcePosition: "right",
                targetPosition: "left",
            } as TaskNode;

            if (task.isGroup()) {
                node.data.isParent = true;
                node.style = {backgroundColor: 'rgba(16, 185, 129, 0.5)'}

            } else {
                node.type = 'task';
            }

            if (parentNode) {
                node.parentNode = parentNode;
            }
            return node;
        }

        loadedTasks.forEach(task => getLevel(task.id()));
        const sortedTasks = [...loadedTasks].sort((a, b) => getLevel(a.id()) - getLevel(b.id()));

        nodes.value = sortedTasks.flatMap(task => {
            const node = toNode(task);
            if (task.isGroup()) {
                const childNodes = task.children().map(child => toNode(child, task.id()));
                return [node, ...childNodes];
            }
            return node;
        });

        edges.value = [];
        sortedTasks.forEach(task => {
            const taskId = task.id();
            const taskDeps = taskDes.get(taskId) ?? [];

            taskDeps.forEach(dep => {
                if (taskMap.has(dep)) {
                    edges.value.push({
                        id: `edge-${dep}-${taskId}`,
                        source: dep,
                        target: taskId,
                        markerEnd: "arrowclosed",
                    });
                }
            });

            if (task.isGroup()) {
                const children = task.children();
                const childIdSet = new Set(children.map(c => c.id()));
                children.forEach(child => {
                    const childDeps = child.dependencies();
                    const childId = child.id();
                    childDeps.forEach(dep => {
                        if (childIdSet.has(dep)) {
                            edges.value.push({
                                id: `edge-${dep}-${childId}`,
                                source: dep,
                                target: childId,
                                markerEnd: "arrowclosed",
                            });
                        }
                    });
                });
            }
        });
    }

    return {
        nodes,
        edges,
        buildNodes
    };
}