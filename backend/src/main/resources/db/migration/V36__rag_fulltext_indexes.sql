-- V36: ngram fulltext search. Enable RAG_FULLTEXT_ENABLED only after this migration.
SET @sjg_add_fulltext = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='poem' AND index_name='ft_poem_rag_v36')=0,
  'ALTER TABLE poem ADD FULLTEXT INDEX ft_poem_rag_v36 (title,content,background) WITH PARSER ngram', 'SELECT 1');
PREPARE sjg_fulltext_stmt FROM @sjg_add_fulltext;
EXECUTE sjg_fulltext_stmt;
DEALLOCATE PREPARE sjg_fulltext_stmt;
SET @sjg_add_fulltext = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='poet' AND index_name='ft_poet_rag_v36')=0,
  'ALTER TABLE poet ADD FULLTEXT INDEX ft_poet_rag_v36 (name,birthplace,biography,style) WITH PARSER ngram', 'SELECT 1');
PREPARE sjg_fulltext_stmt FROM @sjg_add_fulltext;
EXECUTE sjg_fulltext_stmt;
DEALLOCATE PREPARE sjg_fulltext_stmt;
SET @sjg_add_fulltext = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='scenic_spot' AND index_name='ft_scenic_spot_rag_v36')=0,
  'ALTER TABLE scenic_spot ADD FULLTEXT INDEX ft_scenic_spot_rag_v36 (name,description,region,address) WITH PARSER ngram', 'SELECT 1');
PREPARE sjg_fulltext_stmt FROM @sjg_add_fulltext;
EXECUTE sjg_fulltext_stmt;
DEALLOCATE PREPARE sjg_fulltext_stmt;
SET @sjg_add_fulltext = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='cultural_item' AND index_name='ft_cultural_item_rag_v36')=0,
  'ALTER TABLE cultural_item ADD FULLTEXT INDEX ft_cultural_item_rag_v36 (title,summary,content) WITH PARSER ngram', 'SELECT 1');
PREPARE sjg_fulltext_stmt FROM @sjg_add_fulltext;
EXECUTE sjg_fulltext_stmt;
DEALLOCATE PREPARE sjg_fulltext_stmt;
SET @sjg_add_fulltext = IF(
  (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='event' AND index_name='ft_event_rag_v36')=0,
  'ALTER TABLE event ADD FULLTEXT INDEX ft_event_rag_v36 (title,description,significance) WITH PARSER ngram', 'SELECT 1');
PREPARE sjg_fulltext_stmt FROM @sjg_add_fulltext;
EXECUTE sjg_fulltext_stmt;
DEALLOCATE PREPARE sjg_fulltext_stmt;
