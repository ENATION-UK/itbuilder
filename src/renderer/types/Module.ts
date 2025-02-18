class ModuleFunction {
    functionName: string;
    functionDescription: string;
    userInteraction: string;

    constructor(functionName: string, functionDescription: string, userInteraction: string) {
        this.functionName = functionName;
        this.functionDescription = functionDescription;
        this.userInteraction = userInteraction;
    }
}

class Module {
    moduleName: string;
    functions: ModuleFunction[];

    constructor(moduleName: string, functions: ModuleFunction[]) {
        this.moduleName = moduleName;
        this.functions = functions;
    }
}

export { Module, ModuleFunction };