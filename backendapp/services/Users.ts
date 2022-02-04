import { DbAccess } from "../logic/DbAccess";
import { hash, compareSync } from "bcrypt";
import envVariables from '../config'
import e from "express";

//インターフェース
export interface Jwt {
    token: string,
}

export interface dispUser {
    user_id: number,
    name: string,
    display_name: string,
    password_hash: string,
    roll_id: number,
}

/**
 * ユーザ情報の取得(一覧)
 * 権限：管理者
 * すべてのユーザ一覧を表示する
 * @returns ユーザ情報一覧(dispUser)の配列
 */
export const lookupUser = () => {
    return new Promise<dispUser[]>(async (solve) => {
        const dbAccess = new DbAccess();
        dbAccess.connectWithConf();
        const ret = await dbAccess.query("SELECT user_id, name, display_name, roll_id FROM jesgo_user") as dispUser[];
        dbAccess.end();
        if (ret != null) {
            console.log(ret);
            solve(ret);
        }
        else {
            console.log("error");
        }
    });
}

/**
 * ユーザの新規登録
 * 権限：管理者
 * 必要情報を入力し、ユーザを新規登録する
 * @param name ログイン名
 * @param display_name 表示名
 * @param password パスワード(平文)
 * @param roll_id ロール種別
 * @returns TRUEorFALSE(新規登録の成否) 
 */
export const signUpUser = (name: string, display_name: string, password: string, roll_id: string) => {
    return new Promise<boolean>(async (solve) => {
        const dbAccess = new DbAccess();
        dbAccess.connectWithConf();
        hash(password + envVariables.passwordSalt,
            10,
            async function (err, hash) {
                //insert文を発行
                const ret = await dbAccess.query("INSERT INTO jesgo_user (name, display_name, password_hash, roll_id) VALUES ($1, $2, $3, $4)", [name, display_name, hash, Number(roll_id)]);
                dbAccess.end();
                if (ret != null) {
                    console.log("success");
                    solve(true);
                }
                else {
                    console.log(err?.message);
                    solve(false);
                }
            }
        );
    });
}

/**
 * ユーザの既存編集
 * 権限：管理者
 * 必要情報を入力し、ユーザ情報を編集する
 入力：ユーザID、ログイン名、表示名、パスワード(平文)、ロール種別
 返却：TRUEorFALSE
 * @param name 
 * @param password 
 * @returns 
 */
export const editUserProfile = (user_id: string, name: string, display_name: string, password: string, roll_id: string) => {
    return new Promise<boolean>(async (solve) => {
        // パスワード変更フラグ
        let passwordChange: boolean = false;
        if (password.length > 0) {
            // パスワードが1文字以上であればパスワード変更フラグを立てる
            passwordChange = true;
        }
        const dbAccess = new DbAccess();
        dbAccess.connectWithConf();

        hash(password + envVariables.passwordSalt,
            10,
            async function (err, hash) {
                //update文を発行
                let ret;
                if (passwordChange) {
                    ret = await dbAccess.query("UPDATE jesgo_user SET name = $1, display_name = $2, password_hash = $3, roll_id = $4 WHERE user_id = $5", [name, display_name, hash, roll_id, user_id]);
                } else {
                    ret = await dbAccess.query("UPDATE jesgo_user SET name = $1, display_name = $2, roll_id = $3 WHERE user_id = $4", [name, display_name, roll_id, user_id]);
                }
                dbAccess.end();
                if (ret != null) {
                    console.log("success");
                    solve(true);
                }
                else {
                    console.log(err?.message);
                    solve(false);
                }
            }
        );
    });
}

/**
ユーザの既存編集
 * 権限：本人
 * 必要情報を入力し、ユーザ情報を編集する、ただし権限は変更不可
 入力：ログイン名、表示名、パスワード(平文)
 返却：TRUEorFALSE
 * @param name 
 * @param password 
 * @returns 
 */
export const editMyProfile = (user_id: string, name: string, display_name: string, password: string) => {
    return new Promise<boolean>(async (solve) => {
        // パスワード変更フラグ
        let passwordChange: boolean = false;
        if (password.length > 0) {
            // パスワードが1文字以上であればパスワード変更フラグを立てる
            passwordChange = true;
        }
        const dbAccess = new DbAccess();
        dbAccess.connectWithConf();

        hash(password + envVariables.passwordSalt,
            10,
            async function (err, hash) {
                //update文を発行
                let ret;
                if (passwordChange) {
                    ret = await dbAccess.query("UPDATE jesgo_user SET name = $1, display_name = $2, password_hash = $3 WHERE user_id = $4", [name, display_name, hash, user_id]);
                } else {
                    ret = await dbAccess.query("UPDATE jesgo_user SET name = $1, display_name = $2 WHERE user_id = $3", [name, display_name, user_id]);
                }
                dbAccess.end();
                if (ret != null) {
                    console.log("success");
                    solve(true);
                }
                else {
                    console.log(err?.message);
                    solve(false);
                }
            }
        );
    });
}
/**
ユーザの削除
 * 権限：管理者
 * 対象ユーザを論削状態にする。
 入力：ユーザID
 返却：TRUEorFALSE
 * @param name 
 * @param password 
 * @returns 
 */
/*
export const deleteUser = (user_id: string) => {
    return new Promise<boolean>(async (solve) => {
        // パスワード変更フラグ
        let passwordChange: boolean = false;
        if (password.length > 0) {
            // パスワードが1文字以上であればパスワード変更フラグを立てる
            passwordChange = true;
        }
        const dbAccess = new DbAccess();
        dbAccess.connectWithConf();

        hash(password + envVariables.passwordSalt,
            10,
            async function (err, hash) {
                //update文を発行
                let ret;
                if (passwordChange) {
                    ret = await dbAccess.query("UPDATE jesgo_user SET name = $1, display_name = $2, password_hash = $3, roll_id = $4 WHERE user_id = $5", [name, display_name, hash, roll_id, user_id]);
                } else {
                    ret = await dbAccess.query("UPDATE jesgo_user SET name = $1, display_name = $2, roll_id = $3 WHERE user_id = $4", [name, display_name, roll_id, user_id]);
                }
                dbAccess.end();
                if (ret != null) {
                    console.log("success");
                    solve(true);
                }
                else {
                    console.log(err?.message);
                    solve(false);
                }
            }
        );
    });
}
*/

/**
 * JWTからユーザ情報を取得する
 * @param token
 * @returns ユーザ情報(dispUser)
 */
export const decordJwt = (token: Jwt) => {
    // ★TODO: stab
    const user: dispUser = { name: "", display_name: "", user_id: 1, roll_id: 0, password_hash: "" };
    return user;


    const jwt = require('jsonwebtoken');
    console.log("decordJwt");
    console.log(token.token)
    try {
        const decoded = jwt.verify(token.token, envVariables.publicKey) as dispUser;
        return decoded;
    } catch (e) {
        if (e instanceof jwt.TokenExpiredError) {
            console.error('トークンの有効期限が切れています。', e);
        } else if (e instanceof jwt.JsonWebTokenError) {
            console.error('トークンが不正です。', e);
        } else {
            console.error('トークンの検証でその他のエラーが発生しました。', e);
        }
    }
}

/**
 * ID、PWを照合し、適切なものがあれば認証用JWTを返す
 * @param name ログイン用ID
 * @param password パスワード(平文)
 * @returns 認証用JWT,エラーの時はtokenに"error"が返る
 */
export const loginUser = (name: string, password: string) => {
    return new Promise<Jwt>(async (solve) => {
        console.log("loginUser")
        const jwt = require('jsonwebtoken');
        const dbAccess = new DbAccess();
        const plainPassword = password + envVariables.passwordSalt;
        dbAccess.connectWithConf();
        const ret = await dbAccess.query("SELECT user_id, name, display_name, roll_id, password_hash FROM jesgo_user WHERE name = $1", [name]) as dispUser[];
        dbAccess.end();
        if (ret.length > 0) {
            if (compareSync(plainPassword, ret[0].password_hash)) {
                let token: Jwt = { token: '' };
                token.token = jwt.sign(ret[0], envVariables.privateKey, { expiresIn: '1h' });
                console.log("token->", token);
                solve(token);
            }
            else {
                console.log("err");
                solve({ token: "error" });
            }
        }
        else {
            solve({ token: "error" });
        }
    })
}