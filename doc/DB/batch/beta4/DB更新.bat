@echo off
rem ***************************************************************************************
rem JESGO �f�[�^�x�[�X�X�V�o�b�`
rem Ver 1.0.4
rem �e�[�u���X�V
rem �f�[�^�X�V
rem ***************************************************************************************

echo JESGO�f�[�^�x�[�X���X�V���܂�
call C:\jesgo\scripts\env_db.bat

rem �e�[�u���X�V
call :psqlroutine alter_jesgo_document.sql jesgo_document�e�[�u���X�V����
call :psqlroutine alter_jesgo_plugin.sql �v���O�C���e�[�u���X�V����
call :psqlroutine update_jesgo_document_schema.sql jesgo_document_schema�e�[�u���X�V����
call :psqlroutine fix_not_object_document_schema.sql ��I�u�W�F�N�g�h�L�������g�X�L�[�}�X�V����

call repair_schema.bat

pause

exit /b






rem SQL���s�T�u���[�`��
:psqlroutine
C:\jesgo\pgsql\bin\psql.exe -f .\%1 -U postgres -d jesgo_db
IF %errorlevel% neq 0 (

  ECHO %date% %time:~0,8% ���s�Ɏ��s���܂��� ErrorCode=%errorlevel% FileName�u%1�v >> %~DP0psql_log.txt

) ELSE (
  echo %2
)
exit /b