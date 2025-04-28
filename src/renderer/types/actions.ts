
export const actions: Record<string, Action> = {
    TEXT_INPUT: {
        type: 'TEXT_INPUT',
        name: '录入需求',
        component: () => import('../pages/actions/RequirementInput.vue'),
    },
    FILE_IMPORT: {
        type: 'FILE_IMPORT',
        name: '文件导入',
        component: () => import('../pages/actions/FileImportAction.vue'),
    },
    DIR_SELECT: {
        type: 'DIR_SELECT',
        name: '目录选择',
        component: () => import('../pages/actions/DirSelectAction.vue'),
    }
}

export const getAction = (type: string): Action | undefined => actions[type]