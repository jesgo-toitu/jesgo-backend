UPDATE jesgo_document_schema SET subschema_default = subschema, child_schema_default = child_schema;

INSERT INTO jesgo_document_schema (schema_primary_id, schema_id, schema_id_string, title, subtitle, document_schema, 
uniqueness, hidden, subschema, subschema_default, child_schema, child_schema_default, base_version_major, 
valid_from, valid_until, author, version_major, version_minor, plugin_id, inherit_schema, base_schema) 
VALUES (0, 0, NULL, 'JESGOシステム', '', '{}', TRUE, TRUE, '{}', '{}', '{}', '{}', 1, '1970-01-01', NULL, 'system', 1, 0, NULL, '{}', NULL);
UPDATE jesgo_document_schema SET subschema = (SELECT ARRAY_AGG(DISTINCT(schema_id)) FROM view_latest_schema WHERE document_schema->>'jesgo:parentschema' like '%"/"%') WHERE schema_id = 0;
UPDATE jesgo_document_schema SET subschema_default = (SELECT ARRAY_AGG(DISTINCT(schema_id)) FROM view_latest_schema WHERE document_schema->>'jesgo:parentschema' like '%"/"%') WHERE schema_id = 0;