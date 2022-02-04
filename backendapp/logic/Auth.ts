import { DbAccess } from "./DbAccess";

export const roll = {
    login: "login",
    view: "view",
    add: "add",
    edit: "edit",
    remove: "remove",
    dataManage: "data_manage",
    systemManage: "system_manage",
}

/**
 * 指定のユーザが特定の権限を持っているか返す
 * @param user_id ユーザID
 * @param targetAuth 確認したい権限、roll.~で指定できる
 * @return 該当権限を持っているかをTRUEorFALSEで返す
 **/
export const checkAuth = (user_id: number, targetAuth: string) => {
    return new Promise<boolean>(async (solve) => {
        const dbAccess = new DbAccess();
        dbAccess.connectWithConf();
        const ret = await dbAccess.query("SELECT $1 AS auth FROM jesgo_user u JOIN jesgo_user_roll r ON u.roll_id = r.roll_id WHERE user_id = $2", [targetAuth, user_id]) as { auth: boolean }[];
        dbAccess.end();
        if (ret.length > 0) {
            console.log(ret[0]);
            solve(ret[0].auth);
        }
        else {
            console.log("error");
        }
    });
}