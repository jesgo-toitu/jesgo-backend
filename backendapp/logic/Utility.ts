import { formatDateStr } from '../services/JsonToDatabase';
import { logging, LOGTYPE } from './Logger';
import crypto from 'crypto';
import { ParseStream } from 'unzipper';
import envVariables from '../config';

export interface Obj {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;
}

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
    SURGIGAL_COMPLICATIONS: 'has_complications',
    TREATMENT_CHEMO: 'treatment_chemo',
    TREATMENT_RADIO: 'treatment_radio',
    TREATMENT_SUPPORTIVECARE: 'treatment_supportivecare',
    THREE_YEAR_PROGNOSIS: 'three_year_prognosis',
    FIVE_YEAR_PROGNOSIS: 'five_year_prognosis',
  };
}

export const jesgo_tagging = (tag: string): string => {
  return `"${Const.JESGO_TAG.PREFIX}":"${tag}"`;
};

export const escapeText = (text: string): string => {
  return text.replace(/"/g, '\\"');
};

// 現在日付と満N年経過しているかを確認する
export const isAgoYearFromNow = (date: Date, year: number): boolean => {
  logging(LOGTYPE.DEBUG, `呼び出し`, 'Utility', 'isAgoYearFromNow');

  const yearDiff = new Date().getFullYear() - date.getFullYear();
  return yearDiff > year;
};

// 日付(Date形式)をyyyy/MM/ddなどの形式に変換
export const formatDate = (dateObj: Date, separator = '') => {
  try {
    const y = dateObj.getFullYear();
    const m = `00${dateObj.getMonth() + 1}`.slice(-2);
    const d = `00${dateObj.getDate()}`.slice(-2);
    return `${y}${separator}${m}${separator}${d}`;
  } catch {
    return '';
  }
};

// 時刻(Date形式)をHH:mm:ssの形式に変換
export const formatTime = (dateObj: Date, separator = '') => {
  try {
    const h = `00${dateObj.getHours()}`.slice(-2);
    const m = `00${dateObj.getMinutes()}`.slice(-2);
    const s = `00${dateObj.getSeconds()}`.slice(-2);
    return `${h}${separator}${m}${separator}${s}`;
  } catch {
    return '';
  }
};

/**
 * 一時展開用のディレクトリパスを削除したファイルパスを返す
 * もともと一時展開用のディレクトリパスが付いていなければファイルパスをそのまま返す
 * @param tempPath 一時展開用のディレクトリパス
 * @param filePath ファイルパス
 * @returns 一時展開用のディレクトリパスを削除したファイルパス
 */
export const cutTempPath = (tempPath: string, filePath: string): string => {
  if (filePath.startsWith(tempPath)) {
    return filePath.slice(tempPath.length);
  }
  return filePath;
};

// 患者特定ハッシュ値生成
export const GetPatientHash = (birthday: Date | string, his_id: string) => {
  let birthdayStr = '';
  if (birthday) {
    birthdayStr = formatDateStr(birthday.toString(), '');
  }

  // his_id + 生年月日(yyyyMMdd) + ソルトで生成
  return crypto
    .createHash('sha256')
    .update(
      `${his_id}${birthdayStr}${envVariables.hashSalt}`.replace(/\s+/g, ''),
      'utf8'
    )
    .digest('hex');
};

export const streamPromise = async (stream: ParseStream) => {
  return new Promise((resolve, reject) => {
    stream.on('close', () => {
      resolve('close');
    });
    stream.on('error', (error) => {
      reject(error);
    });
  });
};
// 日付文字列判定
export const isDateStr = (dateStr: string) =>
  !Number.isNaN(new Date(dateStr).getTime());

// Jsonpointerの末尾に配列指定系の文字列が含まれているかを返す
export const isPointerWithArray = (pointer: string) => {
  if (pointer.endsWith('/-')) {
    return true;
  }
  const match = pointer.match(/\/(\d+)$/);
  if (match) {
    return true;
  }
  return false;
};

// Jsonpointerの末尾から配列位置指定を取得する
export const getPointerArrayNum = (pointer: string) => {
  const match = pointer.match(/\/(\d+)$/);
  if (match) {
    return Number(match.slice(1));
  }
  return -1;
};

// Jsonpointerの末尾から配列位置指定を削除する
export const getPointerTrimmed = (pointer: string) => {
  if (pointer.endsWith('/-')) {
    return pointer.slice(0, -2);
  }
  const match = pointer.match(/\/(\d+)$/);
  if (match) {
    return pointer.slice(0, -match.length);
  }
  return pointer;
};
