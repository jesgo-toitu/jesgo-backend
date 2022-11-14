import { DbAccess } from '../logic/DbAccess';
import { GetPatientHash, Obj } from '../logic/Utility';
import { ApiReturnObject, RESULT } from '../logic/ApiCommon';
import { jesgoCaseDefine } from './Schemas';
import lodash from 'lodash';

export interface PackageDocumentRequest {
  jesgoCaseList: jesgoCaseDefine[];
  schema_id?: number;
  document_id?: number;
}

// 1患者情報の定義
export interface PatientItemDefine {
  hash: string;
  decline: boolean;
  documentList: object[];
}

/**
 * ひとまとめになったドキュメントを取得
 * @param reqest 
 * @returns 
 */
export const getPackagedDocument = async (reqest: PackageDocumentRequest) => {
  const { jesgoCaseList, schema_id, document_id } = reqest;

  const ret: PatientItemDefine[] = [];

  const dbAccess = new DbAccess();

  try {
    await dbAccess.connectWithConf();

    for (const jesgo_case of jesgoCaseList) {
      // 患者情報取得
      const retCase = (await dbAccess.query(
        'select date_of_birth, his_id, name, decline from jesgo_case where case_id = $1',
        [jesgo_case.case_id]
      )) as {
        date_of_birth: Date;
        his_id: string;
        name: string;
        decline: boolean;
      }[];

      if (retCase && retCase.length > 0) {
        const patInfo = retCase[0];

        // 患者ハッシュ値取得
        const hash = GetPatientHash(
          patInfo.date_of_birth,
          patInfo.his_id,
          patInfo.name
        );

        // 患者情報
        const patItem: PatientItemDefine = {
          hash: hash,
          decline: patInfo.decline,
          documentList: [],
        };

        // ドキュメントリスト取得
        interface jesgoDocumentSelectItem {
          document_id: number;
          case_id: number;
          event_date?: Date;
          document?: object;
          child_documents?: number[];
          schema_id: number;
          schema_primary_id: number;
          title: string;
          root_order: number;
        }

        // 抽出条件
        const whereList: [string, any][] = [];
        whereList.push(['case_id', jesgo_case.case_id]);
        whereList.push(['deleted', false]);
        // ドキュメントIDまたはスキーマIDで抽出
        if (document_id) {
          whereList.push(['document_id', document_id]);
        } else if (schema_id) {
          whereList.push(['schema_id', schema_id]);
        }

        // 再帰クエリで指定ドキュメントと子ドキュメントを一括取得する
        // #region [ 一連のドキュメント取得用SQL ]
        let select = `with recursive tmp as (select 
          document_id,
          case_id,
          event_date,
          document,
          child_documents,
          doc.schema_id,
          doc.schema_primary_id,
          sc.title,
          doc.root_order
          from jesgo_document doc 
          left join jesgo_document_schema sc on doc.schema_id = sc.schema_id `;
        if (whereList.length > 0) {
          select += 'where ';
          for (let i = 0; i < whereList.length; i++) {
            if (i > 0) select += 'and ';
            select += `doc.${whereList[i][0]} = $${i + 1} `;
          }
        }
        select += `union select 
          doc.document_id,
          doc.case_id,
          doc.event_date,
          doc.document,
          doc.child_documents,
          doc.schema_id,
          doc.schema_primary_id,
          sc.title,
          doc.root_order 
          from tmp, jesgo_document as doc 
          left join jesgo_document_schema sc on doc.schema_id = sc.schema_id 
          where doc.document_id = any(tmp.child_documents) and doc.deleted = false
        )
        select * from tmp order by document_id desc`;
        // #endregion

        const selectResult = (await dbAccess.query(
          select,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          whereList.map((p) => p[1])
        )) as jesgoDocumentSelectItem[];

        // ドキュメント検索関数
        const searchDocument = (
          docId: number,
          srcDocList: jesgoDocumentSelectItem[],
          baseObject: Obj
        ) => {
          const parentDoc = srcDocList.find((p) => p.document_id === docId);
          if (parentDoc) {
            // 同名タイトルがあれば配列にする
            // eslint-disable-next-line no-prototype-builtins
            if ((baseObject as object).hasOwnProperty(parentDoc.title)) {
              if (!Array.isArray(baseObject[parentDoc.title])) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const tmp = baseObject[parentDoc.title];
                baseObject[parentDoc.title] = [];

                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                baseObject[parentDoc.title].push(tmp);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                baseObject[parentDoc.title].push(parentDoc.document);
              } else {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                baseObject[parentDoc.title].push(parentDoc.document);
              }
            } else {
              baseObject[parentDoc.title] = lodash.cloneDeep(
                parentDoc.document
              );
            }

            // 子ドキュメント取得
            if (
              parentDoc.child_documents &&
              parentDoc.child_documents.length > 0
            ) {
              parentDoc.child_documents.forEach((childDocId) => {
                searchDocument(
                  childDocId,
                  srcDocList,
                  baseObject[parentDoc.title] as Obj
                );
              });
            }
          }
        };

        const filtered = selectResult
          .filter((p) => {
            // 対象ドキュメントもしくはスキーマがあればそちらで抽出
            if (document_id) {
              return p.document_id == document_id;
            } else if (schema_id) {
              return p.schema_id === schema_id;
            } else {
              // ドキュメント未指定の場合はルートドキュメントから処理
              return p.root_order > -1;
            }
          })
          .sort((f, s) =>
            document_id || schema_id ? 0 : f.root_order - s.root_order
          );
        // 同名タイトルでグループ化
        const group = lodash.groupBy(filtered, 'title');
        Object.entries(group).forEach((keyval) => {
          const tmpObj: Obj = {};
          keyval[1].forEach((item) => {
            searchDocument(item.document_id, selectResult, tmpObj);
          });
          patItem.documentList?.push(tmpObj);
        });

        ret.push(patItem);
      }
    }
  } catch {
    return { statusNum: RESULT.ABNORMAL_TERMINATION, body: null };
  } finally {
    await dbAccess.end();
  }

  return { statusNum: RESULT.NORMAL_TERMINATION, body: ret };
};
