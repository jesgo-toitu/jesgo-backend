// ライブラリ読み込み
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import router from './routes/';
import { logging, LOGTYPE } from './logic/Logger';
const app = express();
app.use(helmet());
app.use(cors());

//body-parserの設定
app.use(bodyParser.urlencoded({ extended: true, limit: '150kb' }));
app.use(bodyParser.json({ limit: '150kb' }));

const port = process.env.PORT || 3000; // port番号を指定

// ------ ルーティング ------ //
app.use('/', router);

//サーバ起動
app.listen(port);
logging(LOGTYPE.INFO, `listen on port ${port}`);
// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
console.log(`express: start. port=${port}, mode=${app.get('env')}`);
console.log('JESGO サーバー起動中...');
