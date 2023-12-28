-- �X�L�[�}�̏C��(����)
-- ���{��p�X�L�[�}�̍X�V
UPDATE jesgo_document_schema
SET
  document_schema = (jsonb_set((document_schema::jsonb - 'items'), '{type}', '"object"') ||  '{"properties":{"���{��p":{"type":"array","description": "�傽��p�����ŏ��̍s�ɔz�u���Ă�������.","items":{"$ref": "#/$defs/procedure"}}}}')::json
WHERE
  schema_id_string = '/schema/treatment/operation_procedures'
  AND
  (document_schema ->> 'type') = 'array';

-- PerformanceStatus�X�L�[�}�̍X�V(oneOf)
UPDATE jesgo_document_schema
SET document_schema = 
jsonb_set(document_schema::jsonb - 'oneOf', '{"type"}', '"object"')
||
jsonb_set('{"properties":{"PerformanceStatus":{"type":"integer","description":"ECOG��Performance Status"}}}'::jsonb, '{"properties", "PerformanceStatus", "oneOf"}',
          regexp_replace(
            replace(document_schema::jsonb->>'oneOf', '<BR/>', ''),
            '{(?:"const": (\d)), (?:"title": "([^"]+)")}', '{"const":\1, "title": "\1: \2"}',
            'g'
          )::jsonb
 ) 
 WHERE
  schema_id_string in ('/schema/evaluation/performance_status', '/schema/evaluations/performance_status')
   AND
   (document_schema->>'type') = 'integer'
   AND
   (document_schema->>'oneOf') IS NOT NULL;

-- PerformanceStatus�X�L�[�}�̍X�V(anyOf)
UPDATE jesgo_document_schema
SET document_schema = 
jsonb_set(document_schema::jsonb - 'anyOf', '{"type"}', '"object"')
||
jsonb_set('{"properties":{"PerformanceStatus":{"type":"integer","description":"ECOG��Performance Status"}}}'::jsonb, '{"properties", "PerformanceStatus", "anyOf"}',
          regexp_replace(
            replace(document_schema::jsonb->>'anyOf', '<BR/>', ''),
            '{(?:"const": (\d)), (?:"title": "([^"]+)")}', '{"const":\1, "title": "\1: \2"}',
            'g'
          )::jsonb
 ) 
 WHERE
  schema_id_string in ('/schema/evaluation/performance_status', '/schema/evaluations/performance_status')
   AND
   (document_schema->>'type') = 'integer'
   AND
   (document_schema->>'anyOf') IS NOT NULL;

-- �h�L�������g�̏C��
UPDATE jesgo_document
SET document =  jsonb_set('{"���{��p": []}'::jsonb, '{���{��p}', document)
WHERE
  schema_id IN (SELECT schema_id FROM jesgo_document_schema WHERE schema_id_string = '/schema/treatment/operation_procedures')
  AND
  jsonb_typeof(document) = 'array';

UPDATE jesgo_document
SET document =  jsonb_set('{}', '{"PerformanceStatus"}', document)
WHERE
  schema_id in (SELECT schema_id FROM jesgo_document_schema WHERE schema_id_string in ('/schema/evaluation/performance_status', '/schema/evaluations/performance_status'))
AND
  jsonb_typeof(document) = 'number';