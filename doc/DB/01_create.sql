CREATE DATABASE jesgo_db 
    ENCODING 'UTF-8';

\c jesgo_db;

CREATE TABLE IF NOT EXISTS jesgo_sex_master
(
sex_identifier varchar(1) PRIMARY KEY,
sex text NOT NULL
);

CREATE TABLE IF NOT EXISTS jesgo_user_roll
(
roll_id integer PRIMARY KEY,
title text NOT NULL,
login boolean,
view boolean,
add boolean,
edit boolean,
remove boolean,
data_manage boolean,
system_manage boolean
);

CREATE TABLE IF NOT EXISTS jesgo_user
(
user_id serial PRIMARY KEY,
name text UNIQUE NOT NULL,
display_name text,
password_hash text,
roll_id integer NOT NULL,
FOREIGN KEY(roll_id) REFERENCES jesgo_user_roll(roll_id)
);

CREATE TABLE IF NOT EXISTS jesgo_case
(
case_id serial PRIMARY KEY,
name text,
date_of_birth date NOT NULL,
date_of_death date ,
sex varchar(1) DEFAULT 'F',
HIS_id text UNIQUE NOT NULL,
decline boolean DEFAULT FALSE,
registrant integer,
last_updated timestamptz NOT NULL,
FOREIGN KEY(sex) REFERENCES jesgo_sex_master(sex_identifier),
FOREIGN KEY(registrant) REFERENCES jesgo_user(user_id)
);

CREATE TABLE IF NOT EXISTS jesgo_document_schema
(
schema_id integer,
schema_id_string text,
title text,
subtitle text,
document_schema JSON NOT NULL,
uniqueness boolean DEFAULT FALSE,
hidden boolean,
subschema integer[],
child_schema integer[],
base_version_major integer,
valid_from date DEFAULT '1970-01-01',
valid_until date,
author text NOT NULL,
version_major integer NOT NULL,
version_minor integer NOT NULL,
plugin_id integer,
PRIMARY KEY(schema_id, valid_from)
-- TODO★設定テーブル未作成
-- FOREIGN KEY(plugin_id) REFERENCES jesgo_setting(plugin_id)
);

CREATE TABLE IF NOT EXISTS jesgo_document
(
document_id serial PRIMARY KEY,
case_id integer NOT NULL,
event_date date,
document JSONB NOT NULL,
child_documents integer[],
schema_id integer NOT NULL,
schema_major_version integer,
registrant integer,
last_updated timestamptz NOT NULL,
readonly boolean DEFAULT FALSE,
deleted boolean DEFAULT FALSE,
root_order integer NOT NULL DEFAULT -1,
FOREIGN KEY(case_id) REFERENCES jesgo_case(case_id),
-- 配列の中は外部キー制約がきかない
-- FOREIGN KEY(child_documents) REFERENCES jesgo_document(document_id),
-- 複合主キー扱いなので外部キー制約がきかない
-- FOREIGN KEY(schema_id) REFERENCES jesgo_document_schema(schema_id),
FOREIGN KEY(registrant) REFERENCES jesgo_user(user_id)
);

CREATE TABLE IF NOT EXISTS jesgo_document_icon
(
title text PRIMARY KEY,
icon text
);

CREATE TABLE IF NOT EXISTS jesgo_log
(
log_id serial PRIMARY KEY,
user_id integer,
body text,
created timestamptz NOT NULL,
FOREIGN KEY(user_id) REFERENCES jesgo_user(user_id)
);