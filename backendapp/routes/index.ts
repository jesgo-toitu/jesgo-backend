import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import multer from 'multer';
import {
  loginUser,
  userObject,
  checkAuth,
  roll,
  refleshLogin,
  searchUser,
  signUpUser,
  editUserProfile,
  deleteUser,
  changePassword,
  getUsernameFromRequest,
} from '../services/Users';
import {
  deletePatient,
  searchPatientRequest,
  searchPatients,
} from '../services/SearchPatient';
import { uploadZipFile } from '../services/JsonToDatabase';
import Router from 'express-promise-router';
import {
  getCaseAndDocument,
  getInfiniteLoopBlackList,
  getJsonSchema,
  getRootSchemaIds,
  getSchemaTree,
  getSearchColumns,
  JesgoDocumentSchema,
  registrationCaseAndDocument,
  SaveDataObjDefine,
  updateSchemas,
} from '../services/Schemas';
import { getSettings, settings, updateSettings } from '../services/Settings';
import { ApiReturnObject, getToken, RESULT } from '../logic/ApiCommon';
import { logging, LOGTYPE } from '../logic/Logger';

const app = express();
app.use(helmet());
app.use(cors());
// ルーティングする

const router = Router();
const upload = multer({ dest: 'uploads/' });

// routerにルーティングの動作を記述する

/**
 * ログイン関連用 start
 * login
 * relogin
 */
router.post('/login/', (req, res, next) => {
  logging(LOGTYPE.DEBUG, '呼び出し', 'router', '/login');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const body: userObject = req.body.data as userObject;
  loginUser(body.name, body.password)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.post('/relogin/', (req, res, next) => {
  logging(LOGTYPE.DEBUG, '呼び出し', 'router', '/relogin');
  try {
    // eslint-disable-next-line
    const result = refleshLogin(req.body.reflesh_token as string);
    res.status(200).send(result);
  } catch {
    next;
  }
});

router.get('/getJsonSchema', async (req, res, next) => {
  logging(
    LOGTYPE.DEBUG,
    '呼び出し',
    'router',
    '/getJsonSchema',
    getUsernameFromRequest(req)
  );
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
    logging(
      LOGTYPE.ERROR,
      '権限エラー',
      'router',
      '/getJsonSchema',
      getUsernameFromRequest(req)
    );
  }
});

router.get('/getRootSchemaIds', async (req, res, next) => {
  logging(
    LOGTYPE.DEBUG,
    '呼び出し',
    'router',
    '/getRootSchemaIds',
    getUsernameFromRequest(req)
  );
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
    logging(
      LOGTYPE.ERROR,
      '権限エラー',
      'router',
      '/getRootSchemaIds',
      getUsernameFromRequest(req)
    );
  }
});
/**
 * ユーザー一覧
 */
router.get('/userlist', async (req, res, next) => {
  logging(
    LOGTYPE.DEBUG,
    '呼び出し',
    'router',
    '/userlist',
    getUsernameFromRequest(req)
  );
  // 権限の確認
  const authResult: ApiReturnObject = await checkAuth(getToken(req), roll.view);
  if (authResult.statusNum !== RESULT.NORMAL_TERMINATION) {
    res.status(200).send(authResult);
  } else {
    if (authResult.body) {
      searchUser()
        .then((result) => res.status(200).send(result))
        .catch(next);
    }
    // 権限が無い場合
    else {
      logging(
        LOGTYPE.ERROR,
        '権限エラー',
        'router',
        '/userlist',
        getUsernameFromRequest(req)
      );
    }
  }
});

/**
 * ユーザー登録
 */
router.post('/signup/', async (req, res, next) => {
  logging(
    LOGTYPE.DEBUG,
    '呼び出し',
    'router',
    '/signup',
    getUsernameFromRequest(req)
  );

  // 権限の確認
  const authResult: ApiReturnObject = await checkAuth(getToken(req), roll.view);
  if (authResult.statusNum !== RESULT.NORMAL_TERMINATION) {
    res.status(200).send(authResult);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const body: userObject = req.body.data as userObject;
    signUpUser(body.name, body.display_name, body.password, body.roll_id)
      .then((result) => res.status(200).send(result))
      .catch(next);
  }
});

/**
 * ユーザー削除
 */
router.post('/deleteUser/', async (req, res, next) => {
  logging(
    LOGTYPE.DEBUG,
    '呼び出し',
    'router',
    '/deleteUser',
    getUsernameFromRequest(req)
  );

  // 権限の確認
  const authResult: ApiReturnObject = await checkAuth(getToken(req), roll.view);
  if (authResult.statusNum !== RESULT.NORMAL_TERMINATION) {
    res.status(200).send(authResult);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
  logging(
    LOGTYPE.DEBUG,
    '呼び出し',
    'router',
    '/changeUserPassword',
    getUsernameFromRequest(req)
  );

  // 権限の確認
  const authResult: ApiReturnObject = await checkAuth(getToken(req), roll.view);
  if (authResult.statusNum !== RESULT.NORMAL_TERMINATION) {
    res.status(200).send(authResult);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const body: userObject = req.body.data as userObject;
    changePassword(body.user_id, body.password)
      .then((result) => res.status(200).send(result))
      .catch(next);
  }
});

/**
 * ユーザー更新
 */
router.post('/editUser/', async (req, res, next) => {
  logging(
    LOGTYPE.DEBUG,
    '呼び出し',
    'router',
    '/editUser',
    getUsernameFromRequest(req)
  );

  // 権限の確認
  const authResult: ApiReturnObject = await checkAuth(getToken(req), roll.view);
  if (authResult.statusNum !== RESULT.NORMAL_TERMINATION) {
    res.status(200).send(authResult);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const body: userObject = req.body.data as userObject;
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
 * getSearchColumns
 * patientlist
 * deleteCase
 */
router.get('/getSearchColumns', async (req, res, next) => {
  logging(LOGTYPE.DEBUG, '呼び出し', 'router', '/getSearchColumns');
  // ログイン画面でも使用するので権限を設定しない
  await getSearchColumns()
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.get('/patientlist', async (req, res, next) => {
  logging(
    LOGTYPE.DEBUG,
    '呼び出し',
    'router',
    '/patientlist',
    getUsernameFromRequest(req)
  );
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
      logging(
        LOGTYPE.ERROR,
        '権限エラー',
        'router',
        '/patientlist',
        getUsernameFromRequest(req)
      );
    }
  }
});

router.delete('/deleteCase/:caseId', async (req, res, next) => {
  logging(
    LOGTYPE.DEBUG,
    '呼び出し',
    'router',
    '/deleteCase',
    getUsernameFromRequest(req)
  );
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
    logging(
      LOGTYPE.ERROR,
      '権限エラー',
      'router',
      '/deleteCase',
      getUsernameFromRequest(req)
    );
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
  logging(
    LOGTYPE.DEBUG,
    '呼び出し',
    'router',
    '/registrationCaseAndDocument',
    getUsernameFromRequest(req)
  );
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
    logging(
      LOGTYPE.ERROR,
      '権限エラー',
      'router',
      '/registrationCaseAndDocument',
      getUsernameFromRequest(req)
    );
  }
});

router.get('/getCaseAndDocument/:caseId', async (req, res, next) => {
  logging(
    LOGTYPE.DEBUG,
    '呼び出し',
    'router',
    '/getCaseAndDocument',
    getUsernameFromRequest(req)
  );
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
    logging(
      LOGTYPE.ERROR,
      '権限エラー',
      'router',
      '/getCaseAndDocument',
      getUsernameFromRequest(req)
    );
  }
});

// eslint-disable-next-line
router.get('/getblacklist/', async (req, res, next) => {
  logging(
    LOGTYPE.DEBUG,
    '呼び出し',
    'router',
    '/getblacklist',
    getUsernameFromRequest(req)
  );
  // 権限の確認
  const authResult: ApiReturnObject = await checkAuth(
    getToken(req),
    roll.systemManage
  );
  if (authResult.statusNum !== RESULT.NORMAL_TERMINATION) {
    res.status(200).send(authResult);
  }
  if (authResult.body) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    getInfiniteLoopBlackList()
      .then((result) => res.status(200).send(result))
      .catch(next);
  }
  // 権限が無い場合
  else {
    logging(
      LOGTYPE.ERROR,
      '権限エラー',
      'router',
      '/getblacklist',
      getUsernameFromRequest(req)
    );
  }
});

/**
 * 症例登録画面用 end
 */

/**
 * システム設定用 start
 */
router.get('/getSettings/', async (req, res, next) => {
  logging(LOGTYPE.DEBUG, '呼び出し', 'router', '/getSettings');
  // ログイン画面でも使用するので権限を設定しない
  await getSettings()
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.post('/updateSettings/', async (req, res, next) => {
  logging(
    LOGTYPE.DEBUG,
    '呼び出し',
    'router',
    '/updateSettings',
    getUsernameFromRequest(req)
  );
  // 権限の確認
  const authResult: ApiReturnObject = await checkAuth(
    getToken(req),
    roll.systemManage
  );
  if (authResult.statusNum !== RESULT.NORMAL_TERMINATION) {
    res.status(200).send(authResult);
  }
  if (authResult.body) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    updateSettings(req.body.data as settings)
      .then((result) => res.status(200).send(result))
      .catch(next);
  }
  // 権限が無い場合
  else {
    logging(
      LOGTYPE.ERROR,
      '権限エラー',
      'router',
      '/updateSettings',
      getUsernameFromRequest(req)
    );
  }
});
/**
 * システム設定用 end
 */

/**
 * プラグイン用 start
 */
// eslint-disable-next-line
router.post('/upload/', upload.single('schemas'), async (req, res, next) => {
  logging(
    LOGTYPE.DEBUG,
    '呼び出し',
    'router',
    '/upload',
    getUsernameFromRequest(req)
  );
  // 権限の確認
  const authResult: ApiReturnObject = await checkAuth(
    getToken(req),
    roll.systemManage
  );
  if (authResult.statusNum !== RESULT.NORMAL_TERMINATION) {
    res.status(200).send(authResult);
  }
  if (authResult.body) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    uploadZipFile(req.file)
      .then((result) => res.status(200).send(result))
      .catch(next);
  }
  // 権限が無い場合
  else {
    logging(
      LOGTYPE.ERROR,
      '権限エラー',
      'router',
      '/upload',
      getUsernameFromRequest(req)
    );
  }
});

// eslint-disable-next-line
router.get('/gettree/', async (req, res, next) => {
  logging(
    LOGTYPE.DEBUG,
    '呼び出し',
    'router',
    '/gettree',
    getUsernameFromRequest(req)
  );
  // 権限の確認
  const authResult: ApiReturnObject = await checkAuth(
    getToken(req),
    roll.systemManage
  );
  if (authResult.statusNum !== RESULT.NORMAL_TERMINATION) {
    res.status(200).send(authResult);
  }
  if (authResult.body) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    getSchemaTree()
      .then((result) => res.status(200).send(result))
      .catch(next);
  }
  // 権限が無い場合
  else {
    logging(
      LOGTYPE.ERROR,
      '権限エラー',
      'router',
      '/gettree',
      getUsernameFromRequest(req)
    );
  }
});

router.post('/updateSchemas/', async (req, res, next) => {
  logging(
    LOGTYPE.DEBUG,
    '呼び出し',
    'router',
    '/updateSchemas',
    getUsernameFromRequest(req)
  );
  // 権限の確認
  const authResult: ApiReturnObject = await checkAuth(
    getToken(req),
    roll.systemManage
  );
  if (authResult.statusNum !== RESULT.NORMAL_TERMINATION) {
    res.status(200).send(authResult);
  }
  if (authResult.body) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    updateSchemas(req.body.data as JesgoDocumentSchema[])
      .then((result) => res.status(200).send(result))
      .catch(next);
  }
  // 権限が無い場合
  else {
    logging(
      LOGTYPE.ERROR,
      '権限エラー',
      'router',
      '/updateSchemas',
      getUsernameFromRequest(req)
    );
  }
});
/**
 * プラグイン用 end
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
