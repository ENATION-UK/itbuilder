import {actions} from './types/actions'  // 根据你的项目调整路径

export const flows: AIFlow[] = [
    {
        id: "start-from-scratch",
        name: '从零开始',
        tasks: ['RequirementsAnalyst', 'ProjectInit', 'Architecture', 'DocWrite', 'ApiDeveloper'],
        description: '从零开始创建一个项目',
        action: actions.TEXT_INPUT
    },
    {
        id: "import-project",
        name: '导入项目',
        tasks: ['RequirementsAnalyst', 'Architecture', 'DocWrite'],
        description: '导入一个现有项目，以便后续使用',
        action: actions.DIR_SELECT
    },
    {
        id: "requirement-change",
        name: '需求变更',
        tasks: ['RequirementsAnalyst', 'ProjectInit', 'Architecture'],
        description: '基于现有需求，针对新需求进行开发',
        action: actions.TEXT_INPUT
    }
]
