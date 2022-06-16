import { DbAccess } from '../logic/DbAccess';
import { ParsedQs } from 'qs';
import { ApiReturnObject, RESULT } from '../logic/ApiCommon';
import { logging, LOGTYPE } from '../logic/Logger'
//インターフェース
export interface dbRow {
  his_id: string;
  name: string;
  age: number;
  death_age: number;
  schemaidstring: string;
  since: string;
  start_date: string;
  last_updated: string;
  figo: string;
  child_documents: number[];
  document_id: number;
  case_id: number;
  deleted: boolean;
  chemotherapy_date: string;
  operation_date: string;
  radiotherapy_date: string;
  evaluation_date: string;
  cancer_type: string;
  date_of_death: string;
  registration: string;
  decline: boolean;
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
  diagnosisCervical: string;
  diagnosisEndometrial: string;
  diagnosisOvarian: string;
  advancedStage: string;
  advancedStageCervical: string;
  advancedStageEndometrial: string;
  advancedStageOvarian: string;
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
  logging(LOGTYPE.DEBUG, '呼び出し', 'SearchPatient', 'addStatusAllowDuplicate');
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
    doc.document->>'診断日' as since, to_char(ca.last_updated, 'yyyy/mm/dd') as last_updated, 
    doc.document->>'治療開始年月日' as start_date, 
    doc.document->>'FIGO' as figo, 
    doc.document->>'投与開始日' as chemotherapy_date, 
    doc.document->>'手術日' as operation_date, 
    doc.document->>'治療開始日' as radiotherapy_date, 
    doc.document->>'腫瘍登録番号' as registration, 
    doc.document->>'がん種' as cancer_type, 
    doc.document->>'評価日' as evaluation_date, 
    doc.child_documents, doc.document_id as document_id, ca.case_id as case_id, doc.deleted as deleted  
    FROM jesgo_document doc JOIN jesgo_document_schema sch ON doc.schema_id = sch.schema_id RIGHT OUTER JOIN jesgo_case ca ON ca.case_id = doc.case_id
    WHERE ca.deleted = false 
    ORDER BY ca.case_id , sch.schema_id_string;`
  )) as dbRow[];
  await dbAccess.end();

  let recurrenceChildDocumentIds: number[] = [];

  // 1回目のループで再発情報が乗っている行を探す
  for (let index = 0; index < dbRows.length; index++) {
    const dbRow: dbRow = dbRows[index];
    if (dbRow.schemaidstring === '/schema/recurrence') {
      recurrenceChildDocumentIds = dbRow.child_documents;
      break;
    }
  }
  // 2回目のループでuserData形式へのコンバートを行う
  const userDataList: userData[] = [];
  const caseIdList: number[] = [];
  for (let index = 0; index < dbRows.length; index++) {
    const dbRow: dbRow = dbRows[index];
    const caseId: number = dbRow.case_id;
    let rowIndex = caseIdList.indexOf(caseId);
    let userData: userData;

    // 腫瘍登録対象のみ表示が有効の場合、そうでないレコードは飛ばす
    if (query.showOnlyTumorRegistry && query.showOnlyTumorRegistry === 'true') {
      // 「拒否」が有効の場合
      if(dbRow.decline){
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
        age: dbRow.date_of_death !== null ? dbRow.death_age: dbRow.age,
        registedCancerGroup: '',
        since: null,
        startDate: null,
        lastUpdate: dbRow.last_updated,
        diagnosis: '',
        diagnosisCervical: '無',
        diagnosisEndometrial: '無',
        diagnosisOvarian: '無',
        advancedStage: '',
        advancedStageCervical: '',
        advancedStageEndometrial: '',
        advancedStageOvarian: '',
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
      if(dbRow.date_of_death !== null){
        userData.status.push('death');
      }
    }

    // 削除されているドキュメントの場合、ステータス系の更新は行わない
    if (dbRow.deleted) {
      continue;
    }

    // がん種系
    if (
      dbRow.schemaidstring === '/schema/EM/root' ||
      dbRow.schemaidstring === '/schema/CC/root' ||
      dbRow.schemaidstring === '/schema/OV/root' ||
      dbRow.schemaidstring === '/schema/other/root'
    ) {
      let cancerType = '';

      if (dbRow.schemaidstring === '/schema/EM/root') {
        cancerType = '子宮体がん';
        userData.diagnosisEndometrial = '有';
      }

      if (dbRow.schemaidstring === '/schema/CC/root') {
        cancerType = '子宮頸がん';
        userData.diagnosisCervical = '有';
      }

      if (dbRow.schemaidstring === '/schema/OV/root') {
        cancerType = '卵巣がん';
        userData.diagnosisOvarian = '有';
      }

      if (dbRow.schemaidstring === '/schema/other/root') {
        cancerType = dbRow.cancer_type;
      }

      userData.registedCancerGroup = addStatus(
        userData.registedCancerGroup,
        cancerType,
        '･'
      );
      userData.diagnosis = addStatus(userData.diagnosis, cancerType, '･');

      // 診断日がもともと記録されていないか、もっと古いものであれば書き換える
      if (userData.since == null || userData.since !== '' && userData.since > dbRow.since) {
        userData.since = dbRow.since;
      }

      // DBに初回治療日があり、現在値が記録されていないか、もっと古いものであれば書き換える
      if(dbRow.start_date !== ''){
        if (userData.startDate == null || userData.startDate > dbRow.start_date) {
          userData.startDate = dbRow.start_date;
        }
      }
    }

    // 治療法系
    if (
      dbRow.schemaidstring === '/schema/treatment/operation' ||
      dbRow.schemaidstring === '/schema/treatment/operation/detailed' ||
      dbRow.schemaidstring === '/schema/treatment/chemotherapy' ||
      dbRow.schemaidstring === '/schema/treatment/radiotherapy' ||
      dbRow.schemaidstring === '/schema/treatment/supportive_care'
    ) {
      let iconTag = '';
      let startDate = '';

      if ((dbRow.schemaidstring === '/schema/treatment/operation' || 
           dbRow.schemaidstring === '/schema/treatment/operation/detailed') && dbRow.operation_date !== null) {
        iconTag = 'surgery';
        startDate = dbRow.operation_date;
      } else if (dbRow.schemaidstring === '/schema/treatment/chemotherapy' && dbRow.chemotherapy_date !== null) {
        iconTag = 'chemo';
        startDate = dbRow.chemotherapy_date;
      } else if (dbRow.schemaidstring === '/schema/treatment/radiotherapy' && dbRow.radiotherapy_date !== null) {
        iconTag = 'radio';
        startDate = dbRow.radiotherapy_date;
      } else if (dbRow.schemaidstring === '/schema/treatment/supportive_care' && dbRow.evaluation_date !== null){
        iconTag = "surveillance"
        startDate = dbRow.evaluation_date;
      }

      // 初回治療日がもともと記録されていないか、もっと古いものであれば書き換える
      if(dbRow.start_date !== ''){
          if (userData.startDate == null || userData.startDate > dbRow.start_date) {
          userData.startDate = startDate;
        }
      }

      if(iconTag !== ''){
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
    if (dbRow.schemaidstring === '/schema/EM/staging' ||
    dbRow.schemaidstring === '/schema/CC/staging' ||
    dbRow.schemaidstring === '/schema/OV/staging' ) {
      const figo = dbRow.figo && dbRow.figo !== '' ? dbRow.figo : '未'
      if (dbRow.schemaidstring === '/schema/EM/staging') {
        userData.advancedStageEndometrial = figo;
      }

      if (dbRow.schemaidstring === '/schema/CC/staging') {
        userData.advancedStageCervical = figo;
      }

      if (dbRow.schemaidstring === '/schema/OV/staging') {
        userData.advancedStageOvarian = figo;
      }
      userData.advancedStage = addStatusAllowDuplicate(userData.advancedStage, figo, '・');
    }

    // 再発
    if (dbRow.schemaidstring === '/schema/recurrence') {
      userData.progress.push('recurrence');
      userData.status.push('recurrence');
    }

    // 経過
    if (dbRow.schemaidstring === '/schema/surveillance') {
      userData.progress.push('surveillance');
      // userData.status.push('surveillance');
    }

    // 合併症
    if (dbRow.schemaidstring === '/schema/treatment/operation_adverse_events') {
      // userData.copilacations.push('complications');
      // userData.status.push('complications');
    }

    // 腫瘍登録番号登録有無
    if (userData.registration.length === 0) {
      if (dbRow.decline){
        userData.registration.push('decline')
      } else if (dbRow.registration !== null && dbRow.registration !== ''){
        userData.registration.push('completed')
      }
    }
  }

  // 未入力埋め
  for (let index = 0; index < userDataList.length; index++) {
    const userData = userDataList[index];
    const regex = new RegExp(/^[未・]*$/);
    if (userData.advancedStage === '' || regex.test(userData.advancedStage)) {
      userData.advancedStage = ('未');
    }
    if (userData.diagnosis === '') {
      userData.diagnosis = ('未');
    }
    if (userData.registration.length === 0) {
      userData.registration.push('not_completed');
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
    let cancerType = '';
    if (query.cancerType === 'cervical') {
      cancerType = '子宮頸がん';
    } else if (query.cancerType === 'endometrial') {
      cancerType = '子宮体がん';
    } else if (query.cancerType === 'ovarian') {
      cancerType = '卵巣がん';
    }
    for (let index = 0; index < userDataList.length; index++) {
      const userData = userDataList[index];
      if (userData.registedCancerGroup.indexOf(cancerType) == -1) {
        userDataList.splice(index, 1);
        index--;
      }
    }
  }

  // 診断日指定がある場合、診断日が異なるものを配列から削除する
  if (query.startOfDiagnosisDate) {
    let startDate = query.startOfDiagnosisDate;
    let endDate = query.endOfDiagnosisDate;
    // 日付の開始と終了が前後してても対応する
    if(startDate > endDate){
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
    if(query.advancedStage && query.advancedStage === 'true'){
      for (let index = 0; index < userDataList.length; index++) {
        const userData = userDataList[index];
        if (userData.advancedStage.indexOf('未') == -1) {
          userDataList.splice(index, 1);
          index--;
        }
      }
    }

    // 診断
    if(query.pathlogicalDiagnosis && query.pathlogicalDiagnosis === 'true'){
      for (let index = 0; index < userDataList.length; index++) {
        const userData = userDataList[index];
        if (userData.diagnosis.indexOf('未') == -1) {
          userDataList.splice(index, 1);
          index--;
        }
      }
    }
    
    // 初回治療
    if(query.initialTreatment && query.initialTreatment === 'true'){
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
    logging(LOGTYPE.ERROR, `エラー発生 ${(e as Error).message}`, 'SearchPatient', 'deletePatient');
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
