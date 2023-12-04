-- ƒXƒL[ƒ}‚ÌC³(“¯“™)
UPDATE jesgo_document_schema
SET
  document_schema = (jsonb_set((document_schema::jsonb - 'items'), '{type}', '"object"') ||  '{"properties":{"À{èp":{"type":"array","description": "å‚½‚ép®‚ğÅ‰‚Ìs‚É”z’u‚µ‚Ä‚­‚¾‚³‚¢.","items":{"$ref": "#/$defs/procedure"}}}}')::json
WHERE
  schema_id_string = '/schema/treatment/operation_procedures'
  AND
  (document_schema ->> 'type') = 'array';

UPDATE jesgo_document_schema
SET document_schema = 
jsonb_set(document_schema::jsonb - 'oneOf', '{"type"}', '"object"')
||
jsonb_set('{"properties":{"PerformanceStatus":{"type":"integer","description":"ECOG‚ÌPerformance Status"}}}'::jsonb, '{"properties", "PerformanceStatus", "oneOf"}',
          regexp_replace(
            replace(document_schema::jsonb->>'oneOf', '<BR/>', ''),
            '{(?:"const": (\d)), (?:"title": "([^"]+)")}', '{"const":\1, "title": "\1: \2"}',
            'g'
          )::jsonb
 ) 
 WHERE
  schema_id_string in ('/schema/evaluation/performance_status', '/schema/evaluations/performance_status')
   AND
   (document_schema->>'type') = 'integer';

-- ƒhƒLƒ…ƒƒ“ƒg‚ÌC³
UPDATE jesgo_document
SET document =  jsonb_set('{"À{èp": []}'::jsonb, '{À{èp}', document)
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