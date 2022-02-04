# 腫瘍サマリ(jesgo_db)
## DB仕様
### 使用アプリケーション
PostgreSQL 14.1(Windows)
### 文字コード
UTF-8

## 症例 (jesgo_case)
### テーブル定義
| 列名 | 型 | 属性 | デフォルト | 解説 |
|---|---|---|---|---|
| case_id | serial | PK |  | 内部で使用する患者ID |
| name | text |  |  | 患者名 |
| date_of_birth | date | NOT NULL |  | 患者の生年月日 |
| sex | varchar(1) | FK | 'F' | 患者の性別 |
| HIS_id | text | UNIQUE, NOT NULL |  | 施設での患者ID |
| decline | boolean |  | FALSE | 臨床試験登録拒否を表明しているか否か |
| registrant | integer | FK |  | 最終更新登録者ID |
| last_updated | timestamptz | NOT NULL |  | 最終更新タイムスタンプ |

## ドキュメント (jesgo_document)
### テーブル定義
| 列名 | 型 | 属性 | デフォルト | 解説 |
|---|---|---|---|---|
| document_id | serial | PK |  | 内部で使用するドキュメントID |
| case_id | integer | FK,NOT NULL |  | ドキュメントの紐付く患者ID |
| event_date | date |  |  | ドキュメントイベントの日付 |
| document | JSON | NOT NULL |  | スキーマに沿って記録されたドキュメント情報(JSON) |
| child_documents | integer[] | FK(制約は不可) |  | このドキュメントの下の階層を構成するドキュメントのドキュメントIDを保持した配列 |
| schema_id | integer | FK,NOT NULL |  | ドキュメントを構成するスキーマのID |
| schema_major_version | integer |  |  | スキーマのメジャーバージョン |
| registrant | integer | FK |  | 最終更新登録者ID |
| last_updated | timestamptz | NOT NULL |  | 最終更新タイムスタンプ |
| readonly | boolean |  | FALSE | 編集禁止フラグ |
| deleted | boolean |  | FALSE | 削除済みフラグ |

## ドキュメントスキーマ (jesgo_document_schema)
### テーブル定義
| 列名 | 型 | 属性 | デフォルト | 解説 |
|---|---|---|---|---|
| schema_id | integer | PK |  | スキーマID |
| schema_id_string | text |  |  | JSONスキーマの$id |
| title | text |  |  | スキーマが定義するドキュメントのタイトル(JSONスキーマのtitleから生成) |
| subtitle | text |  |  | スキーマが定義するドキュメントのサブタイトル(JSONスキーマのtitleから生成) |
| document_schema | JSON | NOT NULL |  | スキーマ定義内容(JSON) |
| uniqueness | boolean |  | FALSE | 同一階層にこのスキーマで定義されるドキュメントは最大1つしか存在できない(JSONスキーマのjesgo:unique) |
| hidden | boolean |  |  | 候補として表示しない |
| subschema | integer[] |  |  | このドキュメントの下位として標準的に展開されるスキーマのスキーマID(初期値はJSONスキーマのjesgo:subschemaから検索、継承スキーマでの置き換えに限り編集可能、順序は保持される) |
| child_schema | integer[] |  |  | このドキュメントの下位として展開されうるスキーマのスキーマID(初期値はJSONスキーマのjesgi:subschema,jesgo:childschema,jesgo:parentschemaから検索して生成、編集可能、順序は保持される) |
| base_version_major | integer |  |  | 継承スキーマの場合、基底スキーマのメジャーバージョンを明示する |
| valid_from | date | PK | '1970-01-01' | ドキュメントスキーマの有効期間開始日(JSONスキーマのjesgo:vaild[0]) |
| valid_until | date |  |  | ドキュメントスキーマの有効期間終了日(JSONスキーマのjesgo:valid[1]) |
| author | text | NOT NULL |  | スキーマの作成者名(JSONスキーマのjesgo:author) |
| version_major | integer | NOT NULL |  | スキーマのメジャーバージョン(JSONスキーマのjesgo:versionの上位数値) |
| version_minor | integer | NOT NULL |  | スキーマのマイナーバージョン(JSONスキーマのjesgo:versionの下位数値) |
| plugin_id | integer | FK |  | このスキーマを導入したプラグインのID |

## ドキュメントアイコン (jesgo_document_icon)
### テーブル定義
| 列名 | 型 | 属性 | デフォルト | 解説 |
|---|---|---|---|---|
| title | text | PK |  | 対応するスキーマのタイトル |
| icon | text |  |  | アイコンのデータ |

## 性別 (jesgo_sex_master)
### テーブル定義
| 列名 | 型 | 属性 | デフォルト | 解説 |
|---|---|---|---|---|
| sex_identifier | varchar(1) | PK |  | 性別を示す1文字で表記されたID |
| sex | text | NOT NULL |  | 性別を表記する文字列 |

### マスタ設定
| sex_identifier | sex |
|---|---|
| F | 女性 |
| M | 男性 |
| N | 記載なし |
| 1 | MTF |
| 2 | FTM |

## ユーザ (jesgo_user)
### テーブル定義
| 列名 | 型 | 属性 | デフォルト | 解説 |
|---|---|---|---|---|
| user_id | integer | PK |  | ユーザのID |
| name | text | NOT NULL |  | ログイン時に使用するユーザ名 |
| display_name | text |  |  | アプリケーション使用時に表示されるユーザ名 |
| password_hash | text |  |  | パスワードをハッシュ化したもの |
| roll_id | integer | FK,NOT NULL |  | ユーザの権限設定内容への外部参照 |

### 補足
ログテーブル記録用にユーザID:0でシステムユーザを作成する。  
上記ユーザはユーザ操作を伴わない(外部からのスクリプト等)ログ出力に記録される。

## ユーザロール (jesgo_user_roll)
### テーブル定義
| 列名 | 型 | 属性 | デフォルト | 解説 |
|---|---|---|---|---|
| roll_id | integer | PK |  | 権限管理のID |
| title | text | NOT NULL |  | 権限の名称 |
| login | boolean |  |  | ログイン可能 |
| view | boolean |  |  | ドキュメントの閲覧が可能 |
| add | boolean |  |  | ドキュメントの追加が可能 |
| edit | boolean |  |  | ドキュメントの編集が可能 |
| remove | boolean |  |  | ドキュメントの削除が可能 |
| data_manage | boolean |  |  | データの統括管理可能 |
| system_manage | boolean |  |  | システム管理可能 |

### マスタ設定
| roll_id | title | login | view | add | edit | remove | data_manage | system_manage |
|---|---|---|---|---|---|---|---|---|
| 0 | システム管理者 | TRUE | TRUE | TRUE | TRUE | TRUE | TRUE | TRUE |
| 1 | システムオペレーター | TRUE | FALSE | FALSE | FALSE | FALSE | FALSE | TRUE |
| 100 | 上級ユーザ | TRUE | TRUE | TRUE | TRUE | TRUE | TRUE | FALSE |
| 101 | 一般ユーザ | TRUE | TRUE | TRUE | TRUE | FALSE | FALSE | FALSE |
| 999 | ログ用ユーザ | FALSE | FALSE | FALSE | FALSE | FALSE | FALSE | FALSE |
| 1000 | 退職者 | FALSE | FALSE | FALSE | FALSE | FALSE | FALSE | FALSE |

## ログ (jesgo_log)
### テーブル定義
| 列名 | 型 | 属性 | デフォルト | 解説 |
|---|---|---|---|---|
| log_id | serial | PK |  | ログのID |
| user_id | integer | FK |  | 該当ログを残したユーザのID |
| body | text |  |  | ログ本文 |
| created | timestamptz | NOT NULL |  | ログ作成時のタイムスタンプ |

### 補足
ユーザ操作を伴わない(外部からのスクリプト等)ログはuser_idが0で記録される。
