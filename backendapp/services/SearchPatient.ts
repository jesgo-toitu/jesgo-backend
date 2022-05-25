import { DbAccess } from '../logic/DbAccess';
import { ParsedQs } from 'qs';
import { ApiReturnObject, RESULT } from '../logic/ApiCommon';

//インターフェース
export interface dbRow {
  his_id: string;
  name: string;
  age: number;
  death_age: number;
  schemaidstring: string;
  since: string;
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
  registrationYear: string;
  cancerType: string;
  showOnlyTumorRegistry: string;
  startOfTreatmentStartDate: string;
  endOfTreatmentStartDate: string;
  checkOfTreatmentStartDate: string;
  checkOfBlankFields: string;
  blankFields: {
    advancedStage: string;
    pathlogicalDiagnosis: string;
    initialTreatment: string;
    copilacations: string;
    threeYearPrognosis: string;
    fiveYearPrognosis: string;
  };
  showProgressAndRecurrence: string;
}

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
  // 新規文字列が既に含まれていない
  if (baseString !== null && baseString.indexOf(addString) == -1) {
    // 元となる文字列が空でない
    if (baseString != '') {
      return baseString + spacer + addString;
    }
    // 元となる文字列が空
    return addString;
  }
  // 新規文字列が既に含まれている
  return baseString;
};

export const searchPatients = async (
  query: searchPatientRequest
): Promise<ApiReturnObject> => {
  const dbAccess = new DbAccess();
  await dbAccess.connectWithConf();
  const dbRows: dbRow[] = (await dbAccess.query(
    `SELECT 
    HIS_id, name, DATE_PART('year', AGE(now(),date_of_birth)) as age, 
    DATE_PART('year', AGE(date_of_death, date_of_birth)) as death_age, 
    sch.schema_id_string as schemaidstring, 
    date_of_death, decline, 
    doc.document->>'診断日' as since, to_char(ca.last_updated, 'yyyy/mm/dd') as last_updated, 
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
      if (userData.since == null || userData.since > dbRow.since) {
        userData.since = dbRow.since;
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
      if (userData.startDate == null || userData.startDate > startDate) {
        userData.startDate = startDate;
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
      if (dbRow.schemaidstring === '/schema/EM/staging') {
        userData.advancedStageEndometrial = dbRow.figo;
      }

      if (dbRow.schemaidstring === '/schema/CC/staging') {
        userData.advancedStageCervical = dbRow.figo;
      }

      if (dbRow.schemaidstring === '/schema/OV/staging') {
        userData.advancedStageOvarian = dbRow.figo;
      }
      userData.advancedStage = addStatus(userData.advancedStage, dbRow.figo, '・');
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
    if (userData.advancedStage === '') {
      userData.advancedStage = ('未');
    }
    if (userData.diagnosis === '') {
      userData.diagnosis = ('未');
    }
    if (userData.registration.length === 0) {
      userData.registration.push('not_completed');
    }
  }

  // 登録年次指定がある場合、登録年次が異なるものを配列から削除する
  if (query.registrationYear && query.registrationYear != 'all') {
    for (let index = 0; index < userDataList.length; index++) {
      const userData = userDataList[index];
      if (userData.since == null) {
        userDataList.splice(index, 1);
        index--;
        continue;
      } else {
        const since: Date = new Date(userData.since);
        if (since.getFullYear().toString() !== query.registrationYear) {
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
  return { statusNum: RESULT.NORMAL_TERMINATION, body: { data: userDataList } };
};

export const deletePatient = async (
  caseId: number
): Promise<ApiReturnObject> => {
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
    console.log(e);
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
