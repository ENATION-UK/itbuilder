interface ElectronAPI {
    readAppFile: (filePath: string) => Promise<string>;
    writeAppFile: (filePath: string, content: string) => Promise<string>;

    readUserFile: (filePath: string) => Promise<string>;
    writeUserFile: (filePath: string, content: string | undefined) => Promise<string>;

    userFileExists: (filePath: string) => Promise<boolean>;

    getAppPath: () => Promise<string>;
    getUserDataPath: () => Promise<string>;
}

declare interface Window {
    electronAPI: ElectronAPI;
}