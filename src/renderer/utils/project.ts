import {ElectronAPI} from "./electron-api";

export async function getProjectPath(projectName:string): Promise<string> {
    const userDataPath = await ElectronAPI.getUserDataPath();
    return await ElectronAPI.pathJoin(userDataPath, "Projects", projectName);
}