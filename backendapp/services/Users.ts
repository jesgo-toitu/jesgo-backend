import { DbAccess } from '../logic/DbAccess';
import { hash, compareSync } from 'bcrypt';
import {
  JsonWebTokenError,
  sign,
  TokenExpiredError,
  verify,
} from 'jsonwebtoken';
import envVariables from '../config';
import { ApiReturnObject, RESULT } from '../logic/ApiCommon';

//インターフェース
export interface Jwt {
  token: string;
}

export interface dispUser {
  user_id: number;
  name: string;
  display_name: string;
  password_hash: string;
  roll_id: number;
}

export interface localStorageObject {
  user_id: number;
  display_name: string;
  token: string;
  reflesh_token: string;
}
export interface userObject extends dispUser {
  password: string;
}

export const roll = {
  login: 'login',
  view: 'view',
  add: 'add',
  edit: 'edit',
  remove: 'remove',
  dataManage: 'data_manage',
  systemManage: 'system_manage',
};

export const TOKEN_EXPIRED_ERROR = -10;
/**
 * ユーザ情報の取得(一覧)
 * 権限：管理者
 * すべてのユーザ一覧を表示する
 * @returns ユーザ情報一覧(dispUser)の配列
 */
export const lookupUser = async (): Promise<dispUser[] | undefined> => {
  const dbAccess = new DbAccess();
  await dbAccess.connectWithConf();
  const ret = (await dbAccess.query(
    'SELECT user_id, name, display_name, roll_id FROM jesgo_user'
  )) as dispUser[];
  await dbAccess.end();
  if (ret != null) {
    console.log(ret);
    return ret;
  } else {
    console.log('error');
  }
};

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
export const signUpUser = async (
  name: string,
  display_name: string,
  password: string,
  roll_id: number
): Promise<boolean> => {
  const dbAccess = new DbAccess();
  await dbAccess.connectWithConf();
  hash(password + envVariables.passwordSalt, 10, async function (err, hash) {
    //insert文を発行
    const ret = await dbAccess.query(
      'INSERT INTO jesgo_user (name, display_name, password_hash, roll_id) VALUES ($1, $2, $3, $4)',
      [name, display_name, hash, Number(roll_id)]
    );
    await dbAccess.end();
    if (ret != null) {
      console.log('success');
      return true;
    } else {
      console.log(err?.message);
      return false;
    }
  });
  return false;
};

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
export const editUserProfile = async (
  user_id: number,
  name: string,
  display_name: string,
  password: string,
  roll_id: number
): Promise<boolean> => {
  // パスワード変更フラグ
  let passwordChange = false;
  if (password.length > 0) {
    // パスワードが1文字以上であればパスワード変更フラグを立てる
    passwordChange = true;
  }
  const dbAccess = new DbAccess();
  await dbAccess.connectWithConf();

  hash(password + envVariables.passwordSalt, 10, async function (err, hash) {
    //update文を発行
    let ret;
    if (passwordChange) {
      ret = await dbAccess.query(
        'UPDATE jesgo_user SET name = $1, display_name = $2, password_hash = $3, roll_id = $4 WHERE user_id = $5',
        [name, display_name, hash, roll_id, user_id]
      );
    } else {
      ret = await dbAccess.query(
        'UPDATE jesgo_user SET name = $1, display_name = $2, roll_id = $3 WHERE user_id = $4',
        [name, display_name, roll_id, user_id]
      );
    }
    await dbAccess.end();
    if (ret != null) {
      console.log('success');
      return true;
    } else {
      console.log(err?.message);
      return false;
    }
  });
  return false;
};

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
export const editMyProfile = async (
  user_id: number,
  name: string,
  display_name: string,
  password: string
): Promise<boolean> => {
  // パスワード変更フラグ
  let passwordChange = false;
  if (password.length > 0) {
    // パスワードが1文字以上であればパスワード変更フラグを立てる
    passwordChange = true;
  }
  const dbAccess = new DbAccess();
  await dbAccess.connectWithConf();

  hash(password + envVariables.passwordSalt, 10, async function (err, hash) {
    //update文を発行
    let ret;
    if (passwordChange) {
      ret = await dbAccess.query(
        'UPDATE jesgo_user SET name = $1, display_name = $2, password_hash = $3 WHERE user_id = $4',
        [name, display_name, hash, user_id]
      );
    } else {
      ret = await dbAccess.query(
        'UPDATE jesgo_user SET name = $1, display_name = $2 WHERE user_id = $3',
        [name, display_name, user_id]
      );
    }
    await dbAccess.end();
    if (ret != null) {
      console.log('success');
      return true;
    } else {
      console.log(err?.message);
      return false;
    }
  });
  return false;
};
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
        await dbAccess.connectWithConf();

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
                await dbAccess.end();
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
export const decordJwt = (token: Jwt, isReflesh = false): ApiReturnObject => {
  try {
    let secret = envVariables.privateKey;
    if (isReflesh) {
      secret += 'reflesh';
    }
    const decoded = verify(token.token, secret) as dispUser;
    return { statusNum: RESULT.NORMAL_TERMINATION, body: decoded };
  } catch (e) {
    if (e instanceof TokenExpiredError) {
      console.error('トークンの有効期限が切れています。', e);
      return { statusNum: TOKEN_EXPIRED_ERROR, body: null };
    } else if (e instanceof JsonWebTokenError) {
      console.error('トークンが不正です。', e);
    } else {
      console.error('トークンの検証でその他のエラーが発生しました。', e);
    }
  }
  return { statusNum: RESULT.ABNORMAL_TERMINATION, body: null };
};

/**
 *
 * @param token Jwt、あるいはNULL
 * @param targetAuth 確認したい権限、roll.~で指定できる
 * @return 該当権限を持っているかをTRUEorFALSEで返す
 **/
export const checkAuth = async (
  token: string | undefined,
  targetAuth: string
): Promise<ApiReturnObject> => {
  try {
    let myApiReturnObject: ApiReturnObject = {
      statusNum: RESULT.ABNORMAL_TERMINATION,
      body: null,
    };
    if (token === undefined) {
      return myApiReturnObject;
    }
    const jwt: Jwt = { token: token };
    myApiReturnObject = decordJwt(jwt);
    // トークン期限切れエラー含むエラーが出ている場合、その旨をそのまま返す
    if (
      myApiReturnObject.statusNum === RESULT.ABNORMAL_TERMINATION ||
      myApiReturnObject.statusNum === TOKEN_EXPIRED_ERROR
    ) {
      return myApiReturnObject;
    }

    // トークンが正常にデコード出来た場合
    const user: dispUser = myApiReturnObject.body as dispUser;
    const dbAccess = new DbAccess();
    await dbAccess.connectWithConf();
    const ret = (await dbAccess.query(
      'SELECT $1 AS auth FROM jesgo_user u JOIN jesgo_user_roll r ON u.roll_id = r.roll_id WHERE user_id = $2',
      [targetAuth, user.user_id]
    )) as { auth: boolean }[];
    await dbAccess.end();

    if (ret.length > 0) {
      // レコードがあればその結果を返却する
      myApiReturnObject.body = ret[0].auth;
    } else {
      // レコードが見つからなければbodyをnullにしてエラーを返却する
      console.log('error');
      myApiReturnObject.statusNum = RESULT.ABNORMAL_TERMINATION;
      myApiReturnObject.body = null;
    }
    return myApiReturnObject;
  } catch {
    return { statusNum: RESULT.ABNORMAL_TERMINATION, body: null };
  }
};

/**
 * ID、PWを照合し、適切なものがあれば認証用JWTを返す
 * @param name ログイン用ID
 * @param password パスワード(平文)
 * @returns JWTと表示名、ユーザID
 */
export const loginUser = async (
  name: string,
  password: string
): Promise<ApiReturnObject> => {
  const dbAccess = new DbAccess();
  const plainPassword = password + envVariables.passwordSalt;
  await dbAccess.connectWithConf();
  const ret = (await dbAccess.query(
    'SELECT user_id, name, display_name, roll_id, password_hash FROM jesgo_user WHERE name = $1',
    [name]
  )) as dispUser[];
  await dbAccess.end();
  if (ret.length > 0) {
    if (compareSync(plainPassword, ret[0].password_hash)) {
      const returnObj: localStorageObject = {
        user_id: ret[0].user_id,
        display_name: ret[0].display_name,
        token: '',
        reflesh_token: '',
      };
      returnObj.token = sign(ret[0], envVariables.privateKey, {
        expiresIn: '1h',
      });
      returnObj.reflesh_token = sign(
        ret[0],
        `${envVariables.privateKey}reflesh`,
        {
          expiresIn: '3h',
        }
      );
      return { statusNum: RESULT.NORMAL_TERMINATION, body: returnObj };
    } else {
      console.log('err');
      return {
        statusNum: RESULT.ABNORMAL_TERMINATION,
        body: { token: 'error', reflesh_token: 'error' },
      };
    }
  } else {
    return {
      statusNum: RESULT.ABNORMAL_TERMINATION,
      body: { token: 'error', reflesh_token: 'error' },
    };
  }
};

export const refleshLogin = (oldToken: string | undefined): ApiReturnObject => {
  try {
    let myApiReturnObject: ApiReturnObject = {
      statusNum: RESULT.ABNORMAL_TERMINATION,
      body: null,
    };
    if (oldToken === undefined) {
      return myApiReturnObject;
    }
    const jwt: Jwt = { token: oldToken };
    myApiReturnObject = decordJwt(jwt, true);
    // リフレッシュトークン期限切れエラー含むエラーが出ている場合、異常終了にして返す(期限切れループしないため)
    if (
      myApiReturnObject.statusNum === RESULT.ABNORMAL_TERMINATION ||
      myApiReturnObject.statusNum === TOKEN_EXPIRED_ERROR
    ) {
      return { statusNum: RESULT.ABNORMAL_TERMINATION, body: null };
    }

    // リフレッシュトークンが正常にデコード出来た場合、再度トークン、リフレッシュトークンを発行して返す
    const oldUser: dispUser = myApiReturnObject.body as dispUser;
    const newUser: dispUser = {
      user_id: oldUser.user_id,
      name: oldUser.name,
      display_name: oldUser.display_name,
      roll_id: oldUser.roll_id,
      password_hash: oldUser.password_hash,
    };
    const token: { token: string; reflesh_token: string } = {
      token: '',
      reflesh_token: '',
    };
    token.token = sign(newUser, envVariables.privateKey, {
      expiresIn: '1h',
    });
    token.reflesh_token = sign(newUser, `${envVariables.privateKey}reflesh`, {
      expiresIn: '3h',
    });
    return { statusNum: RESULT.NORMAL_TERMINATION, body: token };
  } catch (err) {
    console.log(err);
    return { statusNum: RESULT.ABNORMAL_TERMINATION, body: null };
  }
};
