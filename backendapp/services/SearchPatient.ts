import { DbAccess } from '../logic/DbAccess';
import { ParsedQs } from 'qs';

//インターフェース
export interface dbRow {
  his_id: string;
  name: string;
  age: number;
  schemaidstring: string;
  since: string;
  last_updated: string;
  figo: string;
  child_documents: number[];
  document_id: number;
  case_id: number;
}
interface userData {
  patientId: string;
  patientName: string;
  age: number;
  registedCancerGroup: string;
  startDate: string | null;
  lastUpdate: string;
  diagnosis: string;
  advancedStage: string;
  pathlogicalDiagnosis: string;
  initialTreatment: string[];
  copilacations: string[];
  progress: string[];
  postRelapseTreatment: string[];
  threeYearPrognosis: string[];
  fiveYearPrognosis: string[];
  status: string[];
}

interface userDataList {
  data: userData[];
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
  if (baseString.indexOf(addString) == -1) {
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
): Promise<userDataList> => {
  const dbAccess = new DbAccess();
  await dbAccess.connectWithConf();
  const dbRows: dbRow[] = (await dbAccess.query(
    `SELECT 
    HIS_id, name, DATE_PART('year', AGE(now(),date_of_birth)) as age, sch.schema_id_string as schemaidstring, 
    doc.document->'properties'->>'診断日' as since, to_char(ca.last_updated, 'yyyy/mm/dd') as last_updated, 
    doc.document->'properties'->>'FIGO' as figo, 
    doc.child_documents, doc.document_id as document_id, ca.case_id as case_id 
    FROM jesgo_case ca JOIN jesgo_document doc ON ca.case_id = doc.case_id JOIN jesgo_document_schema sch ON doc.schema_id = sch.schema_id 
    WHERE sch.schema_id_string IN (
    '/schema/EM/root', 
    '/schema/CC/root', 
    '/schema/OV/root', 
    '/schema/CC/staging', 
    '/schema/treatment/operation', 
    '/schema/treatment/chemotherapy', 
    '/schema/treatment/radiotherapy', 
    '/schema/treatment/operation_adverse_events',
    '/schema/surveillance',
    '/schema/recurrence'
    ) 
    ORDER BY ca.case_id , sch.schema_id_string`
  )) as dbRow[];

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
    // 該当レコードのcaseIdが既に記録されてるか確認
    if (rowIndex != -1) {
      // 存在している場合、userDataListの同じ添え字にアクセス
      userData = userDataList[rowIndex];
    } else {
      // 存在しない場合は新規に作成、caseIdListにも記録する
      caseIdList.push(caseId);
      userData = {
        patientId: dbRow.his_id,
        patientName: dbRow.name,
        age: dbRow.age,
        registedCancerGroup: '',
        startDate: null,
        lastUpdate: dbRow.last_updated,
        diagnosis: '',
        advancedStage: '',
        pathlogicalDiagnosis: '',
        initialTreatment: [],
        copilacations: [],
        progress: [],
        postRelapseTreatment: [],
        threeYearPrognosis: [],
        fiveYearPrognosis: [],
        status: [],
      };
      rowIndex = userDataList.push(userData);
    }
    // がん種系
    if (
      dbRow.schemaidstring === '/schema/EM/root' ||
      dbRow.schemaidstring === '/schema/CC/root' ||
      dbRow.schemaidstring === '/schema/OV/root'
    ) {
      let cancerType = '';

      if (dbRow.schemaidstring === '/schema/EM/root') {
        cancerType = '子宮体がん';
      }

      if (dbRow.schemaidstring === '/schema/CC/root') {
        cancerType = '子宮頸がん';
      }

      if (dbRow.schemaidstring === '/schema/OV/root') {
        cancerType = '卵巣がん';
      }
      userData.registedCancerGroup = addStatus(
        userData.registedCancerGroup,
        cancerType,
        '･'
      );
      userData.diagnosis = addStatus(userData.diagnosis, cancerType, '･');

      // 診断日がもともと記録されていないか、もっと古いものであれば書き換える
      if (userData.startDate == null || userData.startDate > dbRow.since) {
        userData.startDate = dbRow.since;
      }
    }

    // 治療法系
    if (
      dbRow.schemaidstring === '/schema/treatment/operation' ||
      dbRow.schemaidstring === '/schema/treatment/chemotherapy' ||
      dbRow.schemaidstring === '/schema/treatment/radiotherapy'
    ) {
      let iconTag = '';

      if (dbRow.schemaidstring === '/schema/treatment/operation') {
        iconTag = 'surgery';
      } else if (dbRow.schemaidstring === '/schema/treatment/chemotherapy') {
        iconTag = 'chemo';
      } else if (dbRow.schemaidstring === '/schema/treatment/radiotherapy') {
        iconTag = 'radio';
      }

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

    // 進行期
    if (dbRow.schemaidstring === '/schema/CC/staging') {
      userData.advancedStage = addStatus(userData.advancedStage, dbRow.figo);
    }

    // 再発
    if (dbRow.schemaidstring === '/schema/recurrence') {
      userData.progress.push('recurrence');
      userData.status.push('recurrence');
    }

    // 経過
    if (dbRow.schemaidstring === '/schema/surveillance') {
      userData.progress.push('surveillance');
      userData.status.push('surveillance');
    }

    // 合併症
    if (dbRow.schemaidstring === '/schema/treatment/operation_adverse_events') {
      userData.copilacations.push('complications');
      userData.status.push('complications');
    }
  }

  // 登録年次指定がある場合、登録年次が異なるものを配列から削除する
  if (query.registrationYear && query.registrationYear != 'all') {
    for (let index = 0; index < userDataList.length; index++) {
      const userData = userDataList[index];
      if (userData.startDate == null) {
        userDataList.splice(index, 1);
        index--;
        continue;
      } else {
        const startDate: Date = new Date(userData.startDate);
        if (startDate.getFullYear().toString() !== query.registrationYear) {
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
  return { data: userDataList };
};
