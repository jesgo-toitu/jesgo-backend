UPDATE public.jesgo_plugin
SET deleted = true
WHERE plugin_name in
(
	'�q�{�򂪂�o�^�m�F (2023-2024)',
	'�q�{�̂���o�^�m�F (2023-2024)',
	'��������o�^�m�F (2023-2024)',
	'�O���X�N���v�g�̎��s',
	'�O���X�N���v�g�̎��s(��)'
);

UPDATE public.jesgo_plugin
SET plugin_name = '�q�{�򂪂�ʃ`�F�b�N(2023-2024)'
WHERE plugin_name = '�q�{�򂪂�ʊm�F (2023-2024)';

UPDATE public.jesgo_plugin
SET plugin_name = '�q�{�̂���ʃ`�F�b�N(2023-2024)'
WHERE plugin_name = '�q�{�̂���ʊm�F (2023-2024)';

UPDATE public.jesgo_plugin
SET plugin_name = '��������ʃ`�F�b�N(2023-2024)'
WHERE plugin_name = '��������ʊm�F (2023-2024)';

UPDATE public.jesgo_plugin
SET plugin_name = '���ҕ����o��(��)'
WHERE plugin_name = '�P�ꊳ�҂�JESGO JSON�h�L�������g�o��';