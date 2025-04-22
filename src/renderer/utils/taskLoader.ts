// composables/useTaskGraph.ts
import {ref, nextTick} from "vue";
import {useVueFlow} from "@vue-flow/core";
import {layoutWithElk} from "./elkLayout";
import type {TaskNode, TaskEdge, ITaskGraph} from "../types/ITaskGraph";
import {TaskScheduler} from '../types/task-scheduler'

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

export function useTaskGraph(projectName: string, id: string) {
    const nodes = ref<TaskNode[]>([]);
    const edges = ref<TaskEdge[]>([]);
    const isRunning = ref(false);
    const selectedLogs = ref('');
    const logInstRef = ref(null);
    const  logVisible = ref<boolean>(false);
    const {fitView,findNode} = useVueFlow({id:"test"});

    const loadedTasks = loadInternalPlugins();

    function buildGraph() {
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
                node.style= {backgroundColor: 'rgba(16, 185, 129, 0.5)'}

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

    const requirement: Requirement = {
        projectName,
        id
    };

    let scheduler ;

    async function layoutGraph(direction:string) {
        const result = await layoutWithElk(nodes.value, edges.value, findNode,direction)
        nodes.value = result.nodes
        edges.value = result.edges

        let taskGraph: ITaskGraph = {
            nodes: nodes.value,
            edges: edges.value
        }

        scheduler = new TaskScheduler(requirement,loadedTasks, taskGraph);
        scheduler.loadTaskStatus()
        nextTick(() => fitView());
    }



    const run = () => {
        isRunning.value = true;
        logVisible.value=true;
        scheduler.run().then(observable => {
            observable.subscribe({
                next: ({ output}) => updateLog( output),
                complete: () => {
                    isRunning.value = false;
                    console.log("所有任务执行完成！");
                },
            });
        });

    };

    const stop = async () => {
        isRunning.value = false;
    };

    const updateLog = (output: string) => {
        selectedLogs.value += output;
        nextTick(() => {
            logInstRef.value?.scrollTo?.({position: 'bottom', silent: true});
        });
    };



    return {
        nodes,
        edges,
        isRunning,
        logInstRef,
        selectedLogs,
        buildGraph,
        layoutGraph,
        stop,
        updateLog,
        requirement,
        loadedTasks,
        logVisible,
        run
    };
}