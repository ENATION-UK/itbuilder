import { ipcMain } from 'electron';
import { HierarchicalNSW } from 'hnswlib-node';
import fs from 'fs';
import path from 'path';

const space = 'cosine';
const dim = 1024;
const maxElements = 10000;
const indexFilePath = path.join(__dirname, 'hnsw_index.dat');
console.log('[HNSWLIB] Loading index from file:', indexFilePath)
let index = new HierarchicalNSW(space, dim);
index.initIndex(maxElements);
console.log('[HNSWLIB] Initialized new index');

ipcMain.handle('hnsw:addVector', async (event, id, vector) => {
    try {
        index.addPoint(vector, id);
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('hnsw:searchVector', async (event, vector, k = 3) => {
    try {
        const result = index.searchKnn(vector, k);
        return { success: true, result };
    } catch (err) {
        return { success: false, error: err.message };
    }
});



ipcMain.handle('hnsw:saveIndex', async () => {
    try {
        index.writeIndexSync(indexFilePath);
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('hnsw:loadIndex', async () => {
    try {
        if (fs.existsSync(indexFilePath)) {
            index = new HierarchicalNSW(space, dim);
            index.readIndexSync(indexFilePath);
            return { success: true };
        } else {
            return { success: false, error: 'Index file does not exist.' };
        }
    } catch (err) {
        return { success: false, error: err.message };
    }
});