--[gXL[}ษ๑กรJn๚ษeventdateฎซt^
UPDATE jesgo_document_schema
  SET document_schema =  (
    jsonb_set(
      document_schema::jsonb,
      '{properties, ๑กรJn๚, jesgo:set}',
      '"eventdate"',
      TRUE))::json
  WHERE
    schema_id_string ~ '/.+/root'
  AND
    document_schema->'properties'->'๑กรJn๚'->'jesgo:set' IS NULL;


--evaluations จ evaluations
UPDATE jesgo_document_schema
  SET
    document_schema = REPLACE(document_schema #>> '{}', '/schema/evaluation/', '/schema/evaluations/')::json,
    schema_id_string = REPLACE(schema_id_string, '/schema/evaluation/', '/schema/evaluations/')
  WHERE document_schema #>> '{}' LIKE '%/schema/evaluation/%';

-- update /schema/OV/staging v1.x ฎp฿จฬๆp฿
UPDATE jesgo_document_schema 
SET 
document_schema = REPLACE(document_schema::text,'"ฎp฿"', '"ฬๆp฿"')::json
WHERE
schema_id_string = '/schema/OV/staging' AND
version_major = 1 AND
jsonb_path_exists(document_schema::jsonb, '$.properties.ฎp฿')

-- /schema/OV/staging v1 hLgฬCณ
UPDATE jesgo_document SET
document = jsonb_strip_nulls(
  jsonb_set(
    jsonb_set(document, '{"ฬๆp฿"}', document->'ฎp฿', TRUE),
    '{"ฎp฿"}',
    'null'
  )
)
WHERE 
document ? 'ฎp฿' AND
schema_primary_id IN (
SELECT schema_primary_id FROM jesgo_document_schema
WHERE
  schema_id_string = '/schema/OV/staging' AND
  version_major = 1
);
