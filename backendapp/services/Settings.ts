import { logging, LOGTYPE } from '../logic/Logger';
import { ApiReturnObject, RESULT } from '../logic/ApiCommon';
import { DbAccess } from '../logic/DbAccess';

export type settings = {
  hisid_alignment: boolean;
  hisid_digit: number;
  hisid_hyphen_enable: boolean;
  hisid_alphabet_enable: boolean;
  facility_name: string;
  jsog_registration_number: string;
  joed_registration_number: string;
};

export const getSettings = async (): Promise<ApiReturnObject> => {
  logging(LOGTYPE.DEBUG, '呼び出し', 'Settings', 'getSettings');
  try {
    const query = `SELECT 
    value->'setting'->'hisid'->>'alignment' as hisid_alignment, 
    value->'setting'->'hisid'->>'digit' as hisid_digit, 
    value->'setting'->'hisid'->>'hyphen_enable' as hisid_hyphen_enable, 
    value->'setting'->'hisid'->>'alphabet_enable' as hisid_alphabet_enable, 
    value->'setting'->'facility_information'->>'name' as facility_name, 
    value->'setting'->'facility_information'->>'jsog_registration_number' as jsog_registration_number, 
    value->'setting'->'facility_information'->>'joed_registration_number' as joed_registration_number 
    FROM jesgo_system_setting 
    WHERE setting_id = 1`;

    const dbAccess = new DbAccess();
    await dbAccess.connectWithConf();
    const ret = (await dbAccess.query(query)) as settings[];
    await dbAccess.end();

    return { statusNum: RESULT.NORMAL_TERMINATION, body: ret[0] };
  } catch (e) {
    logging(
      LOGTYPE.ERROR,
      `エラー発生 ${(e as Error).message}`,
      'Settings',
      'getSettings'
    );
    return { statusNum: RESULT.ABNORMAL_TERMINATION, body: null };
  }
};

export const updateSettings = async (
  json: settings
): Promise<ApiReturnObject> => {
  logging(LOGTYPE.DEBUG, '呼び出し', 'Settings', 'updateSettings');
  try {
    const saveJson = {
      setting: {
        hisid: {
          alignment: json.hisid_alignment,
          digit: json.hisid_digit,
          hyphen_enable: json.hisid_hyphen_enable,
          alphabet_enable: json.hisid_alphabet_enable,
        },
        facility_information: {
          name: json.facility_name,
          jsog_registration_number: json.jsog_registration_number,
          joed_registration_number: json.joed_registration_number,
        },
      },
    };

    const query = `UPDATE jesgo_system_setting SET value = '${JSON.stringify(
      saveJson
    )}' WHERE setting_id = 1`;

    const dbAccess = new DbAccess();
    await dbAccess.connectWithConf();
    await dbAccess.query(query);
    await dbAccess.end();

    return { statusNum: RESULT.NORMAL_TERMINATION, body: null };
  } catch (e) {
    logging(
      LOGTYPE.ERROR,
      `エラー発生 ${(e as Error).message}`,
      'Settings',
      'updateSettings'
    );
    return { statusNum: RESULT.ABNORMAL_TERMINATION, body: null };
  }
};
