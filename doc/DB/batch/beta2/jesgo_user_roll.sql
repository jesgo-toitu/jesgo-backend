alter table jesgo_user_roll add column if not exists plugin_registerable boolean default false;
alter table jesgo_user_roll add column if not exists plugin_executable_select boolean default false;
alter table jesgo_user_roll add column if not exists plugin_executable_update boolean default false;

--システム管理者
update jesgo_user_roll set
	plugin_registerable = true,
	plugin_executable_select = true,
	plugin_executable_update = true
where roll_id = 0;

--システムオペレーター
update jesgo_user_roll set
	plugin_registerable = false,
	plugin_executable_select = true,
	plugin_executable_update = true
where roll_id = 1;

--上級ユーザ
update jesgo_user_roll set
	plugin_registerable = false,
	plugin_executable_select = true,
	plugin_executable_update = true
where roll_id = 100;


--一般ユーザ
update jesgo_user_roll set
	plugin_registerable = false,
	plugin_executable_select = true,
	plugin_executable_update = false
where roll_id = 101;


--ログ用ユーザ
update jesgo_user_roll set
	plugin_registerable = false,
	plugin_executable_select = false,
	plugin_executable_update = false
where roll_id = 999;

--退職者
update jesgo_user_roll set
	plugin_registerable = false,
	plugin_executable_select = false,
	plugin_executable_update = false
where roll_id = 1000;