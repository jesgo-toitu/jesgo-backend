import { DbAccess } from "../logic/DbAccess";

//インターフェース
export interface Document {
    document_id: number,
    case_id: number,
    event_date: string,
    schema_id: number,
    schema_major_version: number,
    document: JSON,
    child_documents: number[],
    registrant: number,
    last_updated: string,
    readonly: boolean,
    deleted: boolean,
    child_documents_json: JSON[]
}

export interface DocumentSchema {
    schema_id: number,
    schema_id_string: string,
    title: string,
    subtitle: string,
    document_schema: JSON,
    uniqueness: boolean,
    hidden: boolean,
    subschema: number[],
    child_schema: number[],
    base_version_major: number,
    valid_from: string,
    valid_until: string,
    author: string,
    version_major: number,
    version_minor: number,
    plugin_id: number,
}

/**
 * 症例IDからドキュメント情報、付随するスキーマ情報を検索(完全一致)
 * @param case_id 症例ID
 * @returns 検索結果一覧の配列
 */
export const searchDocumentFromCaseId = (case_id: string) => {
    return new Promise(async (solve) => {
        const dbAccess = new DbAccess();
        dbAccess.connectWithConf();
        const ret = await dbAccess.query("SELECT * FROM jesgo_document WHERE case_id = $1", [Number(case_id)]);

        if (ret != null) {
            let docs: Document[] = ret as Document[];
            console.log(docs);
            solve(docs);
        }
        else {
            solve({ text: "error" });
        }
    })
}