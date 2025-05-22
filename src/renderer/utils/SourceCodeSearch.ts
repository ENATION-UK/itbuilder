import {ElectronAPI} from "./electron-api";
import {getEmbedding} from "./ModelCall";


export async function searchCode(query: string): Promise<SourceCode[]> {
    await ElectronAPI.loadIndex();
    const queryEmbedding = await getEmbedding(query);
    const { neighbors, distances } = (await ElectronAPI.searchVector(queryEmbedding, 200)).result;
    const results = await Promise.all(
        neighbors.map(async (docIndex, i) => {
            const code = await querySourceCode(docIndex);
            const similarity = 1 - distances[i];
            return { code, similarity };
        })
    );
    // console.log(results)
    return results
        .filter(res => res.similarity > 0.6)
        .map(res => res.code);
}


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
