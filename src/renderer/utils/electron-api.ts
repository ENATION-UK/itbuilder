export const ElectronAPI = {
    readAppFile: (filePath: string): Promise<string> => window.electronAPI.readAppFile(filePath),
    writeAppFile: (filePath: string, content: string): Promise<string> => window.electronAPI.writeAppFile(filePath, content),

    readUserFile: (filePath: string): Promise<string> => window.electronAPI.readUserFile(filePath),
    writeUserFile: (filePath: string, content: string): Promise<string> => window.electronAPI.writeUserFile(filePath, content),

    userFileExists: (filePath: string): Promise<boolean> => window.electronAPI.userFileExists(filePath),

    getAppPath: (): Promise<string> => window.electronAPI.getAppPath(),
    getUserDataPath: (): Promise<string> => window.electronAPI.getUserDataPath()
};