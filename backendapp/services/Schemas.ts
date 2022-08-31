import { logging, LOGTYPE } from '../logic/Logger';
import { ApiReturnObject, RESULT } from '../logic/ApiCommon';
import { DbAccess } from '../logic/DbAccess';
import { JSONSchema7 } from './JsonToDatabase';

export interface getJsonSchemaBody {
  ids: number[] | undefined;
}

export type records = {
  [key: string]: schemaRecord;
};

// 症例情報の定義
// フロントのstore/schemaDataReducer.tsと同じものを使用するため
// どちらかに更新が入ったらもう片方も更新すること
export type JesgoDocumentSchema = {
  schema_id: number;
  schema_id_string: string;
  title: string;
  subtitle: string;
  document_schema: JSONSchema7;
  subschema: number[];
  child_schema: number[];
  inherit_schema: number[];
  base_schema: number | null;
  version_major: number;
  version_minor: number;
  schema_primary_id: number;
  subschema_default: number[];
  child_schema_default: number[];
};

export type schemaRecord = {
  schema_id: number;
  schema_id_string: string;
  title: string;
  subtitle: string;
  document_schema: string;
  uniqueness: boolean;
  hidden: boolean;
  subschema: number[];
  child_schema: number[];
  subschema_default: number[];
  child_schema_default: number[];
  inherit_schema: number[];
  base_schema: number | null;
  base_version_major: number;
  valid_from: Date;
  valid_until: Date;
  author: string;
  version_major: number;
  version_minor: number;
  plugin_id: number;
};

export type treeSchema = {
  schema_id: number;
  schema_title: string;
  subschema: treeSchema[];
  childschema: treeSchema[];
};

export const getJsonSchema = async (): Promise<ApiReturnObject> => {
  logging(LOGTYPE.DEBUG, `呼び出し`, 'Schemas', 'getJsonSchema');
  try {
    const query = `SELECT * FROM view_latest_schema ORDER BY schema_primary_id DESC`;

    const dbAccess = new DbAccess();
    await dbAccess.connectWithConf();
    const ret = (await dbAccess.query(query)) as schemaRecord[];
    await dbAccess.end();

    return { statusNum: RESULT.NORMAL_TERMINATION, body: ret };
  } catch (e) {
    logging(
      LOGTYPE.ERROR,
      `エラー発生 ${(e as Error).message}`,
      'Schemas',
      'getJsonSchema'
    );
    return { statusNum: RESULT.ABNORMAL_TERMINATION, body: null };
  }
};

export const getRootSchemaIds = async (): Promise<ApiReturnObject> => {
  logging(LOGTYPE.DEBUG, `呼び出し`, 'Schemas', 'getRootSchemaIds');
  try {
    const query = `SELECT subschema FROM view_latest_schema WHERE schema_id = 0`;

    const dbAccess = new DbAccess();
    await dbAccess.connectWithConf();
    const ret = (await dbAccess.query(query)) as {subschema:number[]}[];
    await dbAccess.end();

    const ids = ret[0].subschema;
    return { statusNum: RESULT.NORMAL_TERMINATION, body: ids };
  } catch (e) {
    logging(
      LOGTYPE.ERROR,
      `エラー発生 ${(e as Error).message}`,
      'Schemas',
      'getRootSchemaIds'
    );
    return { statusNum: RESULT.ABNORMAL_TERMINATION, body: [] };
  }
};

export const getSchemaTree = async (): Promise<ApiReturnObject> => {
  logging(LOGTYPE.DEBUG, `呼び出し`, 'Schemas', 'getScemaTree');
  try {
    // 最初にすべてのスキーマを取得
    const allSchemaObject = await getJsonSchema();
    const allSchemas = allSchemaObject.body as schemaRecord[];

    // 続いてにルートスキーマのIDを取得
    const rootIdObject = await getRootSchemaIds();
    const rootIds = rootIdObject.body as number[];

    // 保存用オブジェクト
    const schemaTrees: treeSchema[] = [];

    // ルートスキーマを順番にツリー用に処理する
    for (let index = 0; index < rootIds.length; index++) {
      const rootId = rootIds[index];

      // 対象のルートスキーマIDに一致するスキーマレコードを取得
      const rootSchema = allSchemas.find(
        (schema) => schema.schema_id === rootId
      );

      if (rootSchema) {
        // スキーマレコードが取得できた場合、ツリー用に処理する
        const rootSchemaForTree = schemaRecord2SchemaTree(
          rootSchema,
          allSchemas
        );
        schemaTrees.push(rootSchemaForTree);
      }
    }
    return { statusNum: RESULT.NORMAL_TERMINATION, body: schemaTrees };
  } catch (e) {
    logging(
      LOGTYPE.ERROR,
      `エラー発生 ${(e as Error).message}`,
      'Schemas',
      'getScemaTree'
    );
    return { statusNum: RESULT.ABNORMAL_TERMINATION, body: [] };
  }
};

/**
 * スキーマレコード1つと全スキーマを渡すとツリー形式で下位スキーマを取得した状態で返す
 * @param schemarRecord 対象のスキーマレコード
 * @param allSchemas 全スキーマのリスト
 * @returns ツリー形式に変換された対象のスキーマレコード
 */
export const schemaRecord2SchemaTree = (
  schemarRecord: schemaRecord,
  allSchemas: schemaRecord[]
): treeSchema => {
  const subSchemaList = allSchemas.filter((schema) =>
    schemarRecord.subschema.includes(schema.schema_id)
  );
  const childSchemaList = allSchemas.filter((schema) =>
    schemarRecord.child_schema.includes(schema.schema_id)
  );

  // サブスキーマ、子スキーマをDBに保存されている順番に並び替え
  subSchemaList.sort((a, b) => schemarRecord.subschema.indexOf(a.schema_id) - schemarRecord.subschema.indexOf(b.schema_id));
  childSchemaList.sort((a, b) => schemarRecord.child_schema.indexOf(a.schema_id) - schemarRecord.child_schema.indexOf(b.schema_id));

  const subSchemaListWithTree: treeSchema[] = [];
  const childSchemaListWithTree: treeSchema[] = [];

  for (let index = 0; index < subSchemaList.length; index++) {
    const schema = subSchemaList[index];
    subSchemaListWithTree.push(schemaRecord2SchemaTree(schema, allSchemas));
  }

  for (let index = 0; index < childSchemaList.length; index++) {
    const schema = childSchemaList[index];
    childSchemaListWithTree.push(schemaRecord2SchemaTree(schema, allSchemas));
  }

  return {
    schema_id: schemarRecord.schema_id,
    schema_title:
      schemarRecord.title +
      (schemarRecord.subtitle.length > 0 ? ' ' + schemarRecord.subtitle : ''),
    subschema: subSchemaListWithTree,
    childschema: childSchemaListWithTree,
  };
};

export const updateSchemas = async (
  schemas: JesgoDocumentSchema[]
): Promise<ApiReturnObject> => {
  logging(LOGTYPE.DEBUG, `呼び出し`, 'Schemas', 'updateChildSchemaga');
  const dbAccess = new DbAccess();
  try {
    await dbAccess.connectWithConf();

    for (const schema of schemas) {
      // 現状はサブスキーマ、子スキーマのみ、必要に応じて追加
      await dbAccess.query(
        'UPDATE jesgo_document_schema SET subschema = $1, child_schema = $2 WHERE schema_primary_id = $3',
        [schema.subschema, schema.child_schema, schema.schema_primary_id]
      );
    }

    return { statusNum: RESULT.NORMAL_TERMINATION, body: null };
  } catch (e) {
    logging(
      LOGTYPE.ERROR,
      `エラー発生 ${(e as Error).message}`,
      'Schemas',
      'getScemaTree'
    );
    return { statusNum: RESULT.ABNORMAL_TERMINATION, body: null };
  } finally {
    await dbAccess.end();
  }
};

// 検索用セレクトボックス取得APIのbody 他検索が増えたらプロパティを増やす
export type searchColumnsFromApi = {
  cancerTypes: string[];
};

/**
 * 検索用のセレクトボックスのデータを取得するAPI
 * @returns がん種の文字列配列(表示順)を持つオブジェクト
 */
export const getSearchColumns = async (): Promise<ApiReturnObject> => {
  logging(LOGTYPE.DEBUG, `呼び出し`, 'Schemas', 'getSearchColumns');

  type dbRow = {
    column_name: string;
  };

  try {
    const dbAccess = new DbAccess();
    await dbAccess.connectWithConf();

    // 現状ではがん種のみ、必要なら処理を増やす
    const cancerType: string[] = [];
    const ret = (await dbAccess.query(
      "SELECT column_name FROM jesgo_search_column WHERE column_type ='cancer_type' ORDER BY column_id"
    )) as dbRow[];
    for (let i = 0; i < ret.length; i++) {
      cancerType.push(ret[i].column_name);
    }
    // ここまで

    await dbAccess.end();

    const searchColumns: searchColumnsFromApi = {
      cancerTypes: cancerType,
    };

    return { statusNum: RESULT.NORMAL_TERMINATION, body: searchColumns };
  } catch (e) {
    logging(
      LOGTYPE.ERROR,
      `エラー発生 ${(e as Error).message}`,
      'Schemas',
      'getSearchColumns'
    );
    return { statusNum: RESULT.ABNORMAL_TERMINATION, body: [] };
  }
};

//
type jesgoDocumentFromDb = {
  document_id: number;
  case_id: number;
  event_date: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  document: any;
  child_documents: string[];
  schema_id: number;
  schema_primary_id: number;
  inherit_schema: number[];
  schema_major_version: number;
  registrant: number;
  last_updated: string;
  readonly: boolean;
  deleted: boolean;
  root_order: number;
};

// 症例情報の定義
export type jesgoCaseDefine = {
  case_id: string;
  name: string;
  date_of_birth: string;
  date_of_death: string;
  sex: string;
  his_id: string;
  decline: boolean;
  registrant: string;
  last_updated: string;
  is_new_case: boolean;
};

// valueの定義
export type jesgoDocumentValueItem = {
  case_id: string;
  event_date: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  document: any;
  child_documents: string[];
  schema_id: number;
  schema_primary_id: number;
  inherit_schema: number[];
  schema_major_version: number;
  registrant: number;
  last_updated: string;
  readonly: boolean;
  deleted: boolean;
};

// キーはdocument_idを入れる予定
export type jesgoDocumentObjDefine = {
  key: string;
  value: jesgoDocumentValueItem;
  root_order: number;
  event_date_prop_name: string;
  death_data_prop_name: string;
  delete_document_keys: string[];
};

// 保存用のオブジェクト この内容をJSON化して送信
export interface SaveDataObjDefine {
  jesgo_case: jesgoCaseDefine;
  jesgo_document: jesgoDocumentObjDefine[];
}

const str2Date = (dateStr: string): string | null => {
  if (dateStr === '') {
    return null;
  }
  return dateStr;
};

const str2Num = (numStr: string): number => {
  if (numStr === '') {
    return 0;
  }
  return Number(numStr);
};

/**
 *
 */
export const registrationCaseAndDocument = async (
  saveDataObjDefine: SaveDataObjDefine
): Promise<ApiReturnObject> => {
  logging(LOGTYPE.DEBUG, `呼び出し`, 'Schemas', 'registrationCaseAndDocument');
  // 戻り値 0:正常, -1:異常(不明), -2:ID被り

  const dbAccess = new DbAccess();

  try {
    await dbAccess.connectWithConf();
    // トランザクション開始
    await dbAccess.query('BEGIN');
    // HIS_IDが存在する場合はcase_idを取得
    let caseId = -1;
    const ret = (await dbAccess.query(
      'SELECT case_id, deleted FROM jesgo_case WHERE his_id = $1',
      [saveDataObjDefine.jesgo_case.his_id]
    )) as { case_id: number; deleted: boolean }[];
    if (ret.length > 0) {
      // - 同一IDの症例情報がある
      if (ret[0].deleted || saveDataObjDefine.jesgo_case.is_new_case == false) {
        // 削除済かPOSTされた情報が編集であれば取得したcase_idで症例情報を更新
        caseId = ret[0].case_id;
        await dbAccess.query(
          'UPDATE jesgo_case SET name = $1, date_of_birth = $2, date_of_death = $3, sex = $4, decline =$5, registrant = $6, deleted = false, last_updated = now() WHERE case_id = $7',
          [
            saveDataObjDefine.jesgo_case.name,
            str2Date(saveDataObjDefine.jesgo_case.date_of_birth),
            str2Date(saveDataObjDefine.jesgo_case.date_of_death),
            saveDataObjDefine.jesgo_case.sex,
            saveDataObjDefine.jesgo_case.decline,
            str2Num(saveDataObjDefine.jesgo_case.registrant),
            caseId,
          ]
        );
      } else {
        // - 新規作成で且つ被りIDが削除されていない場合は警告
        return { statusNum: RESULT.ID_DUPLICATION, body: null };
      }
    } else {
      // HIS_IDがなければcase_idを指定せずに症例情報を新規登録
      await dbAccess.query(
        'INSERT INTO jesgo_case (name, date_of_birth, date_of_death, sex, his_id, decline, registrant, last_updated) VALUES ($1, $2, $3, $4, $5, $6, $7, now())',
        [
          saveDataObjDefine.jesgo_case.name,
          str2Date(saveDataObjDefine.jesgo_case.date_of_birth),
          str2Date(saveDataObjDefine.jesgo_case.date_of_death),
          saveDataObjDefine.jesgo_case.sex,
          saveDataObjDefine.jesgo_case.his_id,
          saveDataObjDefine.jesgo_case.decline,
          str2Num(saveDataObjDefine.jesgo_case.registrant),
        ]
      );
      const lastValue = (await dbAccess.query(
        'SELECT last_value as case_id FROM jesgo_case_case_id_seq'
      )) as { case_id: number }[];
      // - 最新のcase_id(今登録したもの)を再取得
      caseId = lastValue[0].case_id;
    }

    const dummyNumber: { [key: string]: number } = {};
    // 最初に最大ループ回数を保存しておく(無限ループ防止のため)
    const initialLength = saveDataObjDefine.jesgo_document.length;
    let loopCount = 0;
    // 取得したcase_idを使って症例ドキュメントを更新/新規登録していく
    while (
      saveDataObjDefine.jesgo_document.length > 0 &&
      loopCount < initialLength
    ) {
      loopCount++;
      for (
        let index = 0;
        index < saveDataObjDefine.jesgo_document.length;
        index++
      ) {
        const jesgoDocumentCover = saveDataObjDefine.jesgo_document[index];
        const childDocumentsList = jesgoDocumentCover.value.child_documents;

        let isRegistration = false;

        // 子ドキュメントが1個もない場合(最下層)
        if (childDocumentsList.length == 0) {
          // ドキュメントをテーブルに登録予約をする
          isRegistration = true;
        } else {
          // 子ドキュメントが1個以上ある
          let hasDummyId = false;
          for (
            let childIndex = 0;
            childIndex < childDocumentsList.length;
            childIndex++
          ) {
            const childDocumentId = childDocumentsList[childIndex];

            // 仮IDかどうかのチェック
            if (childDocumentId.startsWith('K')) {
              // 仮IDの場合、対応するdocumentIdがあるか確認
              if (dummyNumber[childDocumentId]) {
                // 仮IDに対応するdocumentIdがある
                childDocumentsList[childIndex] =
                  dummyNumber[childDocumentId].toString();
              } else {
                // 仮IDに対応するdocumentIdがない
                hasDummyId = true;
              }
            }
            // 仮IDでない場合は何もしない
          }
          // 1つでも仮IDが残っていれば登録しない
          if (hasDummyId == false) {
            // ドキュメントをテーブルに登録予約をする
            isRegistration = true;
          }
        }

        // 登録予約がされている場合、登録を行う
        if (isRegistration) {
          // キーが仮IDがどうかを確認
          if (jesgoDocumentCover.key.startsWith('K')) {
            // 仮IDであれば新規登録をする
            await dbAccess.query(
              `INSERT INTO jesgo_document (
              case_id, 
              event_date, 
              document, 
              child_documents, 
              schema_id, 
              schema_major_version, 
              registrant, 
              last_updated, 
              readonly, 
              deleted, 
              root_order, 
              inherit_schema, 
              schema_primary_id 
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
              [
                caseId,
                str2Date(jesgoDocumentCover.value.event_date),
                JSON.stringify(jesgoDocumentCover.value.document),
                jesgoDocumentCover.value.child_documents,
                jesgoDocumentCover.value.schema_id,
                jesgoDocumentCover.value.schema_major_version,
                jesgoDocumentCover.value.registrant,
                jesgoDocumentCover.value.last_updated,
                jesgoDocumentCover.value.readonly,
                jesgoDocumentCover.value.deleted,
                jesgoDocumentCover.root_order,
                jesgoDocumentCover.value.inherit_schema,
                jesgoDocumentCover.value.schema_primary_id,
              ]
            );

            // 登録した最終IDを再取得し、仮ID対比表に追加
            const docRet: { document_id: number }[] = (await dbAccess.query(
              'SELECT last_value as document_id FROM jesgo_document_document_id_seq'
            )) as { document_id: number }[];
            dummyNumber[jesgoDocumentCover.key] = docRet[0].document_id;
          } else {
            // DBに登録済のIDであれば更新を行う
            await dbAccess.query(
              `UPDATE jesgo_document SET 
              case_id = $1, 
              event_date = $2, 
              document = $3,  
              child_documents = $4, 
              schema_id = $5, 
              schema_major_version = $6, 
              registrant = $7, 
              last_updated = $8, 
              readonly = $9, 
              deleted = $10, 
              root_order = $11,
              inherit_schema = $12,
              schema_primary_id = $13 
              WHERE document_id = $14`,
              [
                caseId,
                str2Date(jesgoDocumentCover.value.event_date),
                JSON.stringify(jesgoDocumentCover.value.document),
                jesgoDocumentCover.value.child_documents,
                jesgoDocumentCover.value.schema_id,
                jesgoDocumentCover.value.schema_major_version,
                jesgoDocumentCover.value.registrant,
                jesgoDocumentCover.value.last_updated,
                jesgoDocumentCover.value.readonly,
                jesgoDocumentCover.value.deleted,
                jesgoDocumentCover.root_order,
                jesgoDocumentCover.value.inherit_schema,
                jesgoDocumentCover.value.schema_primary_id,
                Number(jesgoDocumentCover.key),
              ]
            );
          }

          // 登録が終わったものを取り除き、次のループに入る
          saveDataObjDefine.jesgo_document.splice(index, 1);
          index--;
          continue;
        }
      }
    }
    await dbAccess.query('COMMIT');
    return { statusNum: RESULT.NORMAL_TERMINATION, body: caseId };
  } catch (e) {
    logging(
      LOGTYPE.ERROR,
      `エラー発生 ${(e as Error).message}`,
      'Schemas',
      'registrationCaseAndDocument'
    );
    await dbAccess.query('ROLLBACK');
  } finally {
    await dbAccess.end();
  }
  return { statusNum: RESULT.ABNORMAL_TERMINATION, body: null };
};

/**
 *
 */
export const getCaseAndDocument = async (
  caseId: number
): Promise<ApiReturnObject> => {
  logging(LOGTYPE.DEBUG, `呼び出し`, 'Schemas', 'getCaseAndDocument');
  try {
    const dbAccess = new DbAccess();
    await dbAccess.connectWithConf();
    // 症例データを取得して格納
    const retCase = (await dbAccess.query(
      'SELECT * FROM jesgo_case WHERE case_id = $1 and deleted = false',
      [caseId]
    )) as jesgoCaseDefine[];
    const returnObj: SaveDataObjDefine = {
      jesgo_case: retCase[0],
      jesgo_document: [],
    };

    // 症例データが取得できなかった場合はエラーを返して終了
    if (!returnObj.jesgo_case) {
      logging(
        LOGTYPE.ERROR,
        `存在しないcase_idの読込(case_id=${caseId})`,
        'Schemas',
        'getCaseAndDocument'
      );
      return { statusNum: RESULT.NOT_FOUND_CASE, body: null };
    }

    // 削除されていない関連づくドキュメントデータを取得
    const retDocs = (await dbAccess.query(
      'SELECT * FROM jesgo_document WHERE case_id = $1 AND deleted = false',
      [caseId]
    )) as jesgoDocumentFromDb[];
    for (let index = 0; index < retDocs.length; index++) {
      const doc = retDocs[index];
      const newDoc: jesgoDocumentObjDefine = {
        key: doc.document_id.toString(),
        value: {
          case_id: caseId.toString(),
          event_date: doc.event_date,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          document: doc.document,
          child_documents: doc.child_documents,
          schema_id: doc.schema_id,
          schema_primary_id: doc.schema_primary_id,
          inherit_schema: doc.inherit_schema,
          schema_major_version: doc.schema_major_version,
          registrant: doc.registrant,
          last_updated: doc.last_updated,
          readonly: doc.readonly,
          deleted: doc.deleted,
        },
        root_order: doc.root_order,
        event_date_prop_name: '19700101',
        death_data_prop_name: '19700101',
        delete_document_keys: [],
      };

      returnObj.jesgo_document.push(newDoc);
    }
    await dbAccess.end();
    return { statusNum: RESULT.NORMAL_TERMINATION, body: returnObj };
  } catch (e) {
    logging(
      LOGTYPE.ERROR,
      `エラー発生 ${(e as Error).message}`,
      'Schemas',
      'getCaseAndDocument'
    );
    return { statusNum: RESULT.ABNORMAL_TERMINATION, body: null };
  }
};
