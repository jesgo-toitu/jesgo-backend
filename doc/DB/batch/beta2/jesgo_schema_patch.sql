-- /schema/OV/staging‚Ìtitle‚ÉTMN‚Ì•\‹L‚ªŽc‚Á‚Ä‚¢‚½‚Ì‚Åupdate‚Å‘Î‰ž‚·‚é.
UPDATE jesgo_document_schema SET document_schema = replace(document_schema::text, 'TMN', 'TNM')::json
WHERE schema_id_string = '/schema/OV/staging';