import { DbAccess } from '../logic/DbAccess';
import {
  cutTempPath,
  formatDate,
  formatTime,
  GetPatientHash,
  Obj,
  streamPromise,
} from '../logic/Utility';
import { ApiReturnObject, RESULT } from '../logic/ApiCommon';
import { jesgoCaseDefine } from './Schemas';
import lodash from 'lodash';
import { logging, LOGTYPE } from '../logic/Logger';
import { readdirSync, rename } from 'fs';
import * as fs from 'fs';
import fse from 'fs-extra';
import * as path from 'path';
import UUID from 'uuidjs';
import { Extract } from 'unzipper';
import pathModule from 'path';

export interface PackageDocumentRequest {
  jesgoCaseList: jesgoCaseDefine[];
  schema_id?: number;
  document_id?: number;
  attachPatientInfoDetail?: boolean;
}

// 1患者情報の定義
export interface PatientItemDefine {
  hash: string;
  his_id?: string;
  date_of_birth?: string;
  name?: string;
  decline: boolean;
  documentList?: object[];
}

// jesgo_doumentテーブルからSELECTする項目定義
export type jesgoDocumentSelectItem = {
  document_id: number;
  case_id: number;
  event_date?: Date;
  document?: object;
  child_documents?: number[];
  schema_id: number;
  schema_primary_id: number;
  title: string;
  root_order: number;
};

// ドキュメント生成
const generateDocument = (
  docId: number,
  srcDocList: jesgoDocumentSelectItem[],
  baseObject: Obj
) => {
  const parentDoc = srcDocList.find((p) => p.document_id === docId);
  if (parentDoc) {
    // 同名タイトルがあれば配列にする
    // eslint-disable-next-line no-prototype-builtins
    if ((baseObject as object).hasOwnProperty(parentDoc.title)) {
      if (!Array.isArray(baseObject[parentDoc.title])) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const tmp = baseObject[parentDoc.title];
        baseObject[parentDoc.title] = [];

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        baseObject[parentDoc.title].push(tmp);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        baseObject[parentDoc.title].push(parentDoc.document);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        baseObject[parentDoc.title].push(parentDoc.document);
      }
    } else {
      baseObject[parentDoc.title] = lodash.cloneDeep(parentDoc.document);
    }

    // 子ドキュメント取得
    if (parentDoc.child_documents && parentDoc.child_documents.length > 0) {
      parentDoc.child_documents.forEach((childDocId) => {
        generateDocument(
          childDocId,
          srcDocList,
          baseObject[parentDoc.title] as Obj
        );
      });
    }
  }
};

/**
 * ひとまとめになったドキュメントを取得
 * @param reqest
 * @returns
 */
export const getPackagedDocument = async (reqest: PackageDocumentRequest) => {
  const { jesgoCaseList, schema_id, document_id, attachPatientInfoDetail } =
    reqest;

  const ret: PatientItemDefine[] = [];

  const dbAccess = new DbAccess();

  try {
    await dbAccess.connectWithConf();

    // 初めに対象の患者データおよびドキュメントデータをDBから取得してから
    // 各患者のオブジェクトを生成していく

    //#region DB取得

    const caseIdList = jesgoCaseList.map((p) => p.case_id);
    // 患者情報取得
    const caseRecords = (await dbAccess.query(
      'select case_id, date_of_birth, his_id, name, decline from jesgo_case where case_id = any($1)',
      [caseIdList]
    )) as {
      case_id: number;
      date_of_birth: Date;
      his_id: string;
      name: string;
      decline: boolean;
    }[];

    // ドキュメントリスト取得

    // 抽出条件
    const whereList: [string, any][] = [];
    whereList.push(['case_id', caseIdList]);
    whereList.push(['deleted', false]);
    // ドキュメントIDまたはスキーマIDで抽出
    if (document_id) {
      whereList.push(['document_id', document_id]);
    } else if (schema_id) {
      whereList.push(['schema_id', schema_id]);
    }

    // 再帰クエリで指定ドキュメントと子ドキュメントを一括取得する
    // #region [ 一連のドキュメント取得用SQL ]
    let select = `with recursive tmp as (
  select 
    document_id,
    case_id,
    event_date,
    document,
    child_documents,
    doc.schema_id,
    doc.schema_primary_id,
    sc.title,
    doc.root_order
  from jesgo_document doc 
  left join jesgo_document_schema sc on doc.schema_id = sc.schema_id `;
    if (whereList.length > 0) {
      select += 'where ';
      for (let i = 0; i < whereList.length; i++) {
        if (i > 0) select += 'and ';

        if (Array.isArray(whereList[i][1])) {
          select += `doc.${whereList[i][0]} = any($${i + 1}) `;
        } else {
          select += `doc.${whereList[i][0]} = $${i + 1} `;
        }
      }
    }
    select += `
  union
  select 
    doc.document_id,
    doc.case_id,
    doc.event_date,
    doc.document,
    doc.child_documents,
    doc.schema_id,
    doc.schema_primary_id,
    sc.title,
    doc.root_order 
  from tmp, jesgo_document as doc 
    left join jesgo_document_schema sc on doc.schema_id = sc.schema_id 
  where doc.document_id = any(tmp.child_documents) and doc.deleted = false
  )
  select * from tmp order by document_id desc`;
    // #endregion

    const documentRecords = (await dbAccess.query(
      select,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      whereList.map((p) => p[1])
    )) as jesgoDocumentSelectItem[];
    //#endregion

    for (const patInfo of caseRecords) {
      // 患者ハッシュ値取得
      const hash = GetPatientHash(patInfo.date_of_birth, patInfo.his_id);

      // 患者情報
      const patItem: PatientItemDefine = {
        hash: hash,
        decline: patInfo.decline,
      };
      // 患者IDや氏名など詳細を載せても良い場合は設定する
      if (attachPatientInfoDetail) {
        patItem.his_id = patInfo.his_id;
        patItem.date_of_birth = formatDate(patInfo.date_of_birth, '-');
        patItem.name = patInfo.name;
      }

      patItem.documentList = [];

      // 対象患者で絞る
      const documentRecordsPatient = documentRecords.filter(
        (p) => p.case_id === patInfo.case_id
      );

      const filtered = documentRecordsPatient
        .filter((p) => {
          // 対象ドキュメントもしくはスキーマがあればそちらで抽出
          if (document_id) {
            return p.document_id == document_id;
          } else if (schema_id) {
            return p.schema_id === schema_id;
          } else {
            // ドキュメント未指定の場合はルートドキュメントから処理
            return p.root_order > -1;
          }
        })
        .sort((f, s) =>
          document_id || schema_id ? 0 : f.root_order - s.root_order
        );
      // 同名タイトルでグループ化
      const group = lodash.groupBy(filtered, 'title');
      Object.entries(group).forEach((keyval) => {
        // グループ単位でドキュメント生成
        const tmpObj: Obj = {};
        keyval[1].forEach((item) => {
          generateDocument(item.document_id, documentRecordsPatient, tmpObj);
        });
        patItem.documentList?.push(tmpObj);
      });

      ret.push(patItem);
    }
  } catch {
    return { statusNum: RESULT.ABNORMAL_TERMINATION, body: null };
  } finally {
    await dbAccess.end();
  }

  return { statusNum: RESULT.NORMAL_TERMINATION, body: ret };
};

export type jesgoPluginColumns = {
  plugin_id?: number;
  plugin_name: string;
  plugin_version?: string;
  script_text: string;
  target_schema_id?: number[];
  target_schema_id_string?: string;
  all_patient: boolean;
  update_db: boolean;
  attach_patient_info: boolean;
  show_upload_dialog: boolean;
  filter_schema_query?: string;
  explain?: string;
};

/**
 * プラグイン一覧取得
 * @returns
 */
export const getPluginList = async () => {
  logging(LOGTYPE.DEBUG, '呼び出し', 'Plugin', 'getPluginList');
  const dbAccess = new DbAccess();

  try {
    await dbAccess.connectWithConf();

    const pluginRecords = (await dbAccess.query(
      `select
      plugin_id, plugin_name, plugin_version, script_text,
      target_schema_id, target_schema_id_string, all_patient, update_db, attach_patient_info, show_upload_dialog, filter_schema_query, explain
      from jesgo_plugin
      where deleted = false
      order by plugin_id`
    )) as jesgoPluginColumns[];

    return { statusNum: RESULT.NORMAL_TERMINATION, body: pluginRecords };
  } catch (err) {
    logging(
      LOGTYPE.ERROR,
      `エラー発生 ${(err as Error).message}`,
      'Plugin',
      'getPluginList'
    );
    return { statusNum: RESULT.ABNORMAL_TERMINATION, body: null };
  } finally {
    await dbAccess.end();
  }
};

// モジュールのFunc定義インターフェース
interface IPluginModule {
  init: () => Promise<jesgoPluginColumns>;
  main: (source: any, func: any) => Promise<any>;
  finalize?: () => Promise<void>;
}

type initValueInfo = {
  path: string;
  errorMessage?: string;
  initValue?: jesgoPluginColumns;
};

/**
 * プラグインのinitを実行し、得られた情報を返す
 * @param requireEsm
 * @param filePath
 * @returns
 */
const initJs = async (requireEsm: any, filePath: string) => {
  const retValue: initValueInfo = { path: filePath };

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const loadModule: IPluginModule = await requireEsm(
      pathModule.join(process.cwd(), filePath)
    );

    // init関数のチェック、内容取得
    if (loadModule.init) {
      if (loadModule.init.constructor.name !== 'AsyncFunction') {
        throw {
          name: 'init',
          message: 'init関数が非同期関数(async)ではありません',
        };
      }

      const initResult = await loadModule.init();
      if (initResult) {
        initResult.script_text = fs.readFileSync(
          pathModule.join(process.cwd(), filePath),
          { encoding: 'utf8' }
        );

        // show_upload_dialogは未設定時はTrueをデフォルトにする
        initResult.show_upload_dialog = initResult.show_upload_dialog ?? true;

        retValue.initValue = initResult;
      }
    } else {
      throw { name: 'init', message: 'init関数が定義されていません' };
    }

    // main関数のチェック
    if (!loadModule.main) {
      throw { name: 'main', message: 'main関数が定義されていません' };
    } else if (loadModule.main.constructor.name !== 'AsyncFunction') {
      throw {
        name: 'main',
        message: 'main関数が非同期関数(async)ではありません',
      };
    }

    // finalize関数のチェック(必須ではない)
    if (
      loadModule.finalize &&
      loadModule.finalize.constructor.name !== 'AsyncFunction'
    ) {
      throw {
        name: 'finalize',
        message: 'finalize関数が非同期関数(async)ではありません',
      };
    }
  } catch (err) {
    retValue.errorMessage = (err as Error).message;
  }

  return retValue;
};

/**
 * initの値チェック
 * @param initValue
 * @returns
 */
const checkInitValue = (initValue: jesgoPluginColumns) => {
  const errorMessages: string[] = [];

  if (!initValue.plugin_name) {
    errorMessages.push('plugin_nameが未設定です');
  }
  if (!initValue.plugin_version) {
    errorMessages.push('plugin_versionが未設定です');
  }
  if (initValue.all_patient === undefined) {
    errorMessages.push('all_patientが未設定です');
  }
  if (initValue.update_db === undefined) {
    errorMessages.push('update_dbが未設定です');
  }
  if (initValue.attach_patient_info === undefined) {
    errorMessages.push('attach_patient_infoが未設定です');
  }

  return errorMessages;
};

/**
 * schema_id_stringからschema_id取得(継承スキーマ含む)
 * @param schema_id_string
 * @returns
 */
const getRelationSchemaIds = async (schema_id_string: string) => {
  let schemaIds: number[] | undefined = undefined;
  const dbAccess = new DbAccess();

  try {
    await dbAccess.connectWithConf();

    const inheritSchemaIds = (await dbAccess.query(
      `SELECT schema_id, inherit_schema FROM view_latest_schema WHERE schema_id_string = $1 AND schema_id <> 0`,
      [schema_id_string]
    )) as { schema_id: number; inherit_schema: number[] }[];

    if (inheritSchemaIds.length > 0) {
      schemaIds = [];

      inheritSchemaIds.forEach((item) => {
        schemaIds?.push(item.schema_id, ...item.inherit_schema);
      });
    }
  } finally {
    await dbAccess.end();
  }

  return schemaIds;
};

/**
 * プラグイン(スクリプト)のinitの情報を取得(正常なもののみ)
 * @param fileList
 * @param dirPath
 * @param errorMessages
 * @returns
 */
const getInitValues = async (
  fileList: string[],
  dirPath: string,
  errorMessages: string[]
) => {
  logging(LOGTYPE.DEBUG, `呼び出し`, 'Plugin', 'getInitValues');

  const retValue: jesgoPluginColumns[] = [];

  // jsファイルで抽出
  const jsFileNames = fileList.filter((path) =>
    path.toLowerCase().endsWith('.js')
  );

  // jsファイル以外はログ出力して処理しない
  fileList
    .filter((path) => jsFileNames.includes(path) === false)
    .forEach((filePath) => {
      logging(
        LOGTYPE.ERROR,
        `[${cutTempPath(
          dirPath,
          filePath
        )}]JSファイル以外のファイルが含まれています。`,
        'Plugin',
        'getInitValues'
      );
      errorMessages.push(
        `[${cutTempPath(
          dirPath,
          filePath
        )}]JSファイル以外のファイルが含まれています。`
      );
    });

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
    const requireEsm = require('esm')(module);
    // jsファイルのinitから情報取得
    const initValList = await Promise.all(
      jsFileNames.map(async (path) => await initJs(requireEsm, path))
    );

    for (const info of initValList) {
      // init実行時にエラーが出たものは除外する
      if (info.errorMessage) {
        errorMessages.push(
          `[${cutTempPath(dirPath, info.path)}] エラー：(${info.errorMessage})`
        );
      } else if (info.initValue) {
        // initから得られた情報に不足がないかチェック
        const initValueErrors = checkInitValue(info.initValue);
        if (initValueErrors.length > 0) {
          errorMessages.push(
            ...initValueErrors.map(
              (msg) => `[${cutTempPath(dirPath, info.path)}] init()：${msg}`
            )
          );
        } else {
          let allowPush = true;
          // target_schema_id_stringからtarget_schema_idを取得する
          info.initValue.target_schema_id = undefined; // 一旦クリア
          // target_schema_id_stringが指定されていた場合、DBからスキーマID(数値)を取得する
          if (info.initValue.target_schema_id_string) {
            const targetSchemaIdList = await getRelationSchemaIds(
              info.initValue.target_schema_id_string
            );
            if (targetSchemaIdList && targetSchemaIdList.length > 0) {
              info.initValue.target_schema_id = targetSchemaIdList;
            } else {
              // 見つからない場合はエラー
              allowPush = false;
              errorMessages.push(
                `[${cutTempPath(
                  dirPath,
                  info.path
                )}] init()：target_schema_id_stringに、存在しないスキーマIDが設定されています。`
              );
            }
          }

          if (allowPush) {
            // initの内容に問題がなければ追加
            retValue.push(info.initValue);
          }
        }
      }
    }

    return retValue;
  } catch (err) {
    throw err as Error;
  }
};

const jesgoPluginColmnNames = [
  'plugin_name',
  'plugin_version',
  'script_text',
  'target_schema_id',
  'target_schema_id_string',
  'all_patient',
  'update_db',
  'attach_patient_info',
  'show_upload_dialog',
  'filter_schema_query',
  'explain',
  'registrant',
];

/**
 * プラグイン登録処理
 * @param pluginInfoList
 * @param userId
 * @returns
 */
const registerToJesgoPluginDB = async (
  pluginInfoList: jesgoPluginColumns[],
  userId: number | undefined
): Promise<{ updateCount: number; errorMessages: string[] }> => {
  const dbAccess = new DbAccess();

  let updateCount = 0;
  const errorMessages: string[] = [];

  try {
    await dbAccess.connectWithConf();

    // 登録用SQL生成
    // 同じplugin_nameのものが登録されていたらinsertからupdateに切り替える(on conflict使用)
    const sql = `insert into jesgo_plugin (${jesgoPluginColmnNames.join(
      ', '
    )}, last_updated) 
      values (${jesgoPluginColmnNames
        .map((_col, idx) => `$${idx + 1}`)
        .join(', ')}, NOW()) 
      on conflict (plugin_name) 
      do update set ${jesgoPluginColmnNames
        .filter((p) => p !== 'plugin_name')
        .map((col) => {
          // plugin_name除いた分indexずれるので元のindexを使用する
          return `${col} = $${jesgoPluginColmnNames.indexOf(col) + 1}`;
        })
        .join(', ')}, last_updated = NOW()`;

    for (const info of pluginInfoList) {
      try {
        // 更新用パラメータ生成
        const params = jesgoPluginColmnNames.map((colName) => {
          if (colName === 'registrant') return userId;
          else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return (info as Obj)[colName];
          }
        });

        // クエリ実行
        const result = await dbAccess.query(sql, params, 'update');
        updateCount += result as number;
      } catch (err) {
        errorMessages.push((err as Error).message);
        await dbAccess.rollback();
      }
    }
  } catch (err) {
    errorMessages.push((err as Error).message);
  } finally {
    await dbAccess.end();
  }

  return { updateCount, errorMessages };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const uploadPluginZipFile = async (
  data: any,
  userId: number | undefined
): Promise<ApiReturnObject> => {
  logging(LOGTYPE.DEBUG, '呼び出し', 'Plugin', 'uploadPluginZipFile');
  // eslint-disable-next-line
  const filePath: string = data.path;
  const errorMessages: string[] = [];

  // eslint-disable-next-line import/no-named-as-default-member
  const dirPath = `./tmp/${UUID.generate()}`;

  // eslint-disable-next-line
  const fileType: string = path.extname(data.originalname).toLowerCase();
  try {
    switch (fileType) {
      case '.zip':
        await streamPromise(
          fs.createReadStream(filePath).pipe(Extract({ path: dirPath }))
        );
        break;
      case '.js':
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
        // eslint-disable-next-line
        fs.copyFileSync(filePath, path.join(dirPath, data.originalname));
        break;
      default:
        throw new Error('.zipファイルか.jsファイルを指定してください.');
    }

    const listFiles = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((dirent) =>
        dirent.isFile()
          ? [`${dir}/${dirent.name}`]
          : listFiles(`${dir}/${dirent.name}`)
      );

    let fileList: string[] = [];

    try {
      fileList = listFiles(dirPath);
    } catch {
      logging(
        LOGTYPE.ERROR,
        `展開に失敗したか、ファイルの内容がありません。`,
        'Plugin',
        'uploadPluginZipFile'
      );
      return {
        statusNum: RESULT.ABNORMAL_TERMINATION,
        body: {
          number: 0,
          message: ['展開に失敗したか、ファイルの内容がありません。'],
        },
      };
    }

    // プラグインを解析して情報取得
    const pluginInfoList = await getInitValues(
      fileList,
      dirPath,
      errorMessages
    );

    const result = await registerToJesgoPluginDB(pluginInfoList, userId);

    return {
      statusNum: RESULT.NORMAL_TERMINATION,
      body: {
        number: result.updateCount,
        message: [...errorMessages, ...result.errorMessages],
      },
    };
  } catch (e) {
    if ((e as Error).message.length > 0) {
      logging(
        LOGTYPE.ERROR,
        (e as Error).message,
        'Plugin',
        'uploadPluginZipFile'
      );
    }
    return {
      statusNum: RESULT.ABNORMAL_TERMINATION,
      body: { number: 0, message: errorMessages },
    };
  } finally {
    try {
      // ファイルをリネームして保管
      const date = `${formatDate(new Date())}${formatTime(new Date())}`;
      const migratePath = `uploads/${date}${fileType}`;
      rename(filePath, migratePath, (err) => {
        if (err) {
          logging(
            LOGTYPE.ERROR,
            `エラー発生 ${err.message}`,
            'Plugin',
            'uploadPluginZipFile'
          );
        }
        logging(LOGTYPE.DEBUG, `リネーム完了`, 'Plugin', 'uploadPluginZipFile');
      });
    } catch {
      logging(
        LOGTYPE.ERROR,
        `リネーム対象無し`,
        'Plugin',
        'uploadPluginZipFile'
      );
    }

    // 展開したファイルを削除
    // eslint-disable-next-line
    fse.remove(path.join(dirPath, path.sep), (err) => {
      if (err) {
        logging(
          LOGTYPE.ERROR,
          `エラー発生 ${err.message}`,
          'Plugin',
          'uploadPluginZipFile'
        );
      }
      logging(
        LOGTYPE.DEBUG,
        `展開したファイルを削除完了`,
        'Plugin',
        'uploadPluginZipFile'
      );
    });
  }
};

export const deletePlugin = async (pluginId:number) => {
  logging(LOGTYPE.DEBUG, '呼び出し', 'Plugin', 'deletePlugin');

  const dbAccess = new DbAccess();
  await dbAccess.connectWithConf();

  let result = RESULT.NORMAL_TERMINATION;

  const ret = await dbAccess.query(
    'UPDATE jesgo_plugin SET deleted = true WHERE plugin_id = $1',
    [pluginId]
  );
  await dbAccess.end();
  if (ret) {
    logging(LOGTYPE.INFO, `delete success plugin_id: ${pluginId}`, 'Plugin', 'deletePlugin');
  } else {
    result = RESULT.ABNORMAL_TERMINATION;
  }
  return { statusNum: result, body: null };
}