class ModuleFunction {
    functionName: string;
    functionDescription: string;
    userInteraction: string;

    constructor(functionName: string, functionDescription: string, userInteraction: string) {
        this.functionName = functionName;
        this.functionDescription = functionDescription;
        this.userInteraction = userInteraction;
    }

    toDetail(): string {
        return "# 功能名称：\n" + this.functionName + "\n" +
            "# 功能说明：\n" + this.functionDescription + "\n" +
            "# 操作体验设计：\n" + this.userInteraction + "\n";
    }

}

 class Page {
    pageName: string;
    functionDescription: string;
    pageItem: string;
    userInteraction: string;
    style: string;
}


class Module {
    moduleName: string;
    functions: ModuleFunction[];
    pages: Page[];

    constructor(moduleName: string, functions: ModuleFunction[]) {
        this.moduleName = moduleName;
        this.functions = functions;
    }
}

export {Module, ModuleFunction,Page};