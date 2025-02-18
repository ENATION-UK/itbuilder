export interface TextRequirement {
    detail: string
    languages: string
    project_id: string
}

export interface ProjectResult{
    current_step: string,
    log:string,
    analysis: DevStep,
    architecture: DevStep,
    code: DevStep,
    doc: DevStep
}

export interface DevStep{
    name: string,
    status: string,
    percentage: number
}

export const DevStepEnum = {
  'analysis': 1,
  'architecture': 2,
  'code': 3,
  'doc': 4
}