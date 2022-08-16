CREATE TABLE IF NOT EXISTS jesgo_search_column
(
column_id integer,
column_type text,
column_name text, 
PRIMARY KEY ( column_id, column_type)
);

ALTER TABLE jesgo_document_schema ADD COLUMN subschema_default integer[];
ALTER TABLE jesgo_document_schema ADD COLUMN child_schema_default integer[];
ALTER VIEW view_latest_schema