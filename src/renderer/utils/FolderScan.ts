import {ElectronAPI} from "./electron-api";

const ignoreList = ['node_modules', '.git', 'dist', 'build', 'coverage', 'out', 'logs'];

const getIndent = (depth) => '  '.repeat(depth);

async function scanDirectoryOnly(dirPath, depth = 0, maxDepth = 10) {
    if (depth > maxDepth) return '';

    let output = '';
    try {
        // const entries = await fs.readdir(dirPath, { withFileTypes: true });
       const entries =await ElectronAPI.listFolder(dirPath);
        for (const entry of entries) {
            if (entry.type != 'directory') continue;
            if (ignoreList.includes(entry.name)) continue;
            const fullPath = await ElectronAPI.pathJoin(dirPath, entry.name)
            const indent = getIndent(depth);
            output += `${indent}- 📁 ${entry.name}/\n`;

            output += await scanDirectoryOnly(fullPath, depth + 1, maxDepth);
        }
    } catch (err) {
        output += `${getIndent(depth)}- ⚠️ Error reading ${dirPath}\n`;
    }

    return output;
}

// 导出主函数
export async function generateDirectoryLineGraph(rootPath, maxDepth = 10) {
    const result = await scanDirectoryOnly(rootPath, 0, maxDepth);
    return `# 📦 项目目录线图（目录结构）\n\n${result}`;
}