declare interface FileInfo {
    name: string;
    path: string;
    type: 'file' | 'directory';
}

// 定义任务接口
declare interface ITask  {
    id(): string;
    name(): string;
    execute(): Observable<string>;
    dependencies(): string[];
    setRequirement(requirement: Requirement):void;
}

declare interface Project{
    name: string;
    requirement: string;
    framework: string[];

}

declare interface Requirement{
    projectName: string;
    id: string;
}

interface FunctionInfo {
    path: string;
    description: string;
    functions: string[];
}

interface ModuleInfo {
    moduleName: string;
    codes: FunctionInfo[];
}

// 封装对象
interface FileContent {
    path: string;
    content: string;
}