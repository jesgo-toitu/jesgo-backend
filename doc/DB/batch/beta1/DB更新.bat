@echo off
rem ***************************************************************************************
rem JESGO �f�[�^�x�[�X�X�V�o�b�`
rem Ver 1.0.1
rem �e�[�u���X�V
rem �f�[�^�X�V
rem ***************************************************************************************

echo JESGO�f�[�^�x�[�X���X�V���܂�
call C:\jesgo\scripts\env_db.bat

rem �e�[�u���X�V
if exist C:\jesgo\pgsql\bin\psql.exe (
	C:\jesgo\pgsql\bin\psql.exe -f .\01_alter.sql -U postgres -d jesgo_db
) else (
	C:\jesgo\postgres\pgsql\bin\psql.exe -f .\01_alter.sql -U postgres -d jesgo_db
)
IF %errorlevel% neq 0 (

  ECHO %date% %time:~0,8% ���s�Ɏ��s���܂���  ErrorCode=%errorlevel%^
  FileName�u%SQLFILE%�v >> %~DP0\log/psql_log.txt

) ELSE (
  echo �e�[�u���X�V����
)

rem �f�[�^�X�V
if exist C:\jesgo\pgsql\bin\psql.exe (
	C:\jesgo\pgsql\bin\psql.exe -f .\02_update.sql -U postgres -d jesgo_db
) else (
	C:\jesgo\postgres\pgsql\bin\psql.exe -f .\02_update.sql -U postgres -d jesgo_db
)
IF %errorlevel% neq 0 (

  ECHO %date% %time:~0,8% ���s�Ɏ��s���܂���  ErrorCode=%errorlevel%^
  FileName�u%SQLFILE%�v >> %~DP0\log/psql_log.txt

) ELSE (
  echo �f�[�^�X�V����
)
