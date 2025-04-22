import ELK from 'elkjs/lib/elk.bundled.js'
import {Position} from "@vue-flow/core";

const elk = new ELK()

interface FlowNode {
    id: string
    width?: number
    height?: number
    data?: {
        isParent?: boolean
        [key: string]: any
    }
    parentNode?: string
    [key: string]: any
}

interface FlowEdge {
    id: string
    source: string
    target: string
    [key: string]: any
}

export async function layoutWithElk(nodes: FlowNode[], edges: FlowEdge[],findNode,direction:string): Promise<{ nodes: FlowNode[]; edges: FlowEdge[] }> {

    const isHorizontal = direction === 'RIGHT' || direction === 'LEFT'
    // 构建树状结构
    const nodeMap = new Map<string, any>()
    const childrenMap = new Map<string, any[]>()


    nodes.forEach((node) => {
        const graphNode = findNode(node.id)
        nodeMap.set(node.id, {
            id: node.id,
            width: graphNode?.dimensions?.width || 150,
            height: graphNode?.dimensions?.height || 50,
            children: []
        })
    })

    // console.log(nodeMap)
     // 组织父子结构
    nodes.forEach((node) => {
        const parentId = node.parentNode
        if (parentId && nodeMap.has(parentId)) {
            if (!childrenMap.has(parentId)) childrenMap.set(parentId, [])
            childrenMap.get(parentId)!.push(node.id)
        }
    })

    // 组装 children
    childrenMap.forEach((childIds, parentId) => {
        const parent = nodeMap.get(parentId)
        childIds.forEach((childId) => {
            const child = nodeMap.get(childId)
            parent.children.push(child)
        })
    })

    // 顶层节点（不在任何父节点中）
    const topLevelNodes = nodes
        .filter((n) => !n.parentNode)
        .map((n) => nodeMap.get(n.id))

    // 构造 ELK 输入图
    const elkGraph = {
        id: 'root',
        layoutOptions: {
            'elk.algorithm': 'org.eclipse.elk.layered',
            'elk.direction': direction,
            'elk.layered.spacing.nodeNodeBetweenLayers': 80,
            'elk.spacing.nodeNode': '80',
        },
        children: topLevelNodes,
        edges: edges.map((e) => ({
            id: e.id,
            sources: [e.source],
            targets: [e.target]
        }))
    }

    // 执行布局
    const result = await elk.layout(elkGraph)
    // 扁平化布局结果
    const flatNodes: FlowNode[] = []

    function collectPositions(node: any, parentId?: string) {
        const originalNode = nodes.find((n) => n.id === node.id)!

        // 判断是否是父节点
        const isParent = originalNode?.isParent

        // 如果是子节点，y 位置下移 30；如果是父节点，高度增加 30
        const adjustedY = parentId ? (node.y || 0) + 30 : node.y || 0
        const adjustedHeight = isParent ? (node.height || 0) + 30 : node.height

        let sourcePosition, targetPosition

        if (originalNode?.parentNode) {
            // 子节点固定方向
            targetPosition = Position.Left
            sourcePosition = Position.Right
        } else {
            // 父节点按 direction 设置
            targetPosition = isHorizontal ? Position.Left : Position.Top
            sourcePosition = isHorizontal ? Position.Right : Position.Bottom
        }

        if (node.id !== 'root') {
            flatNodes.push({
                ...originalNode,
                position: { x: node.x || 0, y: adjustedY },
                width: node.width,
                height: adjustedHeight,
                parentNode: parentId,
                sourcePosition,
                targetPosition,
            })
        }



        if (node.children) {
            node.children.forEach((child: any) => {
                collectPositions(child, node.id === 'root' ? undefined : node.id)
            })
        }
    }

    collectPositions(result)

    return {
        nodes: flatNodes,
        edges
    }
}