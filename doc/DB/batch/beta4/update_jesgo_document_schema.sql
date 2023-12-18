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

-- update /schema/OV/staging v1.x ���������p�߁��̈惊���p�� cM�̏C��
UPDATE jesgo_document_schema 
SET 
document_schema = 
REPLACE(
  REPLACE(
    REPLACE(document_schema::text,'"���������p��"', '"�̈惊���p��"')::text,
    '"1: �������Ɉ����זE��F�߂����(�����זE�f�ɂ��)�A�����]�ڂȂ�тɕ��o�O����(�l�a�����p�߂╠�o�O�����p�߂��܂�)�ɓ]�ڂ�F�߂����(�摜�����ɂ��)",',
    '"1a: �������Ɉ����זE��F�߂�","1b: �����]�ڂȂ�тɕ��o�O����(�l�a�����p�߂Ȃ�тɕ��o�O�����p�߂��܂�)�ɓ]�ڂ�F�߂����",'
  )::text,
  '"X: ���u�]�ڂ𔻒肷�邽�߂̌������s���Ȃ������Ƃ�"',
  '"X: ���u�]�ڂ𔻒肷�邽�߂̌������s���Ȃ�����"'
)::json
WHERE
schema_id_string = '/schema/OV/staging' AND
version_major = 1 AND
jsonb_path_exists(document_schema::jsonb, '$.properties.���������p��');

-- /schema/OV/staging v1 �h�L�������g�̏C��
UPDATE jesgo_document SET
document = jsonb_set_lax(
  jsonb_set(document, '{"�̈惊���p��"}', document->'���������p��', TRUE),
  '{"���������p��"}',
  NULL,
  FALSE,
  'delete_key'
)
WHERE 
document ? '���������p��' AND
schema_primary_id IN (
SELECT schema_primary_id FROM jesgo_document_schema
WHERE
  schema_id_string = '/schema/OV/staging' AND
  version_major = 1
);
UPDATE jesgo_document SET
document = jsonb_set(document, '{"cTNM", "M"}', '"X: ���u�]�ڂ𔻒肷�邽�߂̌������s���Ȃ�����"')
WHERE
document @@ '$.cTNM.M== "X: ���u�]�ڂ𔻒肷�邽�߂̌������s���Ȃ������Ƃ�"' AND schema_primary_id IN (
SELECT schema_primary_id FROM jesgo_document_schema
WHERE
  schema_id_string = '/schema/OV/staging' AND
  version_major = 1
);

-- /schema/treatment/chemotherapy��v1 > v2 �̏C���ɔ����h�L�������g�C��
UPDATE jesgo_document SET
document = jsonb_set(
  document,
  '{"���Ë敪"}',
  REPLACE(
    REPLACE(
      TRANSLATE((document->'���Ë敪')::text, '+', '�{'),
      '���q�W�I��', '���q�W�I����'
    ),
    '�Ɖu�`�F�b�N�|�C���g�j�Q�܁{���q�W�I����', '���q�W�I���Á{�Ɖu�`�F�b�N�|�C���g�j�Q��'
  )::jsonb,
  FALSE
  )
WHERE
  document ? '���Ë敪'
  AND
  schema_primary_id IN (
    SELECT schema_primary_id FROM jesgo_document_schema
    WHERE schema_id_string = '/schema/treatment/chemotherapy' AND version_major = 1
  );
