@echo off
rem --------------------------------------------------
rem DB接続パラメータ
rem --------------------------------------------------
set PGPATH=C:\"Program Files"\PostgreSQL\14\bin\
set HOSTNAME=localhost
set PORTNUM=5432
set DBNAME=postgres
set USERNAME=postgres
set PGPASSWORD=12345678
rem --------------------------------------------------
rem SQL実行
rem --------------------------------------------------
%PGPATH%psql -h %HOSTNAME% -p %PORTNUM% -d %DBNAME% -U %USERNAME% -f 01_create.sql -o log_01_create.log
%PGPATH%psql -h %HOSTNAME% -p %PORTNUM% -d %DBNAME% -U %USERNAME% -f 02_insert.sql -o log_02_insert.log