--���[�g�X�L�[�}�ɏ��񎡗ÊJ�n����eventdate�����t�^
UPDATE jesgo_document_schema
  SET document_schema =  (
    jsonb_set(
      document_schema::jsonb,
      '{properties, ���񎡗ÊJ�n��, jesgo:set}',
      '"eventdate"',
      TRUE))::json
  WHERE
    schema_id_string ~ '/.+/root'
  AND
    document_schema->'properties'->'���񎡗ÊJ�n��'->'jesgo:set' IS NULL;


--evaluations �� evaluations
UPDATE jesgo_document_schema
  SET
    document_schema = REPLACE(document_schema #>> '{}', '/schema/evaluation/', '/schema/evaluations/')::json,
    schema_id_string = REPLACE(schema_id_string, '/schema/evaluation/', '/schema/evaluations/')
  WHERE document_schema #>> '{}' LIKE '%/schema/evaluation/%';

-- update /schema/OV/staging v1.x ���������p�߁��̈惊���p��
UPDATE jesgo_document_schema 
SET 
document_schema = REPLACE(document_schema::text,'"���������p��"', '"�̈惊���p��"')::json
WHERE
schema_id_string = '/schema/OV/staging' AND
version_major = 1 AND
jsonb_path_exists(document_schema::jsonb, '$.properties.���������p��')

-- /schema/OV/staging v1 �h�L�������g�̏C��
UPDATE jesgo_document SET
document = jsonb_strip_nulls(
  jsonb_set(
    jsonb_set(document, '{"�̈惊���p��"}', document->'���������p��', TRUE),
    '{"���������p��"}',
    'null'
  )
)
WHERE 
document ? '���������p��' AND
schema_primary_id IN (
SELECT schema_primary_id FROM jesgo_document_schema
WHERE
  schema_id_string = '/schema/OV/staging' AND
  version_major = 1
);
