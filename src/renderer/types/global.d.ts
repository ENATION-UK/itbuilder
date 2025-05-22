declare interface FileInfo {
    name: string;
    path: string;
    type: 'file' | 'directory';
    isDirectory(): boolean;
    isFile(): boolean;

}

// 定义任务接口
declare interface ITask  {
    id(): string;
    name(): string;
    execute(): Observable<string>;
    dependencies(): string[];
    setRequirement(requirement: Requirement):void;
    isGroup(): boolean;
    children(): ITask[];
}

interface AIFlow {
    id: string;
    name: string;
    tasks: string[];
    description: string;
    action: Action;
    diagram?: string;
}

declare interface Action{
    type: string,
    name: string,
    component: () => Promise<any>
}

declare interface Project{
    name: string;
    requirement: string;
    framework: string[];

}

declare interface Requirement{
    projectName: string;
    id: string;
    module: string;
}


declare type SourceFolder = {
    id?: number;
    path: string;
    parent_path?: string | null;
    description?: string | null;
    keywords?: string[] | null;
    embedding?: number[] | null;
    module_id?: number;
    module_name?: string | null;
    type:string;
};


declare type SourceCode = {
    id: number;                // 自增主键
    module_id: number;         // 模块ID，默认值为0
    module?: string | null; // 模块名称，最多255字符，可为null
    module_name?: string | null; // 模块名称，最多255字符，可为null
    path?: string | null; // 源码路径，可为null
    type?: string | null; //源码类型
    keywords?: string[] | null;  // 关键词，可为null
    description?: string | null; // 描述，可为null
    embedding?: number[] | null; // 向量嵌入，可为null
};


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