@echo off
rem ***************************************************************************************
rem JESGO �f�[�^�x�[�X�X�V�o�b�`
rem Ver 1.0.2
rem �e�[�u���X�V
rem �f�[�^�X�V
rem ***************************************************************************************

echo JESGO�f�[�^�x�[�X���X�V���܂�
call C:\jesgo\scripts\env_db.bat

rem �e�[�u���X�V
call :psqlroutine jesgo_plugin.sql jesgo_plugin�e�[�u���쐬����
call :psqlroutine jesgo_user_roll.sql jesgo_user_roll�e�[�u���X�V����
call :psqlroutine jesgo_schema_patch.sql jesgo_document_schema�e�[�u���X�V����
pause
exit






rem SQL���s�T�u���[�`��
:psqlroutine
C:\jesgo\pgsql\bin\psql.exe -f .\%1 -U postgres -d jesgo_db
IF %errorlevel% neq 0 (

  ECHO %date% %time:~0,8% ���s�Ɏ��s���܂��� ErrorCode=%errorlevel% FileName�u%1�v >> %~DP0psql_log.txt

) ELSE (
  echo %2
)
exit /b