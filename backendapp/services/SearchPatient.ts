import { DbAccess } from '../logic/DbAccess';
import { ParsedQs } from 'qs';
import { ApiReturnObject, RESULT } from '../logic/ApiCommon';
import { logging, LOGTYPE } from '../logic/Logger';
import { Const, isAgoYearFromNow, jesgo_tagging } from '../logic/Utility';
import { getItemsAndNames, getPropItemsAndNames, getThenPropItemsAndNames, JSONSchema7 } from './JsonToDatabase';
import e from 'express';

//インターフェース
export interface dbRow {
  his_id: string;
  name: string;
  age: number;
  death_age: number;
  schemaidstring: string;
  last_updated: string;
  child_documents: number[];
  document_id: number;
  document: JSON;
  document_schema: JSONSchema7;
  case_id: number;
  deleted: boolean;
  date_of_death: string;
  registration: string;
  decline: boolean;
}

export interface searchColumns {
  column_id: number;
  column_name: string;
}

interface userData {
  caseId: number;
  patientId: string;
  patientName: string;
  age: number;
  registedCancerGroup: string;
  since: string | null;
  startDate: string | null;
  lastUpdate: string;
  diagnosis: string;
  diagnosisMajor: string;
  diagnosisMinor: string;
  advancedStage: string;
  pathlogicalDiagnosis: string;
  initialTreatment: string[];
  copilacations: string[];
  progress: string[];
  postRelapseTreatment: string[];
  registration: string[];
  threeYearPrognosis: string[];
  fiveYearPrognosis: string[];
  status: string[];
}

export interface searchPatientRequest extends ParsedQs {
  treatmentStartYear: string;
  cancerType: string;
  showOnlyTumorRegistry: string;
  startOfDiagnosisDate: string;
  endOfDiagnosisDate: string;
  checkOfDiagnosisDate: string;
  checkOfBlankFields: string;
  advancedStage: string;
  pathlogicalDiagnosis: string;
  initialTreatment: string;
  copilacations: string;
  threeYearPrognosis: string;
  fiveYearPrognosis: string;
  showProgressAndRecurrence: string;
}

/**
 * 元となる文字列に区切り文字と新規文字列を追加する
 * 元となる文字列が空であれば区切り文字は追加せず追加文字列のみを返す
 * @param baseString 元となる文字列
 * @param addString 新規文字列
 * @param spacer 区切り文字(指定しない場合は空文字)
 * @returns
 */
const addStatusAllowDuplicate = (
  baseString: string,
  addString: string,
  spacer = ''
): string => {
  logging(
    LOGTYPE.DEBUG,
    '呼び出し',
    'SearchPatient',
    'addStatusAllowDuplicate'
  );
  // 元となる文字列が空でない
  if (baseString != '') {
    return baseString + spacer + addString;
  }
  // 元となる文字列が空
  return addString;
};

/**
 * 元となる文字列に区切り文字と新規文字列を追加する
 * 新規文字列が既に含まれている場合は元となる文字列をそのまま返し、
 * 元となる文字列が空であれば区切り文字は追加せず追加文字列のみを返す
 * @param baseString 元となる文字列
 * @param addString 新規文字列
 * @param spacer 区切り文字(指定しない場合は空文字)
 * @returns
 */
const addStatus = (
  baseString: string,
  addString: string,
  spacer = ''
): string => {
  logging(LOGTYPE.DEBUG, '呼び出し', 'SearchPatient', 'addStatus');
  // 新規文字列が既に含まれていない
  if (baseString !== null && baseString.indexOf(addString) == -1) {
    return addStatusAllowDuplicate(baseString, addString, spacer);
  }
  // 新規文字列が既に含まれている
  return baseString;
};

/**
 * 
 * @param tagName 取得対象のjesgo:tagの内容
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getPropertyNameFromTag = (tagName:string, document:any, schema:JSONSchema7):string|null => {
  logging(LOGTYPE.DEBUG, '呼び出し', 'SearchPatient', 'getPropertyNameFromTag');

  const schemaItems = getItemsAndNames(schema);
  let retText = null;
  for(let i = 0; i < schemaItems.pNames.length; i++) {
    const prop = schemaItems.pItems[schemaItems.pNames[i]] as JSONSchema7;
    // 該当プロパティがオブジェクトの場合、タグが付いてるかを確認
    if(typeof prop === 'object'){

      // タグが付いていれば値を取得する
      if(prop['jesgo:tag'] && prop['jesgo:tag'] == tagName){
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const tempText = document[schemaItems.pNames[i]] as string | null;
        if(tempText && tempText !== ''){
          retText = tempText;
        }
      }
      // タグがなければ中を再帰的に見に行く
      else{
        // ドキュメントが入れ子になっている場合、現在見ているプロパティネームの下にオブジェクトが存在すればそちらを新たなオブジェクトとして渡す
        // eslint-disable-next-line
        const newDocument = document[schemaItems.pNames[i]]? document[schemaItems.pNames[i]] : document;
        const ret = getPropertyNameFromTag(tagName, newDocument, prop)
        if(ret !== null){
          retText = ret;
        }
      }
    }
    // オブジェクトでなければ中を見る必要無し
  }
  return retText;
}

export const searchPatients = async (
  query: searchPatientRequest
): Promise<ApiReturnObject> => {
  logging(LOGTYPE.DEBUG, '呼び出し', 'SearchPatient', 'searchPatients');
  const dbAccess = new DbAccess();
  await dbAccess.connectWithConf();
  const dbRows: dbRow[] = (await dbAccess.query(
    `SELECT 
    HIS_id, name, DATE_PART('year', AGE(now(),date_of_birth)) as age, 
    DATE_PART('year', AGE(date_of_death, date_of_birth)) as death_age, 
    sch.schema_id_string as schemaidstring, 
    date_of_death, decline, 
    to_char(ca.last_updated, 'yyyy/mm/dd') as last_updated, 
    doc.document as document,  document_schema, 
    doc.child_documents, doc.document_id as document_id, ca.case_id as case_id, doc.deleted as deleted  
    FROM jesgo_document doc JOIN view_latest_schema sch ON doc.schema_id = sch.schema_id RIGHT OUTER JOIN jesgo_case ca ON ca.case_id = doc.case_id
    WHERE ca.deleted = false 
    ORDER BY ca.case_id , sch.schema_id_string;`
  )) as dbRow[];

  // がん種検索用のリストを取得しておく
  const cancerSearchColumns = (await dbAccess.query(
    "SELECT column_id, column_name FROM jesgo_search_column WHERE column_type = 'cancer_type' ORDER BY column_id"
  )) as searchColumns[];

  await dbAccess.end();

  let recurrenceChildDocumentIds: number[] = [];

  // 1回目のループで再発情報が乗っている行を探す
  for (let index = 0; index < dbRows.length; index++) {
    const dbRow: dbRow = dbRows[index];
    if (JSON.stringify(dbRow.document_schema).includes(jesgo_tagging(Const.JESGO_TAG.RECURRENCE))) {
      recurrenceChildDocumentIds = dbRow.child_documents;
      break;
    }
  }
  // 2回目のループでuserData形式へのコンバートを行う
  const userDataList: userData[] = [];
  const caseIdList: number[] = [];
  for (let index = 0; index < dbRows.length; index++) {
    const dbRow: dbRow = dbRows[index];
    const docSchema = JSON.stringify(dbRow.document_schema);
    const caseId: number = dbRow.case_id;
    let rowIndex = caseIdList.indexOf(caseId);
    let userData: userData;

    // 腫瘍登録対象のみ表示が有効の場合、そうでないレコードは飛ばす
    if (query.showOnlyTumorRegistry && query.showOnlyTumorRegistry === 'true') {
      // 「拒否」が有効の場合
      if (dbRow.decline) {
        continue;
      }
    }

    // 該当レコードのcaseIdが既に記録されてるか確認
    if (rowIndex != -1) {
      // 存在している場合、userDataListの同じ添え字にアクセス
      userData = userDataList[rowIndex];
    } else {
      // 存在しない場合は新規に作成、caseIdListにも記録する
      caseIdList.push(caseId);
      userData = {
        caseId: caseId,
        patientId: dbRow.his_id,
        patientName: dbRow.name,
        age: dbRow.date_of_death !== null ? dbRow.death_age : dbRow.age,
        registedCancerGroup: '',
        since: null,
        startDate: null,
        lastUpdate: dbRow.last_updated,
        diagnosis: '',
        diagnosisMajor: '', 
        diagnosisMinor: '',
        advancedStage: '',
        pathlogicalDiagnosis: '',
        initialTreatment: [],
        copilacations: [],
        progress: [],
        postRelapseTreatment: [],
        registration: [],
        threeYearPrognosis: [],
        fiveYearPrognosis: [],
        status: [],
      };
      rowIndex = userDataList.push(userData);

      // caseの情報を取得するのは初回のみ
      // 死亡日が設定されている場合死亡ステータスを追加
      if (dbRow.date_of_death !== null) {
        userData.status.push('death');
      }

      // 登録拒否が設定されている場合、拒否を追加
      if (dbRow.decline) {
        userData.registration.push('decline');
      }
    }

    // 削除されているドキュメントの場合、ステータス系の更新は行わない
    if (dbRow.deleted) {
      continue;
    }
    jesgo_tagging(Const.JESGO_TAG.CANCER_MAJOR)
    // 主要がん種系
    if (docSchema.includes(jesgo_tagging(Const.JESGO_TAG.CANCER_MAJOR)))
    {
      const cancerType = getPropertyNameFromTag(Const.JESGO_TAG.CANCER_MAJOR, dbRow.document, dbRow.document_schema)??'';
      userData.diagnosisMajor = addStatus(userData.diagnosisMajor, cancerType, '･');

      userData.registedCancerGroup = addStatus(
        userData.registedCancerGroup,
        cancerType,
        '･'
      );
    }

    // その他がん種系
    if (docSchema.includes(jesgo_tagging(Const.JESGO_TAG.CANCER_MINOR)))
    {
      const cancerType = getPropertyNameFromTag(Const.JESGO_TAG.CANCER_MINOR, dbRow.document, dbRow.document_schema)??'';
      userData.diagnosisMinor = addStatus(userData.diagnosisMinor, cancerType, '･');

      userData.registedCancerGroup = addStatus(
        userData.registedCancerGroup,
        cancerType,
        '･'
      );
    }

    // 診断日
    if (docSchema.includes(jesgo_tagging(Const.JESGO_TAG.DIAGNOSIS_DATE))) 
    {
      const since = getPropertyNameFromTag(Const.JESGO_TAG.DIAGNOSIS_DATE, dbRow.document, dbRow.document_schema)??'';
      // 日付変換に失敗する値の場合は無視する
      if(!isNaN(new Date(since).getFullYear())){
        // 診断日がもともと記録されていないか、もっと古いものであれば書き換える
        if (
          !userData.since ||
          (since !== '' && userData.since > since)
        ) {
          userData.since = since;
        }
      }

    }

    // 初回治療日
    if (docSchema.includes(jesgo_tagging(Const.JESGO_TAG.INITIAL_TREATMENT_DATE))) 
    {
      const startDate = getPropertyNameFromTag(Const.JESGO_TAG.INITIAL_TREATMENT_DATE, dbRow.document, dbRow.document_schema)??'';
      // 日付変換に失敗する値の場合は無視する
      if(!isNaN(new Date(startDate).getFullYear())){
        // 初回治療日がもともと記録されていないか、もっと古いものであれば書き換える
        if (
          !userData.startDate ||
          (startDate !== '' && userData.startDate > startDate)
        ) {
          userData.startDate = startDate;
        }
      }
    }

    // 治療法系
    if (
      docSchema.includes(jesgo_tagging(Const.JESGO_TAG.TREATMENT_SURGERY)) ||
      docSchema.includes(jesgo_tagging(Const.JESGO_TAG.TREATMENT_CHEMO)) ||
      docSchema.includes(jesgo_tagging(Const.JESGO_TAG.TREATMENT_RADIO)) ||
      docSchema.includes(jesgo_tagging(Const.JESGO_TAG.TREATMENT_SUPPORTIVECARE))
    ) {
      let iconTag = '';

      if (
        docSchema.includes(jesgo_tagging(Const.JESGO_TAG.TREATMENT_SURGERY))
      ) {
        const tag = getPropertyNameFromTag(Const.JESGO_TAG.TREATMENT_SURGERY, dbRow.document, dbRow.document_schema)??''
        iconTag = tag !=='' ? 'surgery' : '';
      } else if (
        docSchema.includes(jesgo_tagging(Const.JESGO_TAG.TREATMENT_CHEMO))
      ) {
        const tag =getPropertyNameFromTag(Const.JESGO_TAG.TREATMENT_CHEMO, dbRow.document, dbRow.document_schema)??''
        iconTag = tag !=='' ? 'chemo' : '';
      } else if (
        docSchema.includes(jesgo_tagging(Const.JESGO_TAG.TREATMENT_RADIO))
      ) {
        const tag =getPropertyNameFromTag(Const.JESGO_TAG.TREATMENT_RADIO, dbRow.document, dbRow.document_schema)??''
        iconTag = tag !=='' ? 'radio' : '';
      } else if (
        docSchema.includes(jesgo_tagging(Const.JESGO_TAG.TREATMENT_SUPPORTIVECARE))
      ) {
        const tag =getPropertyNameFromTag(Const.JESGO_TAG.TREATMENT_SUPPORTIVECARE, dbRow.document, dbRow.document_schema)??''
        iconTag = tag !=='' ? 'supportivecare' : '';
      }

      if (iconTag !== '') {
        // 再発系の場合
        if (recurrenceChildDocumentIds.includes(dbRow.document_id)) {
          userData.postRelapseTreatment.push(iconTag);
        }
        // 初回治療の場合
        else {
          userData.initialTreatment.push(iconTag);
        }

        // どちらでもステータスに入れる
        userData.status.push(iconTag);
      }
    }

    // 進行期
    if (docSchema.includes(jesgo_tagging(Const.JESGO_TAG.FIGO))) 
    {
      const tempFigo = getPropertyNameFromTag(Const.JESGO_TAG.FIGO, dbRow.document, dbRow.document_schema)??'';
      const figo = tempFigo && tempFigo !== '' ? tempFigo : '未';

      userData.advancedStage = addStatusAllowDuplicate(
        userData.advancedStage,
        figo,
        '・'
      );
    }

    // 再発
    if (docSchema.includes(jesgo_tagging(Const.JESGO_TAG.RECURRENCE))) {
      userData.status.push('recurrence');
    }

    // 腫瘍登録番号登録有無
    if (docSchema.includes(jesgo_tagging(Const.JESGO_TAG.REGISTRABILITY))) 
    {
      const registrability = getPropertyNameFromTag(Const.JESGO_TAG.REGISTRABILITY, dbRow.document, dbRow.document_schema)??'';
      if(registrability && registrability === 'はい'){
        // 登録対象症例の値が はい であれば腫瘍登録番号を見る
        if (docSchema.includes(jesgo_tagging(Const.JESGO_TAG.REGISTRATION_NUMBER))) 
        {
          // 同じドキュメント内にある腫瘍登録番号が記載されていれば完了を、記載がなければ未完了とする
          const registrationNumber = getPropertyNameFromTag(Const.JESGO_TAG.REGISTRATION_NUMBER, dbRow.document, dbRow.document_schema)??'';
          if (registrationNumber !== null && registrationNumber !== '') {
            userData.registration.push('completed');
          }else{
            userData.registration.push('not_completed');
          }
        }else{
          // 同じドキュメント内に腫瘍登録番号そのものが記載されていなくても未入力扱いにする
          userData.registration.push('not_completed');
        }
      }
    }

    // 3年予後と5年予後は該当ドキュメントがあれば値を登録、該当年数がたっていなければ後から値を削除する
    // 3年予後
    if (docSchema.includes(jesgo_tagging(Const.JESGO_TAG.THREE_YEAR_PROGNOSIS)))
    {
      const threeYearPrognosis = getPropertyNameFromTag(Const.JESGO_TAG.THREE_YEAR_PROGNOSIS, dbRow.document, dbRow.document_schema)??'';
      if (threeYearPrognosis !== null && threeYearPrognosis !== '') {
        userData.threeYearPrognosis.push('completed');
      }else{
        userData.threeYearPrognosis.push('not_completed');
      }
    }

    // 5年予後
    if (docSchema.includes(jesgo_tagging(Const.JESGO_TAG.FIVE_YEAR_PROGNOSIS)))
    {
      const fiveYearPrognosis = getPropertyNameFromTag(Const.JESGO_TAG.FIVE_YEAR_PROGNOSIS, dbRow.document, dbRow.document_schema)??'';
      if (fiveYearPrognosis !== null && fiveYearPrognosis !== '') {
        userData.fiveYearPrognosis.push('completed');
      }else{
        userData.fiveYearPrognosis.push('not_completed');
      }
    }
  }

  // がん種結合
  for (let index = 0; index < userDataList.length; index++) {
    const userData = userDataList[index];
    userData.diagnosis = addStatus(userData.diagnosisMajor, userData.diagnosisMinor, '･');
  }

  // 未入力埋め、整形
  for (let index = 0; index < userDataList.length; index++) {
    const userData = userDataList[index];
    const regex = new RegExp(/^[未・]*$/);

    // 進行期
    if (userData.advancedStage === '' || regex.test(userData.advancedStage)) {
      userData.advancedStage = '未';
    }

    // 診断日
    if (userData.diagnosis === '') {
      userData.diagnosis = '未';
    }

    // 登録
    if (userData.registration.length > 0) {
      // 1つ以上の値がある場合は、「拒否」、「未」、「済」の優先順で一番優先された物を値とする
      const orderRule = [
        'decline',
        'not_completed',
        'completed',
      ];
      userData.registration = [userData.registration.sort((a, b) => orderRule.indexOf(a) - orderRule.indexOf(b))[0]];
    }
    // 値がない場合は何も表示しない

    // 3年予後、5年予後
    if (userData.startDate == null) {
      // 初回治療日が指定されていない場合は3年予後、5年予後とも未指定とする
      userData.threeYearPrognosis = [];
      userData.fiveYearPrognosis = [];
    }else{
      // 3年予後
      if(!isAgoYearFromNow(new Date(userData.startDate), 3)){
        // 3年たっていなければ未指定とする(たっていればそのまま)
        userData.threeYearPrognosis = [];
      }

      // 5年予後
      if(!isAgoYearFromNow(new Date(userData.startDate), 5)){
        // 5年たっていなければ未指定とする(たっていればそのまま)
        userData.fiveYearPrognosis = [];
      }
    }
  }

  // 初回治療日指定がある場合、初回治療日が異なるものを配列から削除する
  if (query.treatmentStartYear && query.treatmentStartYear != 'all') {
    for (let index = 0; index < userDataList.length; index++) {
      const userData = userDataList[index];
      if (userData.startDate == null) {
        userDataList.splice(index, 1);
        index--;
        continue;
      } else {
        const startDate: Date = new Date(userData.startDate);
        if (startDate.getFullYear().toString() !== query.treatmentStartYear) {
          userDataList.splice(index, 1);
          index--;
          continue;
        }
      }
    }
  }

  // がん種別指定がある場合、指定がん種を含まないものを配列から削除する
  if (query.cancerType && query.cancerType != 'all') {
    const cancerNum = Number(query.cancerType);
    const cancerType = cancerSearchColumns.find((v) => v.column_id === cancerNum)?.column_name;
    if(cancerType){
      for (let index = 0; index < userDataList.length; index++) {
        const userData = userDataList[index];
        if (userData.registedCancerGroup.indexOf(cancerType) == -1) {
          userDataList.splice(index, 1);
          index--;
        }
      }
    }
  }

  // 診断日指定がある場合、診断日が異なるものを配列から削除する
  if (query.startOfDiagnosisDate) {
    let startDate = query.startOfDiagnosisDate;
    let endDate = query.endOfDiagnosisDate;
    // 日付の開始と終了が前後してても対応する
    if (startDate > endDate) {
      startDate = query.endOfDiagnosisDate;
      endDate = query.startOfDiagnosisDate;
    }
    for (let index = 0; index < userDataList.length; index++) {
      const userData = userDataList[index];

      // 診察日が指定されていないものを配列から削除する
      if (userData.since === null) {
        userDataList.splice(index, 1);
        index--;
        continue;
      } else {
        // ユーザーデータ側の診察日を同じ文字列形式(YYYY-MM)に直す
        const dateObj = new Date(userData.since);
        const y = dateObj.getFullYear();
        const m = `00${dateObj.getMonth() + 1}`.slice(-2);
        const diagnosisDate = `${y}-${m}`;

        // 文字列で大小比較を行い、範囲外のものを配列から削除する
        if (!(startDate <= diagnosisDate && diagnosisDate <= endDate)) {
          userDataList.splice(index, 1);
          index--;
          continue;
        }
      }
    }
  }

  // 未入力チェック系
  {
    // 進行期
    if (query.advancedStage && query.advancedStage === 'true') {
      for (let index = 0; index < userDataList.length; index++) {
        const userData = userDataList[index];
        if (userData.advancedStage.indexOf('未') == -1) {
          userDataList.splice(index, 1);
          index--;
        }
      }
    }

    // 診断
    if (query.pathlogicalDiagnosis && query.pathlogicalDiagnosis === 'true') {
      for (let index = 0; index < userDataList.length; index++) {
        const userData = userDataList[index];
        if (userData.diagnosis.indexOf('未') == -1) {
          userDataList.splice(index, 1);
          index--;
        }
      }
    }

    // 初回治療
    if (query.initialTreatment && query.initialTreatment === 'true') {
      for (let index = 0; index < userDataList.length; index++) {
        const userData = userDataList[index];
        if (userData.initialTreatment.length > 0) {
          userDataList.splice(index, 1);
          index--;
        }
      }
    }
  }

  return { statusNum: RESULT.NORMAL_TERMINATION, body: { data: userDataList } };
};

export const deletePatient = async (
  caseId: number
): Promise<ApiReturnObject> => {
  logging(LOGTYPE.DEBUG, '呼び出し', 'SearchPatient', 'deletePatient');
  let returnObj = true;
  const dbAccess = new DbAccess();
  try {
    await dbAccess.connectWithConf();
    await dbAccess.query(
      'UPDATE jesgo_case SET deleted = true WHERE case_id = $1',
      [caseId]
    );
    await dbAccess.query(
      'UPDATE jesgo_document SET deleted = true WHERE case_id = $1',
      [caseId]
    );
  } catch (e) {
    logging(
      LOGTYPE.ERROR,
      `エラー発生 ${(e as Error).message}`,
      'SearchPatient',
      'deletePatient'
    );
    returnObj = false;
  } finally {
    await dbAccess.end();
  }
  if (returnObj) {
    return { statusNum: RESULT.NORMAL_TERMINATION, body: null };
  } else {
    return { statusNum: RESULT.ABNORMAL_TERMINATION, body: null };
  }
};
