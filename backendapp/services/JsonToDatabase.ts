import { DbAccess } from '../logic/DbAccess';
import { readFileSync, readdirSync, rename, existsSync, mkdirSync } from 'fs';
import { ApiReturnObject, RESULT } from '../logic/ApiCommon';
import lodash from 'lodash';

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

/**
 * Postgresクエリ用に数値の配列を文字列でカンマ区切りにして返す
 * @param numArray
 * @returns
 */
export const numArrayCast2Pg = (numArray: number[]): string => {
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

/** 
 * undefinedで入ってくるかもしれない数値を検出し、テキスト形式に直す
 * undefinedの場合は"NULL"で返す
*/
export const undefined2Null = (num: number|undefined): string => {
  if(num === null || num === undefined){
    return 'NULL';
  }
  return num.toString();
};

/**
 * 既に存在するschema_string_idかを確認
 * @param stringId 確認対象のschema_string_id
 * @returns 存在する場合、そのschema_idを、存在しない場合は-1を返す
 */
const checkStringId = async (stringId: string): Promise<number> => {
  console.log('既に存在するschema_string_idかを確認');
  const query = `SELECT schema_id FROM jesgo_document_schema WHERE schema_id_string = '${stringId}'`;
  console.log(query);
  const dbAccess = new DbAccess();
  await dbAccess.connectWithConf();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ret: any[] = (await dbAccess.query(query)) as any[];
  await dbAccess.end();
  if (ret.length > 0) {
    // 既に存在するschema_string_id
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
    return ret[0].schema_id as number;
  }
  // 存在しない場合は-1を返す
  return -1;
};

/**
 * 次に使用するInsert用のIDを返す
 * 既に存在するschema_string_idかを確認してあればそれのschema_id,
 * なければ現在使用されているschemaIdの最大値+1を返す
 * @param stringId 確認対象のschema_string_id
 * @returns 次に使用するInsert用のID
 */
const getInsertId = async (stringId: string): Promise<number> => {
  let insertId: number = await checkStringId(stringId);
  if (insertId == -1) {
    const dbAccess = new DbAccess();
    await dbAccess.connectWithConf();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ret: any[] = (await dbAccess.query(
      `select max(schema_id) from jesgo_document_schema`
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    )) as any[];
    await dbAccess.end();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    insertId = (ret[0].max as number) + 1; //
  }
  return insertId;
};

const makeInsertQuery = (insertId: number, json: JSONSchema7): string => {
  const titles: string[] = (json.title as string).split(' ', 2);
  let subtitle = '';
  if (titles.length > 1) {
    subtitle = titles[1];
  }
  // INSERT
  let query =
    'INSERT INTO jesgo_document_schema (schema_id, schema_id_string, title, subtitle, document_schema';
  let value = `${insertId}, '${json.$id as string}', '${
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
    }
    if (json['jesgo:valid'][1] != null) {
      query += ', valid_until';
      value += `, '${json['jesgo:valid'][1]}'`;
    }
  }
  // author はNOTNULL
  query += ', author';
  if (json['jesgo:author'] != null) {
    value += `, ${json['jesgo:author']}`;
  } else {
    value += `, ''`;
  }

  // version はNOTNULL
  query += ', version_major, version_minor';
  if (json['jesgo:version'] != null) {
    value += `, ${json['jesgo:version']}, ${json['jesgo:version']}`;
  } else {
    value += `, 1, 2`;
  }

  query += ', plugin_id';
  value += `, 0`;

  query += `) VALUES (${value})`;

  return query;
};

const moveFile = (filePath: string) => {
  const migratePath: string = filePath.replace(
    'backendapp/import',
    'backendapp/imported'
  );
  const migratePathDivided: string[] = migratePath.split('/');
  migratePathDivided.pop();

  // 配列の[0],[1]はそれぞれ固定パス部分なので省略
  for (let i = 2; i < migratePathDivided.length; i++) {
    let dirPath = '';
    for (let j = 0; j <= i; j++) {
      dirPath += `${migratePathDivided[j]}/`;
    }
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath);

      console.log('Folder Created Successfully.');
    }
  }
  rename(filePath, migratePath, (err) => {
    if (err) {
      console.log(err);
    }
  });
};

const fileListInsert = async (fileList: string[]) => {
  for (let i = 0; i < fileList.length; i++) {
    const json: JSONSchema7 = JSON.parse(
      readFileSync(fileList[i], 'utf8')
    ) as JSONSchema7;

    // Insert用IDの取得
    const insertId = await getInsertId(json.$id as string);

    const dbAccess = new DbAccess();
    await dbAccess.connectWithConf();
    await dbAccess.query(makeInsertQuery(insertId, json));
    await dbAccess.end();
    moveFile(fileList[i]);
  }
};

/**
 * DBに登録されているスキーマのsubschema, childschema情報をアップデートする
 */
export const schemaListUpdate = async () => {
  type dbRow = {
    schema_id: number;
    schema_id_string: string;
    sub_s: string[];
    child_s: string[];
  };
  type schemaId = { schema_id: number };

  // selectでDBに保存されている各スキーマのschema_id,schema_string_id,subschema,childschema一覧を取得
  const dbAccess = new DbAccess();
  await dbAccess.connectWithConf();
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
        const schemaIds: schemaId[] = (await dbAccess.query(
          'SELECT schema_id FROM jesgo_document_schema WHERE schema_id_string = $1',
          [row.sub_s[j]]
        )) as schemaId[];
        if (schemaIds.length > 0) {
          subSchemaList.push(schemaIds[0].schema_id);
        }
      }
    }
    if (row.child_s != null) {
      for (let k = 0; k < row.child_s.length; k++) {
        const schemaIds: schemaId[] = (await dbAccess.query(
          'SELECT schema_id FROM jesgo_document_schema WHERE schema_id_string = $1',
          [row.child_s[k]]
        )) as schemaId[];
        if (schemaIds.length > 0 && subSchemaList.includes(schemaIds[0].schema_id) === false) {
          childSchemaList.push(schemaIds[0].schema_id);
        }
      }
    }
    if (row.schema_id_string !== null) {
      // 自身を親に持つスキーマを子スキーマに追加
      const schemaIds: schemaId[] = (await dbAccess.query(
        `SELECT schema_id FROM jesgo_document_schema WHERE document_schema->>'jesgo:parentschema' like '%"${row.schema_id_string}"%'`,
        []
      )) as schemaId[];
      for (let l = 0; l < schemaIds.length; l++) {
        if(subSchemaList.includes(schemaIds[l].schema_id) === false){
          childSchemaList.push(schemaIds[l].schema_id);
        }
      }

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
    }

    // 子スキーマのリストから重複を削除
    // eslint-disable-next-line
    const newChildSchemaList = lodash.uniq(childSchemaList) as number[];
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
  await dbAccess.end();
};

/**
 * ユーザの新規登録
 * 権限：管理者
 * 必要情報を入力し、ユーザを新規登録する
 * @param name ログイン名
 * @param display_name 表示名
 * @param password パスワード(平文)
 * @param roll_id ロール種別
 * @returns TRUEorFALSE(新規登録の成否)
 */
export const jsonToSchema = () => {
  return new Promise<ApiReturnObject>((solve) => {
    console.log('json2schema');

    const dirPath = './backendapp/import';

    const listFiles = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((dirent) =>
        dirent.isFile()
          ? [`${dir}/${dirent.name}`]
          : listFiles(`${dir}/${dirent.name}`)
      );

    let fileList: string[] = [];
    fileList = listFiles(dirPath);

    // 逐次的に同期処理したいのでforで書く(mapだと非同期になる)
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      await fileListInsert(fileList);
    })
      .call(null)
      .then();

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    schemaListUpdate();

    solve({ statusNum: RESULT.NORMAL_TERMINATION, body: null });
  });
};
