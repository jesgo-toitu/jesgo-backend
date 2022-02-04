import { DbAccess } from "../logic/DbAccess";

//インターフェース
export interface Case {
    case_id: number,
    name: string,
    date_of_birth: string,
    sex: string,
    his_id: string,
    decline: boolean,
    registrant: number,
    last_updated: string,
}

/**
 * 患者名から患者情報を検索(部分一致)
 * @param name 患者名
 * @returns 検索結果一覧の配列
 */
export const searchPatientFromName = (name: string) => {
    return new Promise(async (solve) => {
        const dbAccess = new DbAccess();
        dbAccess.connectWithConf();
        const ret = await dbAccess.query("SELECT * FROM jesgo_case WHERE name LIKE $1", ["%" + name + "%"]);

        if (ret != null) {
            let obj: Case[] = ret as Case[];
            console.log(obj);
            solve(obj);
        }
        else {
            solve({ text: "error" });
        }
    })
}