-- V7: 清理 AI 赏析 fallback 脏数据
-- 背景: 线上 LLM 密钥未配置期间, PoemAnalysisService 曾把 fallback 兜底 JSON 写入缓存,
--       导致即使后续配置了密钥, 缓存命中逻辑也会一直返回"生成失败: AI 服务未配置"的脏数据。
-- 修复: 服务端已改为不再落库 fallback（见 PoemAnalysisService.isFallbackAnalysis / getOrGenerate）,
--       此处删除历史脏数据, 前端再次访问时会惰性重新生成。
-- 幂等: DELETE 匹配 0 行同样安全, 可重复执行。
-- 应用: python3 scripts/apply_migration.py backend/src/main/resources/db/migration/V7__poem_analysis_fallback_cleanup.sql
DELETE FROM poem_analysis WHERE model = 'fallback';
