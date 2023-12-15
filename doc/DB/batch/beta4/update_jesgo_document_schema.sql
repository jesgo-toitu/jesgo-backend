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