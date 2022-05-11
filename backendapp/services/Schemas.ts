import { ApiReturnObject, RESULT } from '../logic/ApiCommon';
import { DbAccess } from '../logic/DbAccess';

export interface getJsonSchemaBody {
  ids: number[] | undefined;
}

export type records = {
  [key: string]: schemaRecord;
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
  inherit_schema: number[];
  base_schema: number|null;
  base_version_major: number;
  valid_from: Date;
  valid_until: Date;
  author: string;
  version_major: number;
  version_minor: number;
  plugin_id: number;
};

export const getJsonSchema = async (): Promise<ApiReturnObject> => {
  console.log('getJsonSchema');
  try {
    const query = `SELECT * FROM jesgo_document_schema`;

    const dbAccess = new DbAccess();
    await dbAccess.connectWithConf();
    const ret = (await dbAccess.query(query)) as schemaRecord[];
    await dbAccess.end();

    return { statusNum: RESULT.NORMAL_TERMINATION, body: ret };
  } catch (e) {
    console.log(e);
    return { statusNum: RESULT.ABNORMAL_TERMINATION, body: null };
  }
};

export const getRootSchemaIds = async (): Promise<ApiReturnObject> => {
  console.log('getRootSchemaIds');
  try {
    const query = `select * from jesgo_document_schema where document_schema->>'jesgo:parentschema' like '%"/"%';`;

    const dbAccess = new DbAccess();
    await dbAccess.connectWithConf();
    const ret = (await dbAccess.query(query)) as schemaRecord[];
    await dbAccess.end();

    const ids: number[] = [];
    for (let index = 0; index < ret.length; index++) {
      const record = ret[index];
      ids.push(record.schema_id);
    }
    return { statusNum: RESULT.NORMAL_TERMINATION, body: ids };
  } catch (e) {
    console.log(e);
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
  // 戻り値 0:正常, -1:異常(不明), -2:ID被り
  const ID_DUPLICATION = -2;

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
        return { statusNum: ID_DUPLICATION, body: null };
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
              inherit_schema 
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
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
              inherit_schema = $12 
              WHERE document_id = $13`,
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
    console.log('catch');
    console.log(e);
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
  try {
    const dbAccess = new DbAccess();
    await dbAccess.connectWithConf();
    // 症例データを取得して格納
    const retCase = (await dbAccess.query(
      'SELECT * FROM jesgo_case WHERE case_id = $1',
      [caseId]
    )) as jesgoCaseDefine[];
    const returnObj: SaveDataObjDefine = {
      jesgo_case: retCase[0],
      jesgo_document: [],
    };

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
    console.log(e);
    return { statusNum: RESULT.ABNORMAL_TERMINATION, body: null };
  }
};
