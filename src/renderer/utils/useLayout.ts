import dagre from '@dagrejs/dagre'
import { Position, useVueFlow } from '@vue-flow/core'
import { ref } from 'vue'

export function useLayout() {
    const { findNode } = useVueFlow()

    const graph = ref(new dagre.graphlib.Graph())
    const previousDirection = ref('LR')

    function layout(nodes, edges, direction) {
        const dagreGraph = new dagre.graphlib.Graph()
        graph.value = dagreGraph
        dagreGraph.setDefaultEdgeLabel(() => ({}))

        const isHorizontal = direction === 'LR'
        dagreGraph.setGraph({ rankdir: direction })

        const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]))

        // Step 1: Top-level layout (for parent & leaf nodes)
        for (const node of nodes) {
            if (node.parentNode) continue // skip child nodes

            const graphNode = findNode(node.id)
            dagreGraph.setNode(node.id, {
                width: graphNode?.dimensions?.width || 150,
                height: graphNode?.dimensions?.height || 50,
            })
        }

        for (const edge of edges) {
            // only add edge if both nodes are top-level
            if (!nodeMap[edge.source]?.parentNode && !nodeMap[edge.target]?.parentNode) {
                dagreGraph.setEdge(edge.source, edge.target)
            }
        }

        dagre.layout(dagreGraph)

        const resultNodes = nodes.map((node) => {
            const basePos = dagreGraph.node(node.id)
            return {
                ...node,
                targetPosition: isHorizontal ? Position.Left : Position.Top,
                sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
                position: basePos ? { x: basePos.x, y: basePos.y } : node.position,
            }
        })
// Step 2: Layout child nodes within each parent
        const parentNodes = resultNodes.filter((n) => n.data?.isParent)
        for (const parent of parentNodes) {
            const children = resultNodes.filter((n) => n.parentNode === parent.id)
            if (children.length === 0) continue

            const childGraph = new dagre.graphlib.Graph()
            childGraph.setGraph({ rankdir: direction })
            childGraph.setDefaultEdgeLabel(() => ({}))

            for (const child of children) {
                const graphNode = findNode(child.id)
                childGraph.setNode(child.id, {
                    width: graphNode?.dimensions?.width || 120,
                    height: graphNode?.dimensions?.height || 40,
                })
            }

            dagre.layout(childGraph)

            // let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
            //
            // for (const child of children) {
            //     const layoutPos = childGraph.node(child.id)
            //     if (!layoutPos) continue
            //
            //     child.__layoutPos = layoutPos // 暂存，用于偏移计算
            //
            //     const w = child.width ?? 120
            //     const h = child.height ?? 40
            //
            //     minX = Math.min(minX, layoutPos.x - w / 2)
            //     minY = Math.min(minY, layoutPos.y - h / 2)
            //     maxX = Math.max(maxX, layoutPos.x + w / 2)
            //     maxY = Math.max(maxY, layoutPos.y + h / 2)
            // }
            //
            // const padding = 40
            // const contentWidth = maxX - minX
            // const contentHeight = maxY - minY
            //
            // // 更新父节点宽高
            // parent.style = {
            //     ...parent.style,
            //     width: contentWidth + padding,
            //     height: contentHeight + padding,
            // }
            //
            // // 子节点偏移，使其在父节点内部居中
            // const topLeftX = parent.position.x - (contentWidth + padding) / 2
            // const topLeftY = parent.position.y - (contentHeight + padding) / 2
            //
            // for (const child of children) {
            //     const layoutPos = child.__layoutPos
            //     child.position = {
            //         x: topLeftX + (layoutPos.x - minX),
            //         y: topLeftY + (layoutPos.y - minY),
            //     }
            //     delete child.__layoutPos
            // }
        }
        return resultNodes
    }

    return { graph, layout, previousDirection }
}

export {}