import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { decordJwt, dispUser, editUserProfile, editMyProfile, Jwt, loginUser, signUpUser, lookupUser } from '../services/Users'
import { searchPatientFromName } from '../services/SearchPatient';
import { searchDocumentFromCaseId } from '../services/SearchDocument';
import { checkAuth, roll } from '../logic/Auth';
import Router from 'express-promise-router'

const app = express();
app.use(helmet());
app.use(cors());
// ルーティングする

const router = Router()

// routerにルーティングの動作を記述する

router.get('/search/:name', (req, res, next) => {
    searchPatientFromName(req.params.name)
        .then(result => res.status(200).send(result))
        .catch(next);
});

router.get('/document/:caseid', (req, res, next) => {
    searchDocumentFromCaseId(req.params.caseid)
        .then(result => res.status(200).send(result))
        .catch(next);
});

router.post('/signup/', async (req, res, next) => {

    let user_id = -1;
    if (req.header('token') != null) {
        console.log("token ready")
        let token: Jwt = { token: req.header('token') as string }
        const userInfo: dispUser = decordJwt(token) as dispUser;
        user_id = userInfo.user_id;
    } else
    // トークンがない場合
    {
        console.log("token not ready");
    }

    const result: boolean = await checkAuth(user_id, roll.systemManage);
    if (result) {
        signUpUser(req.body.name, req.body.display_name, req.body.password, req.body.roll_id)
            .then(result => res.status(200).send(result))
            .catch(next);
    } else
    // 権限が無い場合
    {

    }
});

router.post('/edituserprofile/', async (req, res, next) => {

    let user_id = -1;
    if (req.header('token') != null) {
        console.log("token ready")
        let token: Jwt = { token: req.header('token') as string }
        const userInfo: dispUser = decordJwt(token) as dispUser;
        user_id = userInfo.user_id;
    } else
    // トークンがない場合
    {
        console.log("token not ready");
    }

    const result: boolean = await checkAuth(user_id, roll.systemManage);
    if (result) {
        editUserProfile(req.body.user_id, req.body.name, req.body.display_name, req.body.password, req.body.roll_id)
            .then(result => res.status(200).send(result))
            .catch(next);
    } else
    // 権限が無い場合
    {

    }
});

router.get('/search/', async (req, res, next) => {
    let user_id = -1;
    if (req.header('token') != null) {
        console.log("token ready")
        let token: Jwt = { token: req.header('token') as string }
        const userInfo: dispUser = decordJwt(token) as dispUser;
        user_id = userInfo.user_id;
    } else
    // トークンがない場合
    {
        console.log("token not ready");
    }

    const result: boolean = await checkAuth(user_id, roll.view);
    if (result) {
        lookupUser()
            .then(result => res.status(200).send(result))
            .catch(next);
    } else
    // 権限が無い場合
    {

    }
})

router.post('/editmyprofile/', async (req, res, next) => {

    let user_id = -1;
    if (req.header('token') != null) {
        console.log("token ready")
        let token: Jwt = { token: req.header('token') as string }
        const userInfo: dispUser = decordJwt(token) as dispUser;
        user_id = userInfo.user_id;
    } else
    // トークンがない場合
    {
        console.log("token not ready");
    }

    // ★TODO：stab
    user_id = req.body.user_id;

    if (user_id == req.body.user_id) {
        editMyProfile(req.body.user_id, req.body.name, req.body.display_name, req.body.password)
            .then(result => res.status(200).send(result))
            .catch(next);
    } else
    // 自分の情報で無い場合
    {

    }
});

router.post('/login/', (req, res, next) => {
    console.log(req.body);
    loginUser(req.body.name, req.body.password)
        .then(result => res.status(200).send(result))
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
            message: 'not found'
        },
    });
});

//routerをモジュールとして扱う準備
module.exports = router;