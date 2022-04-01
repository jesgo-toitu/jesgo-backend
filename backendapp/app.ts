// ライブラリ読み込み
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import router from './routes/';
const app = express();
app.use(helmet());
app.use(cors());

//body-parserの設定
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 3000; // port番号を指定

// ------ ルーティング ------ //
app.use('/', router);

//サーバ起動
app.listen(port);
console.log(`listen on port ${port}`);
