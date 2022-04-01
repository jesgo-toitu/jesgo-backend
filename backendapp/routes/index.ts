import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import {
  decordJwt,
  dispUser,
  editUserProfile,
  editMyProfile,
  Jwt,
  loginUser,
  signUpUser,
  lookupUser,
  userObject,
} from '../services/Users';
import {
  searchPatientRequest,
  searchPatients,
} from '../services/SearchPatient';
import { searchDocumentFromCaseId } from '../services/SearchDocument';
import { jsonToSchema } from '../services/JsonToDatabase';
import { checkAuth, roll } from '../logic/Auth';
import Router from 'express-promise-router';
import {
  getCaseAndDocument,
  getJsonSchema,
  getJsonSchemaBody,
  registrationCaseAndDocument,
  SaveDataObjDefine,
} from '../services/Schemas';

const app = express();
app.use(helmet());
app.use(cors());
// ルーティングする

const router = Router();

// routerにルーティングの動作を記述する
router.post('/registrationCaseAndDocument/', (req, res, next) => {
  registrationCaseAndDocument(req.body as SaveDataObjDefine)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.get('/getCaseAndDocument/:caseId', (req, res, next) => {
  getCaseAndDocument(Number(req.params.caseId))
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.post('/json2schema/', (req, res, next) => {
  jsonToSchema()
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.post('/getJsonSchema', async (req, res, next) => {
  // ★TODO : stab
  /*
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
    res.redirect("/login");
  }
  
  // const result: boolean = await checkAuth(user_id, roll.add);
  */
  const result = true;

  if (result) {
    getJsonSchema(req.body as getJsonSchemaBody)
      .then((result) => res.status(200).send(result))
      .catch(next);
  }
  // 権限が無い場合
  else {
    console.log('auth error');
    res.redirect('/login');
  }
});

router.get('/patientlist', async (req, res, next) => {
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
    res.redirect('/login');
  }

  const result: boolean = await checkAuth(user_id, roll.view);
  if (result) {
    searchPatients(req.query as searchPatientRequest)
      .then((result) => res.status(200).send(result))
      .catch(next);
  }
  // 権限が無い場合
  else {
    console.log('auth error');
    res.redirect('/login');
  }
});

router.get('/document/:caseid', (req, res, next) => {
  searchDocumentFromCaseId(req.params.caseid)
    .then((result) => res.status(200).send(result))
    .catch(next);
});

router.post('/signup/', async (req, res, next) => {
  const body: userObject = req.body as userObject;
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
    res.redirect('/login');
  }

  const result: boolean = await checkAuth(user_id, roll.systemManage);
  if (result) {
    signUpUser(body.name, body.display_name, body.password, body.roll_id)
      .then((result) => res.status(200).send(result))
      .catch(next);
  }
  // 権限が無い場合
  else {
    console.log('auth error');
    res.redirect('/login');
  }
});

router.post('/edituserprofile/', async (req, res, next) => {
  const body: userObject = req.body as userObject;
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
    res.redirect('/login');
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
    res.redirect('/login');
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
    res.redirect('/login');
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
    res.redirect('/login');
  }
});

router.post('/editmyprofile/', (req, res, next) => {
  const body: userObject = req.body as userObject;
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
    res.redirect('/login');
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
    res.redirect('/login');
  }
});

router.post('/login/', (req, res, next) => {
  console.log(req.body);
  const body: userObject = req.body as userObject;
  loginUser(body.name, body.password)
    .then((result) => res.status(200).send(result))
    .catch(next);
});
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
