import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import {
  loginUser,
  userObject,
  checkAuth,
  roll,
  refleshLogin,
  searchUser,
  searchUserRequest,
  signUpUser,
  editUserProfile,
  deleteUser,
  changePassword,
} from '../services/Users';
import {
  deletePatient,
  searchPatientRequest,
  searchPatients,
} from '../services/SearchPatient';
import { jsonToSchema, schemaListUpdate } from '../services/JsonToDatabase';
import Router from 'express-promise-router';
import {
  getCaseAndDocument,
  getJsonSchema,
  getRootSchemaIds,
  registrationCaseAndDocument,
  SaveDataObjDefine,
} from '../services/Schemas';
import { ApiReturnObject, getToken, RESULT } from '../logic/ApiCommon';

const app = express();
app.use(helmet());
app.use(cors());
// ルーティングする

const router = Router();

// routerにルーティングの動作を記述する

/**
 * ログイン関連用 start
 * login
 * relogin
 */
router.post('/login/', (req, res, next) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const body: userObject = req.body.data as userObject;
  loginUser(body.name, body.password)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.post('/relogin/', (req, res, next) => {
  try {
    // eslint-disable-next-line
    const result = refleshLogin(req.body.reflesh_token as string);
    res.status(200).send(result);
  } catch {
    next;
  }
});

router.get('/getJsonSchema', async (req, res, next) => {
  // 権限の確認
  const authResult: ApiReturnObject = await checkAuth(getToken(req), roll.view);
  if (authResult.statusNum !== RESULT.NORMAL_TERMINATION) {
    res.status(200).send(authResult);
  }
  if (authResult.body) {
    getJsonSchema()
      .then((result) => res.status(200).send(result))
      .catch(next);
  }
  // 権限が無い場合
  else {
    console.log('auth error');
  }
});

router.get('/getRootSchemaIds', async (req, res, next) => {
  // 権限の確認
  const authResult: ApiReturnObject = await checkAuth(getToken(req), roll.view);
  if (authResult.statusNum !== RESULT.NORMAL_TERMINATION) {
    res.status(200).send(authResult);
  }
  if (authResult.body) {
    getRootSchemaIds()
      .then((result) => res.status(200).send(result))
      .catch(next);
  }
  // 権限が無い場合
  else {
    console.log('auth error');
  }
});
/**
 * ユーザー一覧
 */
 router.get('/userlist', async (req, res, next) => {
  // 権限の確認
  const authResult: ApiReturnObject = await checkAuth(getToken(req), roll.view);
  if (authResult.statusNum !== RESULT.NORMAL_TERMINATION) {
    res.status(200).send(authResult);
  } else {
    if (authResult.body) {
      searchUser(req.query as searchUserRequest)
        .then((result) => res.status(200).send(result))
        .catch(next);
    }
    // 権限が無い場合
    else {
      console.log('auth error');
    }
  }
});

/**
 * ユーザー登録
 */
 router.post('/signup/', async (req, res, next) => {
  const body: userObject = req.body.data as userObject;

  // 権限の確認
  const authResult: ApiReturnObject = await checkAuth(getToken(req), roll.view);
  if (authResult.statusNum !== RESULT.NORMAL_TERMINATION) {
    res.status(200).send(authResult);
  }
  else {
    const body: userObject = req.body.data as userObject;
    console.log("signup:");
    console.log(req.body.data);
    signUpUser(body.name, body.display_name, body.password, body.roll_id)
      .then((result) => res.status(200).send(result))
      .catch(next);
    }
});

/**
 * ユーザー削除
 */
 router.post('/deleteUser/', async (req, res, next) => {
  const body: userObject = req.body.data as userObject;
   console.log("deleteUser:" + body);

  // 権限の確認
  const authResult: ApiReturnObject = await checkAuth(getToken(req), roll.view);
  if (authResult.statusNum !== RESULT.NORMAL_TERMINATION) {
    res.status(200).send(authResult);
  }
  else {
    const body: userObject = req.body.data as userObject;
    deleteUser(body.user_id)
      .then((result) => res.status(200).send(result))
      .catch(next);
    }
});

/**
 * ユーザーパスワード変更
 */
 router.post('/changeUserPassword/', async (req, res, next) => {
  const body: userObject = req.body.data as userObject;

  // 権限の確認
  const authResult: ApiReturnObject = await checkAuth(getToken(req), roll.view);
  if (authResult.statusNum !== RESULT.NORMAL_TERMINATION) {
    res.status(200).send(authResult);
  }
  else {
    const body: userObject = req.body.data as userObject;
    changePassword(
      body.user_id,
      body.password
    )
    .then((result) => res.status(200).send(result))
    .catch(next);
  }
});

/**
 * ユーザー更新
 */
router.post('/editUser/', async (req, res, next) => {
  const body: userObject = req.body.data as userObject;

  // 権限の確認
  const authResult: ApiReturnObject = await checkAuth(getToken(req), roll.view);
  if (authResult.statusNum !== RESULT.NORMAL_TERMINATION) {
    res.status(200).send(authResult);
  }
  else {
    const body: userObject = req.body.data as userObject;
    console.log("editUser");
    console.log(req.body.data);
    editUserProfile(
      body.user_id,
      body.name,
      body.display_name,
      body.password,
      body.roll_id
    )
    .then((result) => res.status(200).send(result))
    .catch(next);
  }
});

/**
 * ログイン関連用 end
 */

/**
 * リスト画面用 start
 * patientlist
 * deleteCase
 */
router.get('/patientlist', async (req, res, next) => {
  // 権限の確認
  const authResult: ApiReturnObject = await checkAuth(getToken(req), roll.view);
  if (authResult.statusNum !== RESULT.NORMAL_TERMINATION) {
    res.status(200).send(authResult);
  } else {
    if (authResult.body) {
      searchPatients(req.query as searchPatientRequest)
        .then((result) => res.status(200).send(result))
        .catch(next);
    }
    // 権限が無い場合
    else {
      console.log('auth error');
    }
  }
});

router.delete('/deleteCase/:caseId', async (req, res, next) => {
  // 権限の確認
  const authResult: ApiReturnObject = await checkAuth(
    getToken(req),
    roll.remove
  );
  if (authResult.statusNum !== RESULT.NORMAL_TERMINATION) {
    res.status(200).send(authResult);
  }
  if (authResult.body) {
    deletePatient(Number(req.params.caseId))
      .then((result) => res.status(200).send(result))
      .catch(next);
  }
  // 権限が無い場合
  else {
    console.log('auth error');
  }
});

/**
 * リスト画面用 end
 */

/**
 * 症例登録画面用 start
 * getJsonSchema
 * deleteCase
 */

router.post('/registrationCaseAndDocument/', async (req, res, next) => {
  // 権限の確認
  const authResult: ApiReturnObject = await checkAuth(getToken(req), roll.add);
  if (authResult.statusNum !== RESULT.NORMAL_TERMINATION) {
    res.status(200).send(authResult);
  }
  if (authResult.body) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    registrationCaseAndDocument(req.body.data as SaveDataObjDefine)
      .then((result) => res.status(200).send(result))
      .catch(next);
  }
  // 権限が無い場合
  else {
    console.log('auth error');
  }
});

router.get('/getCaseAndDocument/:caseId', async (req, res, next) => {
  // 権限の確認
  const authResult: ApiReturnObject = await checkAuth(getToken(req), roll.view);
  if (authResult.statusNum !== RESULT.NORMAL_TERMINATION) {
    res.status(200).send(authResult);
  }
  if (authResult.body) {
    getCaseAndDocument(Number(req.params.caseId))
      .then((result) => res.status(200).send(result))
      .catch(next);
  }
  // 権限が無い場合
  else {
    console.log('auth error');
  }
});

/**
 * 症例登録画面用 end
 */

/**
 * プラグイン用 start
 */
router.post('/json2schema/', (req, res, next) => {
  jsonToSchema()
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.post('/schemaListUpdate/', (req, res, next) => {
  schemaListUpdate()
    .then((result) => res.status(200).send(result))
    .catch(next);
});
/**
 * プラグイン用 end
 */

/*
router.post('/edituserprofile/', async (req, res, next) => {
  const body: userObject = req.body.data as userObject;
  let user_id = -1;
  if (req.header('token') != null) {
    console.log('token ready');
    const token: Jwt = { token: req.header('token') as string };
    const userInfo: dispUser = decordJwt(token) as dispUser;
    user_id = userInfo.user_id;
  }
  // トークンがない場合
  else {
    console.log('token not ready');
  }

  const result: boolean = await checkAuth(user_id, roll.systemManage);
  if (result) {
    editUserProfile(
      body.user_id,
      body.name,
      body.display_name,
      body.password,
      body.roll_id
    )
      .then((result) => res.status(200).send(result))
      .catch(next);
  }
  // 権限が無い場合
  else {
    console.log('auth error');
  }
});

router.get('/search/', async (req, res, next) => {
  let user_id = -1;
  if (req.header('token') != null) {
    console.log('token ready');
    const token: Jwt = { token: req.header('token') as string };
    const userInfo: dispUser = decordJwt(token) as dispUser;
    user_id = userInfo.user_id;
  }
  // トークンがない場合
  else {
    console.log('token not ready');
  }

  const result: boolean = await checkAuth(user_id, roll.view);
  if (result) {
    lookupUser()
      .then((result) => res.status(200).send(result))
      .catch(next);
  }
  // 権限が無い場合
  else {
    console.log('auth error');
  }
});

router.post('/editmyprofile/', (req, res, next) => {
  const body: userObject = req.body.data as userObject;
  let user_id = -1;
  if (req.header('token') != null) {
    console.log('token ready');
    const token: Jwt = { token: req.header('token') as string };
    const userInfo: dispUser = decordJwt(token) as dispUser;
    user_id = userInfo.user_id;
  }
  // トークンがない場合
  else {
    console.log('token not ready');
  }

  // ★TODO：stab
  user_id = body.user_id;

  if (user_id == body.user_id) {
    editMyProfile(body.user_id, body.name, body.display_name, body.password)
      .then((result) => res.status(200).send(result))
      .catch(next);
  }
  // 自分の情報で無い場合
  else {
    console.log('auth error');
  }
});
*/





// -------------------------------------------------
//  以下、何のルーティングにもマッチしないorエラー
// -------------------------------------------------

// いずれのルーティングにもマッチしない(==NOT FOUND)
app.use((req, res) => {
  res.status(404);
  res.render('error', {
    param: {
      status: 404,
      message: 'not found',
    },
  });
});

//routerをモジュールとして扱う準備
export default router;
