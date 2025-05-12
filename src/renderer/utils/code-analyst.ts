
export async function codeAnalyst(code:string): Promise<FunctionInfo>{
    const sysPrompt = await this.readPrompt("code-analyst.txt");
    let jsonText =  await chat(sysPrompt, code);
    jsonText = await this.extractCode(jsonText);
    return JSON.parse(jsonText);
}


export async function dirAnalyst(codeDesc:string): Promise<string>{
    const sysPrompt = await this.readPrompt("dir-desc.txt");
    return  await chat(sysPrompt, codeDesc);
}
