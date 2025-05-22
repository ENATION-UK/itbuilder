import Database from 'better-sqlite3';
import path from 'path';
import { app,ipcMain } from 'electron';

// 获取数据库路径（使用 Electron 提供的 userData 目录）
const dbPath = path.join(app.getPath('userData'), 'app.db');
const db = new Database(dbPath);

// 初始化表
// db.prepare(`
// CREATE TABLE module (
//  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
//  name TEXT(255),
//  description TEXT
// );
//
// CREATE TABLE source_code
// (
//     id          INTEGER             NOT NULL PRIMARY KEY AUTOINCREMENT,
//     module_id   INTEGER DEFAULT (0) NOT NULL,
//     module_name TEXT(255),
//     keywords    TEXT,
//     description TEXT,
//     "path" TEXT,
//     "type"      TEXT(255)
// );
// `).run();

/**
 * 执行写入类操作（INSERT, UPDATE, DELETE）
 */
function runQuery(sql:string, params:  any[] = []) {
    const stmt = db.prepare(sql);
    return stmt.run(params);
}

/**
 * 查询多条记录
 */
function fetchAll(sql:string, params :any[] = []) {
    const stmt = db.prepare(sql);
    return stmt.all(params);
}

/**
 * 查询单条记录
 */
function fetchOne(sql:string, params :any[] = []) {
    const stmt = db.prepare(sql);
    return stmt.get(params);
}

ipcMain.handle('db:runQuery', (_event, sql, params) => {
    try {
        return runQuery(sql, params);
    } catch (err) {
        return { error: err.message };
    }
});

ipcMain.handle('db:fetchAll', (_event, sql, params) => {
    try {
        return fetchAll(sql, params);
    } catch (err) {
        return { error: err.message };
    }
});

ipcMain.handle('db:fetchOne', (_event, sql, params) => {
    try {
        return fetchOne(sql, params);
    } catch (err) {
        return { error: err.message };
    }
});