-- v1��jesgo:required�̒ǉ�
update jesgo_document_schema set document_schema = '{"$schema":"../jesgo.json","$id":"/schema/CC/findings","jesgo:version":"1.1","jesgo:unique":true,"type":"object","title":"�f�f����","properties":{"��ᇍő��ᇌa":{"type":"object","jesgo:ui:subschemastyle":"inline","properties":{"����":{"oneOf":[{"type":"string","enum":["�������I�a��","�`2�p","�`4�p","�`6�p","6�p��������","����s�\"]},{"type":"number","units":"cm"}],"jesgo:required":["JSOG"]},"�f�f���@":{"type":"string","enum":["���G�f�i���f�A�R���|�X�R�[�v�f���܂ށj","�摜�f�f","�a���f�f"],"jesgo:required":["JSOG"]}}},"��x�ѐZ��":{"type":"object","jesgo:ui:subschemastyle":"inline","properties":{"����":{"type":"string","enum":["����","�Ȃ�","�s���E���]��"],"jesgo:required":["JSOG"]},"�f�f���@":{"type":"string","enum":["���G�f�i���f�A�R���|�X�R�[�v�f���܂ށj","�摜�f�f","�a���f�f"],"jesgo:required":["JSOG"]}}},"�T�ǐZ��":{"type":"object","jesgo:ui:subschemastyle":"inline","properties":{"����":{"type":"string","enum":["����","�Ȃ�","�s���E���]��"],"jesgo:required":["JSOG"]},"�f�f���@":{"type":"string","enum":["���G�f�i���f�A�R���|�X�R�[�v�f���܂ށj","�摜�f�f","�a���f�f"],"jesgo:required":["JSOG"]}}},"�N���S���Z��":{"type":"object","jesgo:ui:subschemastyle":"inline","properties":{"����":{"type":"string","enum":["����","�Ȃ�","�s���E���]��"],"jesgo:required":["JSOG"]},"�f�f���@":{"type":"string","enum":["�摜�f�f","�a���f�f","�N����"],"jesgo:required":["JSOG"]}}},"�����S���Z��":{"type":"object","jesgo:ui:subschemastyle":"inline","properties":{"����":{"type":"string","enum":["����","�Ȃ�","�s���E���]��"],"jesgo:required":["JSOG"]},"�f�f���@":{"type":"string","enum":["�摜�f�f","�a���f�f","�������E�咰��"],"jesgo:required":["JSOG"]}}},"���Ճ����p�ߓ]��":{"type":"object","jesgo:ui:subschemastyle":"inline","properties":{"����":{"type":"string","enum":["����","�Ȃ�","�s���E���]��"],"jesgo:required":["JSOG"]},"�f�f���@":{"type":"string","enum":["���f�E�G�f","�摜�f�f�\MRI","�摜�f�f�\CT","�摜�f�f�\PET/CT","�a���f�f","���̑�"],"jesgo:required":["JSOG"]}}},"�T�哮�������p�ߓ]��":{"type":"object","jesgo:ui:subschemastyle":"inline","properties":{"����":{"type":"string","enum":["����","�Ȃ�","�s���E���]��"],"jesgo:required":["JSOG"]},"�f�f���@":{"type":"string","enum":["���f�E�G�f","�摜�f�f�\MRI","�摜�f�f�\CT","�摜�f�f�\PET/CT","�a���f�f"],"jesgo:required":["JSOG"]}}},"���̑��̃����p�ߓ]��":{"type":"object","jesgo:ui:subschemastyle":"inline","properties":{"����":{"type":"string","enum":["����","�Ȃ�","�s���E���]��"],"jesgo:required":["JSOG"]},"�f�f���@":{"type":"string","enum":["���f�E�G�f","�摜�f�f�\MRI","�摜�f�f�\CT","�摜�f�f�\PET/CT","�a���f�f"],"jesgo:required":["JSOG"]}}},"�����p�߈ȊO�̉��u�]��":{"type":"object","jesgo:ui:subschemastyle":"inline","properties":{"����":{"type":"string","enum":["����","�Ȃ�","�s���E���]��"],"jesgo:required":["JSOG"]},"�f�f���@":{"type":"string","enum":["���f�E�G�f","�摜�f�f","�a���f�f"],"jesgo:required":["JSOG"]}}},"�Ĕ����X�N":{"type":"string","enum":["�჊�X�N","�����X�N","�����X�N"]}},"jesgo:childschema":["/schema/evaluations/exam","/schema/evaluations/cervix","/schema/evaluations/colposcopy","/schema/evaluations/hysteroscopy","/schema/evaluations/cystoscopy","/schema/evaluations/colonoscopy","/schema/evaluations/tumor_markers","/schema/evaluations/imaging","/schema/evaluations/ascites","/schema/evaluations/pleural_effusion","/schema/evaluations/immunohistochemistry","/schema/evaluations/oncogenes","/schema/evaluations/performance_status","/schema/evaluations/physical_status"]}'
WHERE schema_id_string = '/schema/CC/findings' and version_major = 1 and version_minor = 1;

update jesgo_document_schema set document_schema = '{"$schema":"../jesgo.json","$id":"/schema/CC/pathology","jesgo:version":"1.1","jesgo:unique":true,"type":"object","title":"�g�D�f�f","description":"WHO����2014�N","properties":{"�g�D�^":{"type":"string","oneOf":[{"title":"��琫��� (�G������)","enum":["�p���^�G������","��p���^�G������","������G������","�ފ��זE��","�R���W���[�}�l��","�n�i���ځj���","�G���ڍs����","�����p����l��","�G�������i���ޕs�\�j"]},{"title":"��琫��� (�B��)","enum":["�ʏ�^���򕔑B��","�S�t����","�݌^�S�t����","���^�S�t����","��זE�^�S�t����","�O�ёB�Ǌ�","�ޓ�����","���זE��","���t����","���t��","�_�o��������𔺂��B��","�B���i���ޕs�\�j"]},{"title":"��琫���(���̑�)","enum":["�B�G������","����K���X�זE��","�B�l���זE��","�B�l�X�E��","��������","�J���`�m�C�h���","���^�I�J���`�m�C�h���","���זE�_�o�������","��זE�_�o�������","���̑�"]},{"title":"�ԗt����ᇂ���ю�ᇗގ��a��","enum":["�ԗt����ᇂ���ю�ᇗގ��a��","����ؓ���","�E��������","���Ǔ���","���������_�o����","���b����","��������Ǔ���","���[�C���O����"]},{"title":"��琫�E�ԗt���������","enum":["�B����","������"]},{"title":"�����m�T�C�g���","enum":["�������F��"]}],"jesgo:required":["JSOG"]},"���̑��g�D�^":{},"�g�D�w�I�ٌ^�x":{"type":"string","enum":["Grade 1","Grade 2","Grade 3","�ٌ^�x�]���̑ΏۂɊ܂܂�Ȃ�","�s��"]}},"if":{"properties":{"�g�D�^":{"const":"���̑�"}}},"then":{"properties":{"���̑��g�D�^":{"type":"string"}}},"jesgo:childschema":["/schema/evaluations/immunohistochemistry","/schema/evaluations/oncogenes","/schema/record/pathlogy_report"]}'
WHERE schema_id_string = '/schema/CC/pathology' and version_major = 1 and version_minor = 1;

update jesgo_document_schema set document_schema = '{"$schema":"../jesgo.json","$id":"/schema/CC/staging","jesgo:version":"1.2","jesgo:unique":true,"type":"object","title":"�a���f�f","$comment":"�q�{�򂪂�̕a���f�f.","description":"FIGO���ނɂ́A�����p�{�s��ł͎�p�ɂ�茈�肵���i�s���A�p�O���Ì�Ɏ�p�{�s�� �� ��p���{�s��ł͎��ÊJ�n�O�Ɍ��肵���i�s������͂��ĉ������B","properties":{"���Î{�s��":{"type":"string","enum":["�����p�{�s��","�p�O���Ì�Ɏ�p�{�s","��p���{�s��","��p�Ö@�A�򕨗Ö@�A���ː��Ö@�����{����"],"jesgo:required":["JSOG"]},"FIGO":{"type":"string","jesgo:ui:listtype":"suggestlist","title":"FIGO����(FIGO2018, ���Y�w2020)","jesgo:tag":"figo","enum":["I��(�����ޕs��)","IA1��","IA2��","IA��(�����ޕs��)","IB1��","IB2��","IB3��","IB��(�����ޕs��)","II��(�����ޕs��)","IIA1��","IIA2��","IIA��(�����ޕs��)","IIB��","III��(�����ޕs��)","IIIA��","IIIB��","IIIC��(�����ޕs��)","IIIC1r��","IIIC1p��","IIIC2r��","IIIC2p��","IV��(�����ޕs��)","IVA��","IVB��"],"jesgo:required":["JSOG"]},"cTNM":{"$ref":"#/$defs/cTNM"}},"allOf":[{"if":{"properties":{"���Î{�s��":{"enum":["�����p�{�s��","�����p�{�s"]}}},"then":{"properties":{"cTNM":{"$ref":"#/$defs/cTNM"},"pTNM":{"$ref":"#/$defs/pTNM"},"ypTNM":{}}}},{"if":{"properties":{"���Î{�s��":{"const":"�p�O���Ì�Ɏ�p�{�s"}}},"then":{"properties":{"cTNM":{"$ref":"#/$defs/cTNM"},"pTNM":{},"ypTNM":{"$ref":"#/$defs/ypTNM"}}}},{"if":{"properties":{"���Î{�s��":{"enum":["��p���{�s��","��p�Ö@�A�򕨗Ö@�A���ː��Ö@�����{����","��p���{�s","��p�Ö@�A���w�Ö@�A���ː��Ö@�����{����","�p�O���Â���ю�p���{�s��","���Î{�s����"]}}},"then":{"properties":{"cTNM":{"$ref":"#/$defs/cTNM"},"pTNM":{},"ypTNM":{}}}}],"$defs":{"cTNM":{"type":"object","title":"cTNM����(���Y�w2020�b���)","description":"cTNM���ނ́A���Â��J�n����O�ɁA���f�E�����f�ɂ��Ǐ������ɉ摜�������������đ����I�ɔ��f���񍐂���B<br>�q�{�򕔉~���؏��p�͗Տ������Ƃ݂Ȃ�,����ɂ��g�D�����̌��ʂ͌����Ƃ���cTNM���ނɓ����B","jesgo:ui:subschemastyle":"row","properties":{"T":{"$ref":"#/$defs/T"},"N":{"$ref":"#/$defs/cN"},"M":{"$ref":"#/$defs/cM"}}},"pTNM":{"type":"object","title":"pTNM����(�����p�����{�����Ǘ�̂�)","jesgo:ui:subschemastyle":"row","properties":{"T":{"$ref":"#/$defs/pT"},"N":{"$ref":"#/$defs/pN"},"M":{"$ref":"#/$defs/pM"}}},"ypTNM":{"type":"object","title":"ypTNM����(�����p�����{�����Ǘ�̂�)","jesgo:ui:subschemastyle":"row","properties":{"T":{"$ref":"#/$defs/pT"},"N":{"$ref":"#/$defs/pN"},"M":{"$ref":"#/$defs/pM"}}},"T":{"$id":"#T","type":"object","title":"T����","jesgo:ui:subschemastyle":"inline","properties":{"T":{"$ref":"#/$defs/classificationT"}},"if":{"properties":{"T":{"pattern":"^T1a.*"}}},"then":{"properties":{"T1a�� �ڍד���":{"type":"string","jesgo:required":["JSOG"],"enum":["��������7mm�ȉ�","��������7mm��������","�s��"]}}}},"pT":{"$id":"#pT","type":"object","title":"T����","jesgo:ui:subschemastyle":"inline","properties":{"T":{"$ref":"#/$defs/classificationT"}},"if":{"properties":{"T":{"pattern":"^T1a.*"}}},"then":{"properties":{"T1a�� �ڍד���":{"type":"string","jesgo:required":["JSOG"],"enum":["��������7mm�ȉ�","��������7mm��������","�s��"]}}}},"classificationT":{"$id":"#classificationT","type":"string","jesgo:required":["JSOG"],"enum":["TX","T0","Tis","T1(�����ޕs��)","T1a1:���ǐN�P�Ȃ�","T1a1:���ǐN�P����","T1a2:���ǐN�P�Ȃ�","T1a2:���ǐN�P����","T1a(�����ޕs��):���ǐN�P�Ȃ�","T1a(�����ޕs��):���ǐN�P����","T1b1","T1b2","T1b3","T1b(�����ޕs��)","T2(�����ޕs��)","T2a1","T2a2","T2a(�����ޕs��)","T2b","T3(�����ޕs��)","T3a","T3b","T4"]},"cN":{"$id":"#cN","title":"N����","type":"object","jesgo:ui:subschemastyle":"inline","properties":{"N":{"type":"string","enum":["�̈惊���p�ߓ]�ڂȂ�","���Ճ����p�߂݂̂ɓ]�ڂ�F�߂�","�T�哮�������p�߂݂̂ɓ]�ڂ�F�߂�","���Ղ���іT�哮�������p�ߓ]�ڂ�F�߂�","�摜�f�f�����Ȃ�����"],"jesgo:required":["JSOG"]}}},"pN":{"$id":"#pN","title":"N����","type":"object","$comment":"��p�]���Ƃ��Ă�N����","properties":{"RP":{"title":"���Ճ����p�߂ɑ΂��鏈�u","type":"string","enum":["���Ճ����p�߂�E�o���Ȃ�����(�a���w�I�����s���Ȃ�����)","���Ճ����p�߂̑I��I�s��(����)���s����","���Ճ����p�߂̌n���I�s�����s����","�Z���`�l�������p�ߐ������s����"],"jesgo:required":["JSOG"]},"RPX":{"title":"���Ճ����p�߂̏���","type":"string","enum":["RP1: ���Ճ����p�߂̕a���w�I�������s���Ȃ��������A���炩�Ȏ���F�߂Ȃ�","RP2: ���Ճ����p�߂̕a���w�I�������s���Ȃ��������A���炩�Ȏ���F�߂�","RP3: ���Ճ����p�߂�E�o���A�a���w�I�ɓ]�ڂ�F�߂Ȃ�","RP4: ���Ճ����p�߂�E�o���A�]�ڂ�F�߂�"],"jesgo:required":["JSOG"]},"RA":{"title":"�T�哮�������p�߂ɑ΂��鏈�u","type":"string","enum":["�T�哮�������p�߂�E�o���Ȃ�����(�a���w�I�����s���Ȃ�����)","�T�哮�������p�߂̑I��I�s��(����)���s����","�T�哮�������p�߂̌n���I�s�����s����","�Z���`�l�������p�ߐ������s����"],"jesgo:required":["JSOG"]},"RAX":{"title":"�T�哮�������p�߂̏���","type":"string","enum":["RA1: �T�哮�������p�߂̕a���w�I�������s���Ȃ��������A���炩�Ȏ���F�߂Ȃ�","RA2: �T�哮�������p�߂̕a���w�I�������s���Ȃ��������A���炩�Ȏ���F�߂�","RA3: �T�哮�������p�߂�E�o���A�a���w�I�ɓ]�ڂ�F�߂Ȃ�","RA4: �T�哮�������p�߂�E�o���A�]�ڂ�F�߂�"],"jesgo:required":["JSOG"]}}},"cM":{"$id":"#cM","title":"M����","type":"object","properties":{"M":{"$ref":"#/$defs/M"},"L":{"type":"array","title":"���u�]�ڕ���","items":{"type":"string","enum":["L1: �c�u�����p��","L2: ������(��)�����p��","L3: �l�a�����p��","L9: ��L�ȊO�̃����p��","M1: �x","M2: �̑�","M3: �����d��","M4: �]","M5: ��","M9: ��L�ȊO�̎�������E�g�D"]}}}},"pM":{"$id":"#pM","title":"M����","type":"object","properties":{"M":{"$ref":"#/$defs/M"}}},"M":{"$id":"#M","type":"string","title":"���u�]�ڂ̕]��","description":"�l�a�����p�ߓ]�ڂ╠�o���a�ρA�q�{�����A�t����ւ̓]�ڂ͉��u�]�ڂɊ܂ށB�T,���՟����ւ̓]�ڂ͉��u�]�ڂ��珜�O����B","enum":["���u�]�ڂȂ�","���u�]�ڂ���","���u�]�ڂ̔���s�\���ȂƂ�"],"jesgo:required":["JSOG"]}}}'
WHERE schema_id_string = '/schema/CC/staging' and version_major = 1 and version_minor = 2;

update jesgo_document_schema set document_schema = '{"$schema":"../jesgo.json","$id":"/schema/EM/findings","jesgo:version":"1.0","jesgo:unique":true,"type":"object","title":"�f�f����","properties":{"�����זE�f":{"type":"string","enum":["�z��","�A��","���{�s","�s��"],"jesgo:required":["JSOG"]},"�ؑw�Z��":{"type":"object","title":"�ؑw�Z���̗L��","description":"�����p���{�s��ł͉摜�f�f�ł̔��菊��","jesgo:ui:subschemastyle":"inline","properties":{"����":{"type":"string","enum":["�Z���Ȃ�","�Z����1/2","�Z����1/2","�s��"],"jesgo:required":["JSOG"]},"�f�f���@":{"type":"string","enum":["�����p�{�s�ɂ��a���w�I�f�f","MRI","CT","PET/CT"],"jesgo:required":["JSOG"]}}}},"jesgo:childschema":["/schema/evaluations/exam","/schema/evaluations/cervix","/schema/evaluations/colposcopy","/schema/evaluations/hysteroscopy","/schema/evaluations/cystoscopy","/schema/evaluations/colonoscopy","/schema/evaluations/tumor_markers","/schema/evaluations/imaging","/schema/evaluations/ascites","/schema/evaluations/pleural_effusion","/schema/evaluations/immunohistochemistry","/schema/evaluations/oncogenes","/schema/evaluations/performance_status","/schema/evaluations/physical_status"]}'
WHERE schema_id_string = '/schema/EM/findings' and version_major = 1 and version_minor = 0;

update jesgo_document_schema set document_schema = '{"$schema":"../jesgo.json","$id":"/schema/EM/findings/details","jesgo:version":"1.0","type":"object","jesgo:unique":true,"title":"�f�f���� �ڍ�","properties":{"�����זE�f":{"type":"string","enum":["�z��","�A��","���{�s","�s��"],"jesgo:required":["JSOG"]},"�ؑw�Z��":{"type":"object","title":"�ؑw�Z���̗L���Əڍ�","description":"�����p���{�s��ł͉摜�f�f�ł̔��菊��","properties":{"����":{"type":"string","enum":["�Z���Ȃ�","�Z����1/2","�Z����1/2","�s��"],"jesgo:required":["JSOG"]},"�f�f���@":{"type":"string","enum":["�����p�{�s�ɂ��a���w�I�f�f","MRI","CT","PET/CT"],"jesgo:required":["JSOG"]},"�ؑw�̌���":{"type":"number","units":"mm"},"��ᇐZ���̐[��":{"type":"number","units":"mm"},"�ڍ�":{"type":"string","jesgo:ui:textarea":true}}},"���ǐN�P":{"type":"object","title":"���ǐN�P�̏ڍ�","jesgo:ui:subschemastyle":"inline","properties":{"�����p�ǐN�P":{"type":"string","jesgo:ui:textarea":true},"�Ö��N�P":{"type":"string","jesgo:ui:textarea":true}}},"�q�{�򕔊Ԏ��Z��":{"title":"�q�{�򕔊Ԏ��Z���̏ڍ�","type":"string","jesgo:ui:textarea":true},"�q�{�T�g�D�Z��":{"title":"�q�{�T�g�D�Z���̏ڍ�","type":"string","jesgo:ui:textarea":true},"�q�{�����Z��":{"title":"�q�{�����Z���̏ڍ�","type":"string","jesgo:ui:textarea":true},"�t����]��":{"title":"�t����]�ڂ̏ڍ�","type":"string","jesgo:ui:textarea":true},"������]��":{"title":"������ւ̓]�ڂ̏ڍ�","type":"string","jesgo:ui:textarea":true},"�����p�ߓ]��":{"title":"�����p�ߓ]�ڂ̏ڍ�","type":"array","items":{"type":"object","jesgo:ui:subschemastyle":"inline","properties":{"����":{"type":"string"},"�E�o�����p�ߐ�":{"type":"integer"},"�]�ڗz�������p�ߐ�":{"type":"integer"}}}},"���u�]��":{"title":"������ւ̓]�ڂ̏ڍ�","type":"string","jesgo:ui:textarea":true},"�Ĕ����X�N":{"type":"string","jesgo:ui:listtype":"combo","oneOf":[{"enum":["�჊�X�N","�����X�N","�����X�N"]},{"pattern":".*"}]}},"jesgo:childschema":["/schema/evaluations/exam","/schema/evaluations/cervix","/schema/evaluations/colposcopy","/schema/evaluations/hysteroscopy","/schema/evaluations/cystoscopy","/schema/evaluations/colonoscopy","/schema/evaluations/tumor_markers","/schema/evaluations/imaging","/schema/evaluations/ascites","/schema/evaluations/pleural_effusion","/schema/evaluations/immunohistochemistry","/schema/evaluations/oncogenes","/schema/evaluations/performance_status","/schema/evaluations/physical_status"]}'
WHERE schema_id_string = '/schema/EM/findings/details' and version_major = 1 and version_minor = 0;

update jesgo_document_schema set document_schema = '{"$schema":"../jesgo.json","$id":"/schema/EM/pathology","jesgo:version":"1.1","jesgo:unique":true,"type":"object","title":"�g�D�f�f","description":"WHO����2014�N","properties":{"�g�D�^":{"type":"string","enum":["�ޓ�����","�G�����ւ̕����𔺂��ޓ�����","�O�ёB�ǌ^�ޓ�����","����^�ޓ�����","�S�t����","���t���q�{����������","���t����","���זE��","�J���`�m�C�h���","���זE�_�o�������","��זE�_�o�������","������","��������","�E������","������","�G������","���̑�","�̎悹��"],"jesgo:required":["JSOG"]},"���̑��g�D�^":{},"�g�D�w�I�ٌ^�x":{"type":"string","enum":["Grade 1","Grade 2","Grade 3","�ٌ^�x�]���̑ΏۂɊ܂܂�Ȃ�","�s��"],"jesgo:required":["JSOG"]}},"jesgo:childschema":["/schema/evaluations/immunohistochemistry","/schema/evaluations/oncogenes","/schema/record/pathlogy_report"],"if":{"properties":{"�g�D�^":{"const":"���̑�"}}},"then":{"properties":{"���̑��g�D�^":{"type":"string"}}}}'
WHERE schema_id_string = '/schema/EM/pathology' and version_major = 1 and version_minor = 1;

update jesgo_document_schema set document_schema = '{"$schema":"../jesgo.json","$id":"/schema/EM/staging","jesgo:version":"1.2","jesgo:unique":true,"type":"object","title":"�a���f�f","$comment":"�q�{�̂���̕a���f�f.","properties":{"���Î{�s��":{"type":"string","$comment":"���̑I���Ői�s���̋L�ڂ����I�ɕύX�����.","enum":["�����p�{�s��","�p�O���Ì�Ɏ�p�{�s","��p���{�s��","��p�Ö@�A�򕨗Ö@�A���ː��Ö@�����{����"],"jesgo:required":["JSOG"]},"FIGO":{"type":"string","jesgo:ui:listtype":"suggestlist","title":"FIGO����(FIGO2008, ���Y�w2011)","description":"�����A�t����Z���̏ꍇ��IIIA���Ƃ��A�����זE�f�z���͐i�s�����ނɂ͗p���Ȃ��B","jesgo:tag":"figo","enum":["I��(�����ޕs��)","IA��","IB��","II��","III��(�����ޕs��)","IIIA��","IIIB��","IIIC��(�����ޕs��)","IIIC1��","IIIC2��","IV��(�����ޕs��)","IVA��","IVB��"],"jesgo:required":["JSOG"]}},"allOf":[{"if":{"properties":{"���Î{�s��":{"enum":["�����p�{�s��"]}}},"then":{"properties":{"cTNM":{},"pTNM":{"$ref":"#/$defs/pTNM","$comment":"�X�e�[�W���O��p�����{���ꂽ���̂�pTNM���ނ�TNM���L�ڂ���."},"ypTNM":{}}}},{"if":{"properties":{"���Î{�s��":{"enum":["�p�O���Ì�Ɏ�p�{�s"]}}},"then":{"properties":{"cTNM":{"$ref":"#/$defs/cTNM","$comment":"�X�e�[�W���O��p�����{���Ă��Ȃ����̂�cTNM���ނƂ���TNM���L�ڂ���."},"pTNM":{},"ypTNM":{"$ref":"#/$defs/ypTNM","$comment":"�p�O���Ì�̎�p�ɂ��X�e�[�W���O��ypTNM���ނ��L�ڂ���."}}}},{"if":{"properties":{"���Î{�s��":{"enum":["��p���{�s��","��p�Ö@�A�򕨗Ö@�A���ː��Ö@�����{����"]}}},"then":{"properties":{"cTNM":{"$ref":"#/$defs/cTNM","$comment":"�X�e�[�W���O��p�����{���Ă��Ȃ����̂�cTNM���ނƂ���TNM���L�ڂ���."},"pTNM":{},"ypTNM":{}}}}],"$defs":{"cTNM":{"$id":"#cTNM","type":"object","title":"cTNM����","jesgo:ui:subschemastyle":"row","properties":{"T":{"$ref":"#/$defs/T"},"N":{"$ref":"#/$defs/N"},"M":{"$ref":"#/$defs/M"}}},"pTNM":{"$id":"#pTNM","type":"object","title":"pTNM����","jesgo:ui:subschemastyle":"row","properties":{"T":{"$ref":"#/$defs/pT"},"N":{"$ref":"#/$defs/pN"},"M":{"$ref":"#/$defs/M"}}},"ypTNM":{"$id":"#pTNM","type":"object","title":"ypTNM����","jesgo:ui:subschemastyle":"row","properties":{"T":{"$ref":"#/$defs/T"},"N":{"$ref":"#/$defs/pN"},"M":{"$ref":"#/$defs/M"}}},"T":{"$id":"#T","title":"T����","type":"object","properties":{"T":{"$ref":"#/$defs/classificationT"}}},"pT":{"$id":"#pT","title":"T����","type":"object","properties":{"T":{"$ref":"#/$defs/classificationT"}}},"classificationT":{"$id":"#classificationT","type":"string","jesgo:required":["JSOG"],"enum":["TX: �g�D�w�I�Ɏq�{�̊��Ɛf�f�������A���̐i�s�x�̔��肪���炩�̏�Q�ŕs�\�Ȃ��́B","T0: �Տ��������q�{�̊��Ɛf�f�������A���������g�D�w�I�Ȋ��̐f�f���ł��Ȃ�����(�g�D�w�I�����������Ɏ��Â��n�߂����̂��܂�)�B","T1(�����ޕs��)","T1a","T1b","T2","T3(�����ޕs��)","T3a","T3b","T4"]},"N":{"$id":"#N","title":"N����","type":"object","$comment":"���ÑO�]���Ƃ��Ă�N����","properties":{"�摜�f�f�̌v����i":{"type":"string","jesgo:required":["JSOG"],"enum":["MRI","CT","PET/CT","�{�s����"],"description":"�����p�ߓ]�ڂ̐f�f�͒Z�a10mm�ȏ�������Ď��Ƃ���"},"NP":{"type":"string","title":"���Ճ����p�߂̏���","enum":["NPX: �����p�ߓ]�ڂ𔻒肷�邽�߂̉摜�f�f���s���Ȃ������Ƃ�","NP0: ���Ճ����p�߂ɓ]�ڂ�F�߂Ȃ�","NP1: ���Ճ����p�߂ɓ]�ڂ�F�߂�"],"jesgo:required":["JSOG"]},"NA":{"type":"string","title":"�T�哮�������p�߂̏���","enum":["NAX: �����p�ߓ]�ڂ𔻒肷�邽�߂̉摜�f�f���s���Ȃ������Ƃ�","NA0: �T�哮�������p�߂ɓ]�ڂ�F�߂Ȃ�","NA1: �T�哮�������p�߂ɓ]�ڂ�F�߂�"],"jesgo:required":["JSOG"]}}},"pN":{"$id":"#pN","title":"N����","type":"object","$comment":"��p�]���Ƃ��Ă�N����","properties":{"RP":{"title":"���Ճ����p�߂ɑ΂��鏈�u","type":"string","enum":["���Ճ����p�߂�E�o���Ȃ�����(�a���w�I�����s���Ȃ�����)","���Ճ����p�߂̑I��I�s��(����)���s����","���Ճ����p�߂̌n���I�s�����s����","�Z���`�l�������p�ߐ������s����"],"jesgo:required":["JSOG"]},"RPX":{"title":"���Ճ����p�߂̏���","type":"string","enum":["RP1: ���Ճ����p�߂̕a���w�I�������s���Ȃ��������A���炩�Ȏ���F�߂Ȃ�","RP2: ���Ճ����p�߂̕a���w�I�������s���Ȃ��������A���炩�Ȏ���F�߂�","RP3: ���Ճ����p�߂�E�o���A�a���w�I�ɓ]�ڂ�F�߂Ȃ�","RP4: ���Ճ����p�߂�E�o���A�]�ڂ�F�߂�"],"jesgo:required":["JSOG"]},"RA":{"title":"�T�哮�������p�߂ɑ΂��鏈�u","type":"string","enum":["�T�哮�������p�߂�E�o���Ȃ�����(�a���w�I�����s���Ȃ�����)","�T�哮�������p�߂̑I��I�s��(����)���s����","�T�哮�������p�߂̌n���I�s�����s����","�Z���`�l�������p�ߐ������s����"],"jesgo:required":["JSOG"]},"RAX":{"title":"�T�哮�������p�߂̏���","type":"string","enum":["RA1: �T�哮�������p�߂̕a���w�I�������s���Ȃ��������A���炩�Ȏ���F�߂Ȃ�","RA2: �T�哮�������p�߂̕a���w�I�������s���Ȃ��������A���炩�Ȏ���F�߂�","RA3: �T�哮�������p�߂�E�o���A�a���w�I�ɓ]�ڂ�F�߂Ȃ�","RA4: �T�哮�������p�߂�E�o���A�]�ڂ�F�߂�"],"jesgo:required":["JSOG"]}}},"M":{"$id":"#M","title":"M����","type":"object","properties":{"M":{"type":"string","enum":["M0: ���u�]�ڂȂ�","M1: ���̑��̉��u�]�ڂ̑���","M9: ���u�]�ڂ̔���s�\���ȂƂ�"],"jesgo:required":["JSOG"]}}}}}'
WHERE schema_id_string = '/schema/EM/staging' and version_major = 1 and version_minor = 2;

update jesgo_document_schema set document_schema = '{"$schema":"../jesgo.json","$id":"/schema/OV/findings","jesgo:version":"1.1","type":"object","title":"�f�f����","jesgo:unique":true,"properties":{"���t�����Ǐ������iSTIC�j":{"description":"���t�����Ǐ������iSTIC�j�̗L���B<br>SEE-FIM�v���g�R�[���Ȃ����́A����ɏ������������s��Ȃ������ꍇ�ɁA�u���������v��I������B","type":"string","enum":["�Ȃ�","����","��������"],"jesgo:required":["JSOG"]},"�����זE�f":{"type":"string","enum":["�z��","�A��","���{�s","�s��"]},"�疌�j�]�̗L��":{"type":"string","enum":["�Ȃ�","����","�s��"]}},"jesgo:childschema":["/schema/evaluations/exam","/schema/evaluations/cervix","/schema/evaluations/colposcopy","/schema/evaluations/hysteroscopy","/schema/evaluations/cystoscopy","/schema/evaluations/colonoscopy","/schema/evaluations/tumor_markers","/schema/evaluations/imaging","/schema/evaluations/ascites","/schema/evaluations/pleural_effusion","/schema/evaluations/immunohistochemistry","/schema/evaluations/oncogenes","/schema/evaluations/performance_status","/schema/evaluations/physical_status","/schema/OV/interperitoneal_detail"]}'
WHERE schema_id_string = '/schema/OV/findings' and version_major = 1 and version_minor = 1;

update jesgo_document_schema set document_schema = '{"$schema":"../jesgo.json","$id":"/schema/OV/pathology","jesgo:version":"1.1","type":"object","title":"�g�D�f�f","description":"WHO����2014�N","jesgo:parentschema":["/schema/OV/root"],"jesgo:unique":true,"properties":{"�g�D�^":{"type":"string","oneOf":[{"title":"��琫���","enum":["���t�����E�������","���t�����Ǐ�����","����������p�^�[���𔺂����t�����E�������/��Z������ٌ^�x���t����","��ٌ^�x���t����","���ٌ^�x���t����","�S�t�����E�������","�S�t����","�ޓ������E�������","�ޓ�����","���זE���E�������","���זE��","���E�����u�����i�[���","�����u�����i�[���","���t�S�t�����E�������","���t�S�t����","��������","�����^��琫���"]},{"title":"�ԗt�n���","enum":["��ٌ^�x�ޓ����Ԏ�����","���ٌ^�x�ޓ����Ԏ�����"]},{"title":"�����^��琫�ԗt�n���","enum":["�B����","������"]},{"title":"�����Ԏ������","enum":["�x�זE�����ێ�","���ۓ���","�����X�e���C�h�זE���","���l�^�������זE��","��N�^�������זE��","�Z���g���זE��","�֏�׊ǂ𔺂��������"]},{"title":"�����^�����Ԏ������","enum":["�������^�Z���g���E���C�f�B�b�q�זE��","�ᕪ���^�Z���g���E���C�f�B�b�q�זE��","�ᕪ���^�Z���g���E���C�f�B�b�q�זE��(�ُ���������L����)","�ԏ�^�Z���g���E���C�f�B�b�q�זE��"]},{"title":"��זE���","enum":["��������זE��/�f�B�X�W���[�~�m�[�}","�����X���","�ى萫��","��D�P���O�ъ�","���n��`��G1","���n��`��G2","���n��`��G3","���n��`��O���[�h�s��","�����^��זE�����","�����^��זE����ᇁF�����X��� + ��������זE��","�����^��זE����ᇁF�����X��� + ���n��`��"]},{"title":"�P��t����`���є�l�X��ɔ����̍זE�^���","enum":["���������b��B��","�G������","�J���`�m�C�h���","�b��B��J���`�m�C�h","�S�t���J���`�m�C�h","���B��"]},{"title":"��זE�E�����Ԏ������","enum":["���B���","���ޕs�\�ȍ����^��זE�E�����Ԏ������"]},{"title":"���̑��̎��","enum":["�����ԑB��","�E�H���t�����","���זE���i���J���V�E�����ǌ^�j","���זE���i�x�^�j","�E�B�����X���","�T�_�o�ߎ�","�[�����U��������"]},{"title":"������","enum":["�����"]},{"title":"�����p���E���������","enum":["���������p��","�`���זE��"]},{"title":"�����؎�ᇁi������ᇁj","enum":["�d�퐫���������؎��"]},{"title":"�N���s���̎��","enum":["���ی`�������^�~�`�זE���"]},{"title":"���̑��̌������","enum":["�Ǘ������ې����","�����Ǘ������ې����","���Ր��ێ�ǁi�f�X���C�h��ᇁj","���ǐ��ؐ��ۉ�זE���","�����ǊO�Ԏ����","���̑�"]},{"title":"�f�f�ۗ���","enum":["�g�D�^�f�f�ۗ���"]}],"jesgo:required":["JSOG"]},"���̑��g�D�^":{}},"jesgo:childschema":["/schema/evaluations/immunohistochemistry","/schema/evaluations/oncogenes","/schema/record/pathlogy_report"],"if":{"properties":{"�g�D�^":{"const":"���̑�"}}},"then":{"properties":{"���̑��g�D�^":{"type":"string"}}}}'
WHERE schema_id_string = '/schema/OV/pathology' and version_major = 1 and version_minor = 1;

update jesgo_document_schema set document_schema = '{"$schema":"../jesgo.json","$id":"/schema/OV/root","jesgo:version":"1.2","type":"object","title":"���ґ䒠 ��������","$comment":"���҃��R�[�h�̍ŏ�ʂɈʒu�����{���.","jesgo:unique":true,"jesgo:parentschema":["/"],"required":["�����"],"properties":{"�����":{"type":"string","default":"��������","readOnly":true,"jesgo:tag":"cancer_major"},"�f�f":{"type":"string","enum":["�������A�������E�������","���Ǌ��A���ǋ��E�������","������","�����E���ǁE�����i���ޕs�\�j"],"jesgo:required":["JSOG"]},"���񎡗ÊJ�n��":{"type":"string","format":"date","jesgo:set":"eventdate","jesgo:inheriteventdate":"inherit","jesgo:get":"initial_treatment","jesgo:tag":"initial_treatment_date","jesgo:required":["JSOG"]},"�f�f��":{"type":"string","format":"date","jesgo:tag":"diagnosis_date"},"��ᇓo�^�Ώ�":{"title":"�w�l�Ȏ�ᇓo�^�ΏۏǗ�","description":"*** �ȉ��̏Ǘ�͏��O����܂�. ***<br>- �f�f�̂ݍs���A���Â��s��Ȃ������ꍇ<br>- �����J���̂ݍs���A����Ȍ�ɉ��玡�Â��s���Ă��Ȃ��ꍇ<br>- �f�f���ŏI�I�ɍזE�f�݂̂ɂ���ĉ����ꂽ�ꍇ<br>- ��s���Â����{�݂̏ꍇ<br>","type":"string","jesgo:tag":"registrability","enum":["������","�͂�"],"jesgo:required":["JSOG"]}},"if":{"properties":{"��ᇓo�^�Ώ�":{"const":"�͂�"}}},"then":{"properties":{"��ᇓo�^�ԍ�":{"jesgo:required":["JSOG"],"type":"string","pattern":"^OV20[0-9]{2}-[1-9][0-9]*$","jesgo:tag":"registration_number"},"�\�㒲��":{"type":"object","description":"�\�㒲���̓o�^���̓��͂������Ē����o�^���{�Ƃ��܂�.","jesgo:ui:subschemastyle":"inline","properties":{"3�N":{"type":"string","format":"date","jesgo:tag":"three_year_prognosis"},"5�N":{"type":"string","format":"date","jesgo:tag":"five_year_prognosis"}}}}},"jesgo:ui:subschemastyle":"tab","jesgo:subschema":["/schema/OV/staging","/schema/OV/findings","/schema/OV/pathology","/schema/treatment/initial_treatment"]}'
WHERE schema_id_string = '/schema/OV/root' and version_major = 1 and version_minor = 2;

update jesgo_document_schema set document_schema = '{"$schema":"../jesgo.json","$id":"/schema/OV/staging","jesgo:version":"1.2","type":"object","title":"�a���f�f","$comment":"��������̕a���f�f.","jesgo:parentschema":["/schema/OV/root"],"jesgo:unique":true,"properties":{"���Î{�s��":{"type":"string","$comment":"���̑I���ɂ��i�s���̋L�ڂ����I�ɕύX�����.","enum":["�����p�{�s��","�p�O���Ì�Ɏ�p�{�s","��p���{�s��","��p�Ö@�A�򕨗Ö@�A���ː��Ö@�����{����"],"jesgo:required":["JSOG"]},"FIGO":{"type":"string","jesgo:ui:listtype":"suggestlist","title":"FIGO����","description":"�����p�Ǘ�ȊO�̏ꍇ�ɂ́A��ᇓo�^�ւ̏o�͎��ɂ�FIGO���ނ́uXX : �p�O���Î{�s��E��p���{�s��v�Ɏ����ŕϊ�����o�͂���܂��B","jesgo:tag":"figo","$comment":"���Î{�s�󋵂� ��p�{�s�� �ȊO�̏ꍇ��XX�ŃG�N�X�|�[�g����","enum":["IA��","IB��","IC��","IIA��","IIB��","IIIA1��","IIIA2��","IIIB��","IIIC��","IVA��","IVB��","�s��"],"jesgo:required":["JSOG"]},"IC���̏ꍇ":{},"IIIA1���̏ꍇ":{},"�̈惊���p��":{"type":"string","title":"�̈惊���p��","enum":["���Ȃ�","�G�f�������͉摜�f�f�ɂĖ��炩�ɓ]�ڂ��^�������p�ߎ�傠��","�זE�f�ɂă����p�ߓ]�ڂƐf�f","�g�D�f�i�s��or�����j�ɂă����p�ߓ]�ڂƐf�f"],"jesgo:required":["JSOG"]},"cTNM":{},"pTNM":{},"ypTNM":{}},"allOf":[{"if":{"properties":{"���Î{�s��":{"enum":["�����p�{�s��"]}}},"then":{"properties":{"cTNM":{},"pTNM":{"$ref":"#/$defs/pTNM"},"ypTNM":{}}}},{"if":{"properties":{"���Î{�s��":{"enum":["�p�O���Ì�Ɏ�p�{�s"]}}},"then":{"properties":{"cTNM":{"$ref":"#/$defs/cTNM"},"pTNM":{},"ypTNM":{"$ref":"#/$defs/ypTNM"}}}},{"if":{"properties":{"���Î{�s��":{"enum":["��p���{�s��","��p�Ö@�A�򕨗Ö@�A���ː��Ö@�����{����"]}}},"then":{"properties":{"cTNM":{"$ref":"#/$defs/cTNM"},"pTNM":{},"ypTNM":{}}}},{"if":{"properties":{"FIGO":{"const":"IC��"}}},"then":{"properties":{"IC���̏ꍇ":{"type":"string","enum":["1C1: ��p����ɂ��햌�j�]","1C2: ���R�햌�j�]���邢�͔햌�\�ʂւ̐Z��","1C3: �����܂��͕��o���זE�f�Ɉ����זE���F�߂������"],"jesgo:required":["JSOG"]}}}},{"if":{"properties":{"FIGO":{"const":"IIIA1��"}}},"then":{"properties":{"IIIA1���̏ꍇ":{"type":"string","enum":["3A11: �]�ڑ��ő�a10mm�ȉ�","3A12: �]�ڑ��ő�a10mm��������","3A1X: �]�ڑ��ő�a�ɂ�镪�ޕs�\"],"jesgo:required":["JSOG"]}}}}],"$defs":{"cTNM":{"$id":"#cTNM","type":"object","title":"cTNM����","properties":{"T":{"$ref":"#/$defs/T"},"N":{"$ref":"#/$defs/cN"},"M":{"$ref":"#/$defs/cM"}},"if":{"properties":{"M":{"pattern":"^1"}}},"then":{"properties":{"���u�]�ڕ���":{"$ref":"#/$defs/locations"}}}},"pTNM":{"type":"object","title":"pTNM����","properties":{"T":{"$ref":"#/$defs/T"},"N":{"$ref":"#/$defs/N"},"M":{"$ref":"#/$defs/M"},"���u�]�ڕ���":{}},"if":{"properties":{"M":{"pattern":"^1"}}},"then":{"properties":{"���u�]�ڕ���":{"$ref":"#/$defs/locations"}}}},"ypTNM":{"$id":"#ypTNM","type":"object","title":"ypTNM����","properties":{"T":{"$ref":"#/$defs/T"},"N":{"$ref":"#/$defs/N"},"M":{"$ref":"#/$defs/M"},"���u�]�ڕ���":{}}},"T":{"$id":"#T","title":"T����","type":"string","enum":["1a","1b","1c1","1c2","1c3","2a","2b","3a","3b","3c","�s��"],"jesgo:required":["JSOG"]},"N":{"$id":"#N","title":"N����","description":"pN�̌���͍זE�f�܂��͑g�D�f�ɂ��B�G�f��摜�f�f��A����F�߂������ł�pN1�Ƃ͂��Ȃ��B","type":"string","enum":["0: ���������p�߂ɓ]�ڂ�F�߂Ȃ�","1a: ���������p�߂ɓ]�ڂ�F�߂�(�]�ڑ��ő�a10mm�ȉ��A�g�D�����ɂ��)","1b: ���������p�߂ɓ]�ڂ�F�߂�(�]�ڑ��ő�a10mm���A�g�D�����ɂ��)","1: ���������p�߂ɓ]�ڂ�F�߂�(�]�ڑ��ő�a�s��)","X: ���������p�߂ɓ]�ڂ𔻒肷�邽�߂̕a���w�I�������s���Ȃ�����"],"jesgo:required":["JSOG"]},"cN":{"$id":"#cN","title":"N����","type":"string","enum":["0: ���������p�߂ɓ]�ڂ�F�߂Ȃ�","1: ���������p�߂ɓ]�ڂ�F�߂�i�摜�����Ȃǂɂ��j","X: ���������p�߂ɓ]�ڂ𔻒肷�邽�߂̕a���w�I�������s���Ȃ�����"],"jesgo:required":["JSOG"]},"M":{"$id":"#M","type":"string","title":"M����","enum":["0: ���u�]�ڂ�F�߂Ȃ�","1a: �������Ɉ����זE��F�߂�","1b: �����]�ڂȂ�тɕ��o�O����(�l�a�����p�߂Ȃ�тɕ��o�O�����p�߂��܂�)�ɓ]�ڂ�F�߂����","X: ���u�]�ڂ𔻒肷�邽�߂̌������s���Ȃ�����"],"jesgo:required":["JSOG"]},"locations":{"$id":"#locations","type":"array","title":"���u�]�ڂ̕���","items":{"type":"string","oneOf":[{"const":"PUL","title":"�x�]��"},{"const":"PLE","title":"�����]��"},{"const":"LYM","title":"�����p�ߓ]��"},{"const":"HEP","title":"�̓]��"},{"const":"BRA","title":"�]�]��"},{"const":"OSS","title":"���]��"},{"const":"SKI","title":"�畆�]��"},{"const":"MAR","title":"�����]��"},{"const":"OTH","title":"���̑�"}]}},"cM":{"$id":"#cM","type":"string","title":"M����","jesgo:required":["JSOG"],"enum":["0: ���u�]�ڂ�F�߂Ȃ�","1a: �������Ɉ����זE��F�߂�","1b: �����]�ڂȂ�тɕ��o�O����(�l�a�����p�߂Ȃ�тɕ��o�O�����p�߂��܂�)�ɓ]�ڂ�F�߂����","X: ���u�]�ڂ𔻒肷�邽�߂̌������s���Ȃ�����"]}}}'
WHERE schema_id_string = '/schema/OV/staging' and version_major = 1 and version_minor = 2;