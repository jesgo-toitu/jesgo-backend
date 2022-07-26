import { DbAccess } from '../logic/DbAccess';
import { readFileSync, readdirSync, rename, existsSync, mkdirSync } from 'fs';
import { ApiReturnObject, RESULT } from '../logic/ApiCommon';
import lodash from 'lodash';
import { logging, LOGTYPE } from '../logic/Logger';
import { Extract } from 'unzipper';
import * as fs from 'fs';
import fse from 'fs-extra';
import * as path from 'path';

// 定数
// 一時展開用パス
const dirPath = './tmp';


//インターフェース

/**
 * Primitive type
 * @see https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.1.1
 */
export type JSONSchema7TypeName =
  | 'string' //
  | 'number'
  | 'integer'
  | 'boolean'
  | 'object'
  | 'array'
  | 'null';

/**
 * Primitive type
 * @see https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.1.1
 */
export type JSONSchema7Type =
  | string //
  | number
  | boolean
  | JSONSchema7Object
  | JSONSchema7Array
  | null;

// Workaround for infinite type recursion
export interface JSONSchema7Object {
  [key: string]: JSONSchema7Type;
}

// Workaround for infinite type recursion
// https://github.com/Microsoft/TypeScript/issues/3496#issuecomment-128553540
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface JSONSchema7Array extends Array<JSONSchema7Type> {}

/**
 * Meta schema
 *
 * Recommended values:
 * - 'http://json-schema.org/schema#'
 * - 'http://json-schema.org/hyper-schema#'
 * - 'http://json-schema.org/draft-07/schema#'
 * - 'http://json-schema.org/draft-07/hyper-schema#'
 *
 * @see https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-5
 */
export type JSONSchema7Version = string;

/**
 * JSON Schema v7
 * @see https://tools.ietf.org/html/draft-handrews-json-schema-validation-01
 */
export type JSONSchema7Definition = JSONSchema7 | boolean;
export interface JSONSchema7 {
  $id?: string | undefined;
  $ref?: string | undefined;
  $schema?: JSONSchema7Version | undefined;
  $comment?: string | undefined;

  /**
   * @see https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.1
   */
  type?: JSONSchema7TypeName | JSONSchema7TypeName[] | undefined;
  enum?: JSONSchema7Type[] | undefined;
  const?: JSONSchema7Type | undefined;

  /**
   * @see https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.2
   */
  multipleOf?: number | undefined;
  maximum?: number | undefined;
  exclusiveMaximum?: number | undefined;
  minimum?: number | undefined;
  exclusiveMinimum?: number | undefined;

  /**
   * @see https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.3
   */
  maxLength?: number | undefined;
  minLength?: number | undefined;
  pattern?: string | undefined;

  /**
   * @see https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.4
   */
  items?: JSONSchema7Definition | JSONSchema7Definition[] | undefined;
  additionalItems?: JSONSchema7Definition | undefined;
  maxItems?: number | undefined;
  minItems?: number | undefined;
  uniqueItems?: boolean | undefined;
  contains?: JSONSchema7 | undefined;

  /**
   * @see https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.5
   */
  maxProperties?: number | undefined;
  minProperties?: number | undefined;
  required?: string[] | undefined;
  properties?:
    | {
        [key: string]: JSONSchema7Definition;
      }
    | undefined;
  patternProperties?:
    | {
        [key: string]: JSONSchema7Definition;
      }
    | undefined;
  additionalProperties?: JSONSchema7Definition | undefined;
  dependencies?:
    | {
        [key: string]: JSONSchema7Definition | string[];
      }
    | undefined;
  propertyNames?: JSONSchema7Definition | undefined;

  /**
   * @see https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.6
   */
  if?: JSONSchema7Definition | undefined;
  then?: JSONSchema7Definition | undefined;
  else?: JSONSchema7Definition | undefined;

  /**
   * @see https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.7
   */
  allOf?: JSONSchema7Definition[] | undefined;
  anyOf?: JSONSchema7Definition[] | undefined;
  oneOf?: JSONSchema7Definition[] | undefined;
  not?: JSONSchema7Definition | undefined;

  /**
   * @see https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-7
   */
  format?: string | undefined;

  /**
   * @see https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-8
   */
  contentMediaType?: string | undefined;
  contentEncoding?: string | undefined;

  /**
   * @see https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-9
   */
  definitions?:
    | {
        [key: string]: JSONSchema7Definition;
      }
    | undefined;

  /**
   * @see https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-10
   */
  title?: string | undefined;
  description?: string | undefined;
  default?: JSONSchema7Type | undefined;
  readOnly?: boolean | undefined;
  writeOnly?: boolean | undefined;
  examples?: JSONSchema7Type | undefined;

  /**
   * JSONSchema 未対応プロパティ
   */
  $defs?:
    | {
        [key: string]: JSONSchema7Definition;
      }
    | undefined;
  units?: string | undefined;

  /**
   * 拡張ボキャブラリー
   */
  'jesgo:required'?: string[] | undefined;
  'jesgo:set'?: string | undefined;
  'jesgo:parentschema'?: string[] | undefined;
  'jesgo:unique'?: boolean | undefined;
  'jesgo:copy'?: boolean | undefined;
  'jesgo:subschema'?: string[] | undefined;
  'jesgo:childschema'?: string[] | undefined;
  'jesgo:ref'?: string | undefined;
  'jesgo:ui:visibleWhen'?: JSONSchema7 | undefined;
  'jesgo:ui:subschemastyle'?: string | undefined;
  'jesgo:ui:textarea'?: number | boolean | undefined;
  'jesgo:valid'?: string[] | undefined;
  'jesgo:version'?: string | undefined;
  'jesgo:author'?: string | undefined;
}

type oldSchema = {
  schema_id: number;
  schema_primary_id: number;
  valid_from: Date;
  valid_until: Date|null;
  version_major: number;
  version_minor: number,
}

const dbAccess = new DbAccess();

/**
 * Postgresクエリ用に数値の配列を文字列でカンマ区切りにして返す
 * @param numArray
 * @returns
 */
export const numArrayCast2Pg = (numArray: number[]): string => {
  logging(LOGTYPE.DEBUG, `呼び出し`, 'JsonToDatabase', 'numArrayCast2Pg');
  let isFirst = true;
  let numStr = '';
  for (let index = 0; index < numArray.length; index++) {
    const num = numArray[index];
    if (isFirst) {
      isFirst = false;
    } else {
      numStr += ', ';
    }
    numStr += num.toString();
  }
  return numStr;
};

// 日付文字列をyyyy/MM/ddなどの形式に変換
const formatDateStr = (dtStr: string, separator: string) => {
  if (!dtStr) return '';
  try {
    const dateObj = new Date(dtStr);
    const y = dateObj.getFullYear();
    const m = `00${dateObj.getMonth() + 1}`.slice(-2);
    const d = `00${dateObj.getDate()}`.slice(-2);
    return `${y}${separator}${m}${separator}${d}`;
  } catch {
    return '';
  }
};

// 日付(Date形式)をyyyy/MM/ddなどの形式に変換
const formatDate = (dateObj: Date, separator = '') => {
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
const formatTime = (dateObj: Date, separator = '') => {
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
 * 入力された日付の前日を取得
 * @param date 入力日
 * @returns 入力日の前日
 */
const getPreviousDay = (date:Date): Date => {
  logging(LOGTYPE.DEBUG, `呼び出し`, 'JsonToDatabase', 'getPreviousDay');
  const previousDate = date;
  previousDate.setDate(date.getDate() - 1);
  logging(LOGTYPE.DEBUG, `${date.toDateString()}の前日として${previousDate.toDateString()}を取得`, 'JsonToDatabase', 'getPreviousDay');
  return previousDate;
};

/** 
 * undefinedで入ってくるかもしれない数値を検出し、テキスト形式に直す
 * undefinedの場合は"NULL"で返す
*/
export const undefined2Null = (num: number|undefined): string => {
  logging(LOGTYPE.DEBUG, `呼び出し`, 'JsonToDatabase', 'undefined2Null');
  if(num === null || num === undefined){
    return 'NULL';
  }
  return num.toString();
};

/**
 * 一時展開用のディレクトリパスを削除したファイルパスを返す
 * もともと一時展開用のディレクトリパスが付いていなければファイルパスをそのまま返す
 * @param tempPath 一時展開用のディレクトリパス
 * @param filePath ファイルパス
 * @returns 一時展開用のディレクトリパスを削除したファイルパス
 */
export const cutTempPath = (tempPath:string, filePath:string):string => {
  if(filePath.startsWith(tempPath)){
    return filePath.slice(tempPath.length);
  }
  return filePath;
}

/**
 * 基底スキーマと継承スキーマのIDを入力に、スキーマ同士の関係にエラーがないかを確認する
 * @param id1 継承スキーマのID
 * @param id2 基底スキーマのID
 * @returns エラーがある場合はtrueを返す
 */
export const hasInheritError = async (id1:number, id2:number): Promise<boolean> => {
  logging(LOGTYPE.DEBUG, `呼び出し`, 'JsonToDatabase', 'hasInheritError');
  const results = await dbAccess.query(
    `SELECT uniqueness FROM jesgo_document_schema WHERE schema_id IN (${id1}, ${id2})`
    ) as {uniqueness:boolean, schema_id_string:string}[];
  if(results[0].uniqueness === results[1].uniqueness){
    // 継承先と基底の間でjesgo:uniqueの値が一緒であればエラー無しを返す
    return false;
  }
  logging(LOGTYPE.ERROR, `${results[0].schema_id_string}と${results[1].schema_id_string}の間に継承エラー発生`, 'JsonToDatabase', 'hasInheritError');
  return true;
}

/**
 * 既に存在するschema_string_idかを確認
 * @param stringId 確認対象のschema_string_id
 * @returns 存在する場合、そのschema_idを、存在しない場合は-1を返す
 */
const getOldSchema = async (stringId: string): Promise<oldSchema> => {
  logging(LOGTYPE.DEBUG, `呼び出し`, 'JsonToDatabase', 'getOldSchema');
  const query = 
  `SELECT schema_id, valid_from, valid_until, version_major, version_minor, schema_primary_id
   FROM jesgo_document_schema WHERE schema_id_string = '${stringId}'
   ORDER BY schema_primary_id DESC LIMIT 1;`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ret: oldSchema[] = (await dbAccess.query(query)) as oldSchema[];
  if (ret.length > 0) {
    // 既に存在するschema_string_id
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
    return ret[0];
  }
  const newInsertId = await getInsertId();
  // 存在しない場合は新規の構造体を返す
  const newSchema:oldSchema = {
    schema_id: newInsertId,
    schema_primary_id: -1,
    valid_from: new Date('1970/01/01'),
    valid_until: null,
    version_major: 0,
    version_minor: 0,
  }
  return newSchema;
};

/**
 * 次に使用するInsert用のIDを返す
 * 既に存在するschema_string_idかを確認してあればそれのschema_id,
 * なければ現在使用されているschemaIdの最大値+1を返す
 * @param stringId 確認対象のschema_string_id
 * @returns 次に使用するInsert用のID
 */
const getInsertId = async (): Promise<number> => {
  logging(LOGTYPE.DEBUG, `呼び出し`, 'JsonToDatabase', 'getInsertId');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ret: any[] = (await dbAccess.query(
    `select max(schema_id) from jesgo_document_schema`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  )) as any[];
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return (ret[0].max as number) + 1; //
};

/**
 * アップデート前と後でバージョン遷移が正しいかどうかを確認する
 * @param baseMajor アップデート前のメジャーバージョン
 * @param baseMinor アップデート前のマイナーバージョン
 * @param updateMajor アップデート後のメジャーバージョン
 * @param updateMinor アップデート後のマイナーバージョン
 * @returns 問題があればtrueを返す
 */
const hasVersionUpdateError = (baseMajor:number, baseMinor:number, updateMajor:number, updateMinor:number):boolean =>{
  logging(LOGTYPE.DEBUG, `呼び出し`, 'JsonToDatabase', 'hasVersionUpdateError');
  // メジャーバージョンが旧版の方が大きければエラー
  if(updateMajor < baseMajor){
    logging(LOGTYPE.ERROR, `呼び出し`, 'メジャーバージョンが旧版の方が大きい', 'hasVersionUpdateError');
    return true;
  }
  // メジャーバージョンが旧版と同じかつ、マイナーバージョンが旧版以下(同じも含む)であればエラー
  if(updateMajor === baseMajor && updateMinor <= baseMinor){
    logging(LOGTYPE.ERROR, `呼び出し`, 'マイナーバージョンが旧版以下', 'hasVersionUpdateError');
    return true;
  }
  // どちらでもなければエラー無し
  return false;
}

const makeInsertQuery = (schemaInfo: oldSchema, json: JSONSchema7, fileName: string, errorMessages: string[]): string[] => {
  logging(LOGTYPE.DEBUG, `呼び出し`, 'JsonToDatabase', 'makeInsertQuery');
  let subQuery = '';
  const titles: string[] = (json.title as string).split(' ', 2);
  let subtitle = '';
  if (titles.length > 1) {
    subtitle = titles[1];
  }
  // INSERT
  let query =
    'INSERT INTO jesgo_document_schema (schema_id, schema_id_string, title, subtitle, document_schema';
  let value = `${schemaInfo.schema_id}, '${json.$id as string}', '${
    titles[0]
  }', '${subtitle}', '${JSON.stringify(json)}'`;
  if (json['jesgo:unique'] != null) {
    query += ', uniqueness';
    value += `, ${json['jesgo:unique'].toString()}`;
  }

  if (json['jesgo:valid'] != null) {
    if (json['jesgo:valid'][0] != null) {
      query += ', valid_from';
      value += `, '${json['jesgo:valid'][0]}'`;

      const newValidFrom = new Date(json['jesgo:valid'][0])
      // 旧スキーマと有効期限開始日が同じか、古い場合はエラー
      if(schemaInfo.valid_from >= newValidFrom){
        logging(LOGTYPE.ERROR, `スキーマ(id=${json.$id as string})の有効期限開始日は登録済のものより新しくしてください。`, 'JsonToDatabase', 'makeInsertQuery');
        errorMessages.push(`[${cutTempPath(dirPath,fileName)}]スキーマ(id=${json.$id as string})の有効期限開始日は登録済のものより新しくしてください。`);
        return [];
      }
      
      // 旧スキーマに有効期限終了日が設定されていないか、新スキーマの有効期限開始日以降であれば
      // 旧スキーマの有効期限終了日を新スキーマの有効期限開始日前日に設定する
      if(schemaInfo.valid_until === null || schemaInfo.valid_until >= newValidFrom){
        // schema_primary_idが-1であれば旧スキーマが存在しないので対応しない
        if(schemaInfo.schema_primary_id !== -1){
          logging(LOGTYPE.DEBUG, `スキーマ(id=${json.$id as string}, Pid=${schemaInfo.schema_primary_id})の有効期限終了日を更新`, 'JsonToDatabase', 'makeInsertQuery');
          subQuery = `UPDATE jesgo_document_schema SET valid_until = '${formatDate(getPreviousDay(newValidFrom), '-')}' WHERE schema_primary_id = ${schemaInfo.schema_primary_id}`
        }
      }
    }
    if (json['jesgo:valid'][1] != null) {
      query += ', valid_until';
      value += `, '${json['jesgo:valid'][1]}'`;
    }
  }else{
    // 有効期限が設定されていないときは、登録日を有効期限にする
    const dateObj = new Date();
    const y = dateObj.getFullYear();
    const m = `00${dateObj.getMonth() + 1}`.slice(-2);
    const d = `00${dateObj.getDate()}`.slice(-2);
    query += ', valid_from';
    value += `, '${y}-${m}-${d}'`;
    const newValidFrom = new Date(`${y}-${m}-${d}`)

    // 旧スキーマと有効期限開始日が同じか、古い場合はエラー
    if(schemaInfo.valid_from >= newValidFrom){
      logging(LOGTYPE.ERROR, `スキーマ(id=${json.$id as string})の有効期限開始日は登録済のものより新しくしてください。`, 'JsonToDatabase', 'makeInsertQuery');
      errorMessages.push(`[${cutTempPath(dirPath,fileName)}]スキーマ(id=${json.$id as string})の有効期限開始日は登録済のものより新しくしてください。`);
      return [];
    }

    // 旧スキーマに有効期限終了日が設定されていないか、新スキーマの有効期限開始日以降であれば
    // 旧スキーマの有効期限終了日を新スキーマの有効期限開始日前日に設定する
    if(schemaInfo.valid_until === null || schemaInfo.valid_until >= newValidFrom){
      // schema_primary_idが-1であれば旧スキーマが存在しないので対応しない
      if(schemaInfo.schema_primary_id !== -1){
        logging(LOGTYPE.DEBUG, `スキーマ(id=${json.$id as string}, Pid=${schemaInfo.schema_primary_id})の有効期限終了日を更新`, 'JsonToDatabase', 'makeInsertQuery');
        subQuery = `UPDATE jesgo_document_schema SET valid_until = '${formatDate(getPreviousDay(newValidFrom), '-')}' WHERE schema_primary_id = ${schemaInfo.schema_primary_id}`
      }
    }
  }

  // author はNOTNULL
  query += ', author';
  if (json['jesgo:author'] != null) {
    value += `, ${json['jesgo:author']}`;
  } else {
    value += `, ''`;
  }

  // version
  query += ', version_major, version_minor';
  if (json['jesgo:version'] != null) {
    try{
      const majorVersion = Number(json['jesgo:version'].split('.')[0]);
      const minorVersion = Number(json['jesgo:version'].split('.')[1]);
      
      // 新規登録する物が登録済よりバージョンが低いか同じ場合、エラーを返す
      if(hasVersionUpdateError(schemaInfo.version_major, schemaInfo.version_minor, majorVersion, minorVersion)){
        logging(LOGTYPE.ERROR, `スキーマ(id=${json.$id as string})のバージョンは登録済のものより新しくしてください。`, 'JsonToDatabase', 'makeInsertQuery');
        errorMessages.push(`[${cutTempPath(dirPath,fileName)}]スキーマ(id=${json.$id as string})のバージョンは登録済のものより新しくしてください。`);
        return [];
      }
      
      value += `, ${majorVersion}, ${minorVersion}`;
    }catch{
      // バージョン形式が正しくない場合もエラーを返す
      logging(LOGTYPE.ERROR, `スキーマ(id=${json.$id as string})のバージョンの形式に不備があります。`, 'JsonToDatabase', 'makeInsertQuery');
      errorMessages.push(`[${cutTempPath(dirPath,fileName)}]スキーマ(id=${json.$id as string})のバージョンの形式に不備があります。`);
      return [];
    }
  } else {
    // バージョンはNOT NULL
    logging(LOGTYPE.ERROR, `スキーマ(id=${json.$id as string})のバージョンが未記載です。`, 'JsonToDatabase', 'makeInsertQuery');
    errorMessages.push(`[${cutTempPath(dirPath,fileName)}]スキーマ(id=${json.$id as string})のバージョンが未記載です。`);
    return [];
  }

  query += ', plugin_id';
  value += `, 0`;

  query += `) VALUES (${value})`;

  return [query, subQuery];
};

const fileListInsert = async (fileList: string[], errorMessages: string[]):Promise<number> => {
  logging(LOGTYPE.DEBUG, `呼び出し`, 'JsonToDatabase', 'fileListInsert');
  let updateNum = 0;
  for (let i = 0; i < fileList.length; i++) {
    if(!fileList[i].endsWith('.json')){
      logging(LOGTYPE.ERROR, `[${cutTempPath(dirPath,fileList[i])}]JSONファイル以外のファイルが含まれています。`, 'JsonToDatabase', 'fileListInsert');
      errorMessages.push(`[${cutTempPath(dirPath,fileList[i])}]JSONファイル以外のファイルが含まれています。`);
      continue;
    }
    let json: JSONSchema7 = {};
    try{
      json = JSON.parse(
        readFileSync(fileList[i], 'utf8')
      ) as JSONSchema7;
    }catch{
      logging(LOGTYPE.ERROR, `[${cutTempPath(dirPath,fileList[i])}]JSON形式が正しくないファイルが含まれています。`, 'JsonToDatabase', 'fileListInsert');
      errorMessages.push(`[${cutTempPath(dirPath,fileList[i])}]JSON形式が正しくないファイルが含まれています。`)
      continue;
    }


    // Insert用IDを含む旧データの取得
    const oldJsonData = await getOldSchema(json.$id as string);

    const queries = makeInsertQuery(oldJsonData, json, fileList[i], errorMessages);
    if(queries.length > 0){
      await dbAccess.query(queries[0]);
      if(queries[1] !== ''){
        // 旧スキーマの有効期限更新がある場合そちらも行う
        await dbAccess.query(queries[1]);
      }
      updateNum++;
    }
  }
  return updateNum;
};

/**
 * DBに登録されているスキーマのsubschema, childschema情報をアップデートする
 */
export const schemaListUpdate = async (errorMessages: string[]) => {
  logging(LOGTYPE.DEBUG, `呼び出し`, 'JsonToDatabase', 'schemaListUpdate');

  // 先に「子スキーマから指定した親スキーマの関係リスト」を逆にしたものを作成しておく
  type parentSchemas = {
    schema_id: number;
    parent_schemas: string[];
  }

  type childSchemas = {
    schema_id: number;
    child_schema_ids: number[];
  }
  // selectでDBに保存されている各スキーマのparent_schema一覧を取得
  const childSchemasList:childSchemas[] = [];
  const parentSchemas: parentSchemas[] = (await dbAccess.query(
    `SELECT schema_id, 
    document_schema->'jesgo:parentschema' as parent_schemas
    FROM jesgo_document_schema`
  )) as parentSchemas[];
  for (let i = 0; i < parentSchemas.length; i++) {
    if(parentSchemas[i].parent_schemas){
      for(let j = 0; j < parentSchemas[i].parent_schemas.length; j++){
        // ワイルドカードを含むかどうかで処理を分ける
        if(parentSchemas[i].parent_schemas[j].includes('*')){
          const splitedId = parentSchemas[i].parent_schemas[j].split('*');
          const searchId = splitedId[0].endsWith('/') && splitedId[1] === '' ? `${splitedId[0]}/*` : `${splitedId[0]}[^/]*${splitedId[1]}$`;
          const schemaIds: schemaId[] = (await dbAccess.query(
            'SELECT schema_id FROM jesgo_document_schema WHERE schema_id_string ~ $1',
            [searchId]
          )) as schemaId[];
          for (let k = 0; k < schemaIds.length; k++) {
            const targetSchema = childSchemasList.find((v) => v.schema_id === schemaIds[k].schema_id);
            if(targetSchema){
              targetSchema.child_schema_ids.push(parentSchemas[i].schema_id);
            }else{
              const newSchema: childSchemas = {
                schema_id: schemaIds[k].schema_id,
                child_schema_ids: [parentSchemas[i].schema_id]
              };
              childSchemasList.push(newSchema);
            }
          }
        }else{
          const schemaIds: schemaId[] = (await dbAccess.query(
            'SELECT schema_id FROM jesgo_document_schema WHERE schema_id_string = $1',
            [parentSchemas[i].parent_schemas[j]]
          )) as schemaId[];
          for (let k = 0; k < schemaIds.length; k++) {
            const targetSchema = childSchemasList.find((v) => v.schema_id === schemaIds[k].schema_id);
            if(targetSchema){
              targetSchema.child_schema_ids.push(parentSchemas[i].schema_id);
            }else{
              const newSchema: childSchemas = {
                schema_id: schemaIds[k].schema_id,
                child_schema_ids: [parentSchemas[i].schema_id]
              };
              childSchemasList.push(newSchema);
            }
            
          }
        }
      }
    }
  }

  type dbRow = {
    schema_id: number;
    schema_id_string: string;
    sub_s: string[];
    child_s: string[];
  };
  type schemaId = { schema_id: number };

  // selectでDBに保存されている各スキーマのschema_id,schema_string_id,subschema,childschema一覧を取得
  const dbRows: dbRow[] = (await dbAccess.query(
    `SELECT schema_id, 
    schema_id_string, 
    document_schema->'jesgo:subschema' as sub_s, 
    document_schema->'jesgo:childschema' as child_s 
    FROM jesgo_document_schema`
  )) as dbRow[];
  
  const candidateBaseSchemas = dbRows.slice(0);
  for (let i = 0; i < dbRows.length; i++) {
    const row: dbRow = dbRows[i];
    const subSchemaList: number[] = [];
    const childSchemaList: number[] = [];
    const inheritSchemaList: number[] = [];
    let baseSchemaId:number|undefined;
    if (row.sub_s != null) {
      for (let j = 0; j < row.sub_s.length; j++) {
        // ワイルドカードを含むかどうかで処理を分ける
        if(row.sub_s[j].includes('*')){
          const splitedId = row.sub_s[j].split('*');
          const searchId = splitedId[0].endsWith('/') && splitedId[1] === '' ? `${splitedId[0]}/*` : `${splitedId[0]}[^/]*${splitedId[1]}$`;
          const schemaIds: schemaId[] = (await dbAccess.query(
            'SELECT schema_id FROM jesgo_document_schema WHERE schema_id_string ~ $1',
            [searchId]
          )) as schemaId[];
          if (schemaIds.length > 0) {
            subSchemaList.push(schemaIds[0].schema_id);
          }
        }else{
          const schemaIds: schemaId[] = (await dbAccess.query(
            'SELECT schema_id FROM jesgo_document_schema WHERE schema_id_string = $1',
            [row.sub_s[j]]
          )) as schemaId[];
          if (schemaIds.length > 0) {
            subSchemaList.push(schemaIds[0].schema_id);
          }
        }
      }
    }
    if (row.child_s != null) {
      for (let k = 0; k < row.child_s.length; k++) {
        // ワイルドカードを含むかどうかで処理を分ける
        if(row.child_s[k].includes('*')){
          const splitedId = row.child_s[k].split('*');
          const searchId = splitedId[0].endsWith('/') && splitedId[1] === '' ? `${splitedId[0]}/*` : `${splitedId[0]}[^/]*${splitedId[1]}$`;
          const schemaIds: schemaId[] = (await dbAccess.query(
            'SELECT schema_id FROM jesgo_document_schema WHERE schema_id_string ~ $1',
            [searchId]
          )) as schemaId[];
          if (schemaIds.length > 0) {
            childSchemaList.push(schemaIds[0].schema_id);
          }
        }else{
          const schemaIds: schemaId[] = (await dbAccess.query(
            'SELECT schema_id FROM jesgo_document_schema WHERE schema_id_string = $1',
            [row.child_s[k]]
          )) as schemaId[];
          if (schemaIds.length > 0 && subSchemaList.includes(schemaIds[0].schema_id) === false) {
            childSchemaList.push(schemaIds[0].schema_id);
          }
        }
      }
    }
    
    // 自身を親に持つスキーマを子スキーマに追加
    const targetSchema = childSchemasList.find((v) => v.schema_id === row.schema_id);
    if(targetSchema){
      for(let i = 0; i < targetSchema.child_schema_ids.length; i++){
        childSchemaList.push(targetSchema.child_schema_ids[i]);
      }
    }
    
    if (row.schema_id_string !== null) {
      // 自身より下層のschema_id_stringを持つスキーマを継承スキーマに追加
      const inheritSchemaIds: schemaId[] = (await dbAccess.query(
        `SELECT schema_id FROM jesgo_document_schema WHERE schema_id_string like '${row.schema_id_string}/%'`,
        []
      )) as schemaId[];
      for (let m = 0; m < inheritSchemaIds.length; m++) {
        inheritSchemaList.push(inheritSchemaIds[m].schema_id);
      }

      // 自身の基底スキーマを探す
      const baseSchema = candidateBaseSchemas
      // 文字列の短い順(よりパスの短い順)に整列
      .sort((a,b) => a.schema_id_string.length - b.schema_id_string.length)
      .find(schema => row.schema_id_string.startsWith(`${schema.schema_id_string}/`));
      baseSchemaId = baseSchema?.schema_id;

      if(baseSchema){
        // 基底スキーマと継承スキーマの間でuniqueの設定値が異なる場合、エラーを出す
        if(await hasInheritError(row.schema_id, baseSchema.schema_id)){
          logging(LOGTYPE.ERROR, `継承スキーマ(id=${row.schema_id_string})、基底スキーマ(id=${baseSchema.schema_id_string})の間でunique設定が異なります`, 'JsonToDatabase', 'schemaListUpdate');
          errorMessages.push(`継承スキーマ(id=${row.schema_id_string})、基底スキーマ(id=${baseSchema.schema_id_string})の間でunique設定が異なります。`);
        }
      }
    }

    // 子スキーマのリストから重複を削除
    // eslint-disable-next-line
    const newChildSchemaList = lodash.uniq(childSchemaList).filter(id => !subSchemaList.includes(id));
    await dbAccess.query(
      `UPDATE jesgo_document_schema SET subschema = '{${numArrayCast2Pg(
        subSchemaList
      )}}', child_schema = '{${numArrayCast2Pg(
        newChildSchemaList
      )}}', inherit_schema = '{${numArrayCast2Pg(
        inheritSchemaList
      )}}', base_schema = ${undefined2Null(
        baseSchemaId
      )} WHERE schema_id = $1`,
      [row.schema_id]
    );
  }
};

export const jsonToSchema = async ():Promise<ApiReturnObject> => {
  logging(LOGTYPE.DEBUG, `呼び出し`, 'JsonToDatabase', 'jsonToSchema');
  const dirPath = './backendapp/import';

  const listFiles = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((dirent) =>
      dirent.isFile()
        ? [`${dir}/${dirent.name}`]
        : listFiles(`${dir}/${dirent.name}`)
    );

  let fileList: string[] = [];
  fileList = listFiles(dirPath);
  try{
    await dbAccess.connectWithConf();
    await dbAccess.query('BEGIN')

    await fileListInsert(fileList, []);

    await schemaListUpdate([]);

    await dbAccess.query('COMMIT');
    return { statusNum: RESULT.NORMAL_TERMINATION, body: null };
  } catch(e){
    logging(LOGTYPE.ERROR, `${(e as Error).message}`, 'JsonToDatabase', 'jsonToSchema');
    await dbAccess.query('ROLLBACK');
    return { statusNum: RESULT.ABNORMAL_TERMINATION, body: null };
  }finally{
    await dbAccess.end();
  }
};

const sleep = (time:number):Promise<void> => {
  return new Promise((resolve) => {
      setTimeout(() => {
          resolve()
      }, time)
  })
}

export const uploadZipFile = async (data:any):Promise<ApiReturnObject> => {
  logging(LOGTYPE.DEBUG, '呼び出し', 'JsonToDatabase', 'uploadZipFile');
  // eslint-disable-next-line
  const filePath:string = data.path;
  const errorMessages:string[] = [];
  let fileType:string = path.extname(data.originalname).toLowerCase();
  // eslint-disable-next-line
  try{
    switch (fileType) {
      case '.zip':
        fs.createReadStream(filePath).pipe( Extract( { path: dirPath } ) );
        break;
      case '.json':
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath);
        }
        fs.copyFileSync(filePath, path.join(dirPath, data.originalname));
        break;
      default:
        throw new Error('.zipファイルか.jsonファイルを指定してください.');
    }
    
    await sleep(500);

    const listFiles = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((dirent) =>
        dirent.isFile()
          ? [`${dir}/${dirent.name}`]
          : listFiles(`${dir}/${dirent.name}`)
      );

    let fileList: string[] = [];
    try{
      fileList = listFiles(dirPath);
    }catch{
      logging(LOGTYPE.ERROR, `展開に失敗したか、ファイルの内容がありません。`, 'JsonToDatabase', 'uploadZipFile');
      return { statusNum: RESULT.ABNORMAL_TERMINATION, body: {number:0, message:['展開に失敗したか、ファイルの内容がありません。']} };
    }


    await dbAccess.connectWithConf();

    const updateNum = await fileListInsert(fileList, errorMessages);

    // スキーマが1件以上新規登録、更新された場合のみ関係性のアップデートを行う
    if(updateNum > 0){
      await schemaListUpdate(errorMessages);
    }


    return { statusNum: RESULT.NORMAL_TERMINATION, body: {number:updateNum, message:errorMessages} };
  } catch(e){
    if(dbAccess.connected){
      await dbAccess.query('ROLLBACK');
    }
    if((e as Error).message.length > 0){
      logging(LOGTYPE.ERROR, (e as Error).message, 'JsonToDatabase', 'uploadZipFile');
    }
    return { statusNum: RESULT.ABNORMAL_TERMINATION, body: {number:0, message:errorMessages} };
  }finally{
    await dbAccess.end();
    try{
      // ファイルをリネームして保管
      const date = formatDate(new Date()) + formatTime(new Date());
      const migratePath = `uploads/${date}${fileType}`;
      rename(filePath, migratePath, (err) => {
        if (err) {
          logging(LOGTYPE.ERROR, `エラー発生 ${err.message}`, 'JsonToDatabase', 'uploadZipFile');
        }
        logging(LOGTYPE.DEBUG, `リネーム完了`, 'JsonToDatabase', 'uploadZipFile');
      });
    }catch{
      logging(LOGTYPE.ERROR, `リネーム対象無し`, 'JsonToDatabase', 'uploadZipFile');
    }

    // 展開したファイルを削除
    // eslint-disable-next-line
    fse.remove(path.join(dirPath, path.sep), (err) => {
      if (err){
        logging(LOGTYPE.ERROR, `エラー発生 ${err.message}`, 'JsonToDatabase', 'uploadZipFile');
      }
      logging(LOGTYPE.DEBUG, `展開したファイルを削除完了`, 'JsonToDatabase', 'uploadZipFile');
  });

  }
}
