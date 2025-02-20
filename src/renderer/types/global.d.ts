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
}
