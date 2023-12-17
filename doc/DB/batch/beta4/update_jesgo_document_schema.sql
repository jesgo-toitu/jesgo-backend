--ルートスキーマに初回治療開始日にeventdate属性付与
UPDATE jesgo_document_schema
  SET document_schema =  (
    jsonb_set(
      document_schema::jsonb,
      '{properties, 初回治療開始日, jesgo:set}',
      '"eventdate"',
      TRUE))::json
  WHERE
    schema_id_string ~ '/.+/root'
  AND
    document_schema->'properties'->'初回治療開始日'->'jesgo:set' IS NULL;


--evaluations → evaluations
UPDATE jesgo_document_schema
  SET
    document_schema = REPLACE(document_schema #>> '{}', '/schema/evaluation/', '/schema/evaluations/')::json,
    schema_id_string = REPLACE(schema_id_string, '/schema/evaluation/', '/schema/evaluations/')
  WHERE document_schema #>> '{}' LIKE '%/schema/evaluation/%';

-- update /schema/OV/staging v1.x 所属リンパ節→領域リンパ節
UPDATE jesgo_document_schema 
SET 
document_schema = REPLACE(document_schema::text,'"所属リンパ節"', '"領域リンパ節"')::json
WHERE
schema_id_string = '/schema/OV/staging' AND
version_major = 1 AND
jsonb_path_exists(document_schema::jsonb, '$.properties.所属リンパ節')

-- /schema/OV/staging v1 ドキュメントの修正
UPDATE jesgo_document SET
document = jsonb_strip_nulls(
  jsonb_set(
    jsonb_set(document, '{"領域リンパ節"}', document->'所属リンパ節', TRUE),
    '{"所属リンパ節"}',
    'null'
  )
)
WHERE 
document ? '所属リンパ節' AND
schema_primary_id IN (
SELECT schema_primary_id FROM jesgo_document_schema
WHERE
  schema_id_string = '/schema/OV/staging' AND
  version_major = 1
);
