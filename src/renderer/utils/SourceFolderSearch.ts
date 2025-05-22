import {ElectronAPI} from "./electron-api";
import {getEmbedding} from "./ModelCall";



async function querySourceCode(id:number):Promise<SourceCode>{
    const sql = `SELECT * FROM source_code WHERE id = ?`;
    const result = await ElectronAPI.fetchOne(sql, [id]);
    return result as SourceCode;
}

export async function querySourceCodeByPath(path:string):Promise<SourceCode>{
    const sql = `SELECT * FROM source_code WHERE path = ?`;
    const result = await ElectronAPI.fetchOne(sql, [path]);
    return result as SourceCode;
}
