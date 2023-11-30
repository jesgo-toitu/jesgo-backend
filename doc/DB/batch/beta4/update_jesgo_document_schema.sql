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