@echo off
rem ***************************************************************************************
rem JESGO �f�[�^�x�[�X�X�V�o�b�`
rem Ver 1.1.1
rem �e�[�u���X�V
rem �e�[�u���쐬
rem �f�[�^�X�V
rem ***************************************************************************************

echo JESGO�f�[�^�x�[�X���X�V���܂�
call C:\jesgo\scripts\env_db.bat

rem �e�[�u���X�V
if exist C:\jesgo\pgsql\bin\psql.exe (
	C:\jesgo\pgsql\bin\psql.exe -f .\alter_jesgo_plugin.sql -U postgres -d jesgo_db
) else (
	C:\jesgo\postgres\pgsql\bin\psql.exe -f .\alter_jesgo_plugin.sql -U postgres -d jesgo_db
)
IF %errorlevel% neq 0 (

  ECHO %date% %time:~0,8% ���s�Ɏ��s���܂���  ErrorCode=%errorlevel%^
  FileName�u%SQLFILE%�v >> %~DP0\log/psql_log.txt

) ELSE (
  echo �e�[�u���X�V����
)

rem �e�[�u���쐬
if exist C:\jesgo\pgsql\bin\psql.exe (
	C:\jesgo\pgsql\bin\psql.exe -f .\create_jesgo_plugin_group.sql -U postgres -d jesgo_db
) else (
	C:\jesgo\postgres\pgsql\bin\psql.exe -f .\create_jesgo_plugin_group.sql -U postgres -d jesgo_db
)
IF %errorlevel% neq 0 (

  ECHO %date% %time:~0,8% ���s�Ɏ��s���܂���  ErrorCode=%errorlevel%^
  FileName�u%SQLFILE%�v >> %~DP0\log/psql_log.txt

) ELSE (
  echo �e�[�u���쐬����
)

rem �f�[�^�X�V
if exist C:\jesgo\pgsql\bin\psql.exe (
	C:\jesgo\pgsql\bin\psql.exe -f .\insert_jesgo_plugin_group.sql -U postgres -d jesgo_db
) else (
	C:\jesgo\postgres\pgsql\bin\psql.exe -f .\insert_jesgo_plugin_group.sql -U postgres -d jesgo_db
)
IF %errorlevel% neq 0 (

  ECHO %date% %time:~0,8% ���s�Ɏ��s���܂���  ErrorCode=%errorlevel%^
  FileName�u%SQLFILE%�v >> %~DP0\log/psql_log.txt

) ELSE (
  echo �f�[�^�X�V����
)

rem �f�[�^�X�V2
if exist C:\jesgo\pgsql\bin\psql.exe (
	C:\jesgo\pgsql\bin\psql.exe -f .\update_jesgo_plugin.sql -U postgres -d jesgo_db
) else (
	C:\jesgo\postgres\pgsql\bin\psql.exe -f .\update_jesgo_plugin.sql -U postgres -d jesgo_db
)
IF %errorlevel% neq 0 (

  ECHO %date% %time:~0,8% ���s�Ɏ��s���܂���  ErrorCode=%errorlevel%^
  FileName�u%SQLFILE%�v >> %~DP0\log/psql_log.txt

) ELSE (
  echo �f�[�^�X�V2����
)
