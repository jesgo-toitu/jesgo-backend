import { logging, LOGTYPE } from "./Logger";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Const {
  export const JESGO_TAG = {
    PREFIX: 'jesgo:tag',
    CANCER_MAJOR: 'cancer_major',
    CANCER_MINOR: 'cancer_minor',
    FIGO: 'figo',
    INITIAL_TREATMENT_DATE: 'initial_treatment_date',
    DIAGNOSIS_DATE: 'diagnosis_date',
    REGISTRABILITY: 'registrability',
    REGISTRATION_NUMBER: 'registration_number',
    RECURRENCE: 'recurrence',
    TREATMENT_SURGERY: 'treatment_surgery',
    TREATMENT_CHEMO: 'treatment_chemo',
    TREATMENT_RADIO: 'treatment_radio',
    TREATMENT_SUPPORTIVECARE: 'treatment_supportivecare',
    THREE_YEAR_PROGNOSIS: 'three_year_prognosis',
    FIVE_YEAR_PROGNOSIS: 'five_year_prognosis',
  }
}

export const jesgo_tagging = (tag:string):string => {
  return `"${Const.JESGO_TAG.PREFIX}":"${tag}"`
}

export const escapeText = (text:string):string => {
  return text.replace('"', '\\"');
}

// 現在日付とN年の差があるかを確認する
export const isAgoYearFromNow = (date:Date, year:number):boolean => {
  logging(LOGTYPE.DEBUG, `呼び出し`, 'Utility', 'isAgoYearFromNow');
  const compareDateMillSec = (new Date()).getTime() - date.getTime();
  // ミリ秒の差を日数に直す
  const compareDay = compareDateMillSec / (24 * 60 * 60 * 1000);
  // N年*365日より差が大きかったらN年以上立ってるものとする
  return compareDay > year * 365;
}