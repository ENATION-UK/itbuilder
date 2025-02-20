interface ElectronAPI {
    readAppFile: (filePath: string) => Promise<string>;
    readFile: (filePath: string) => Promise<string>;
    writeAppFile: (filePath: string, content: string) => Promise<string>;
    readUserFile: (filePath: string) => Promise<string>;
    writeUserFile: (filePath: string, content: string | undefined) => Promise<string>;
    userFileExists: (filePath: string) => Promise<boolean>;
    listUserFolder: (folderPath: string) => Promise<FileInfo[]>;
    getAppPath: () => Promise<string>;
    getUserDataPath: () => Promise<string>;
    pathJoin: (...paths: string[]) =>  Promise<string>;
}

declare interface Window {
    electronAPI: ElectronAPI;
}