export interface TaskNode {
    id: string;
    label: string;
    position: { x: number; y: number };
    data: {
        label: string;
        isParent: boolean;
        status: 'wait' | 'running' | 'completed'; // 假设 status 可能有多种状态
    };
    type: 'task';
    style:object;
    sourcePosition: 'right'; // 右侧出线
    targetPosition: 'left'; // 左侧进线
}

export interface TaskEdge {
    id: string;
    source: string;
    target: string;
    markerEnd: string;
}

export interface ITaskGraph {
    nodes: TaskNode[];
    edges: TaskEdge[];
}