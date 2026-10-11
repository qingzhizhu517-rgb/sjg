-- V35: session revocation on password reset, disable and approval changes.
SET @sjg_add_credential_version = IF(
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = DATABASE() AND table_name = 'user' AND column_name = 'credential_version') = 0,
  'ALTER TABLE user ADD COLUMN credential_version BIGINT NOT NULL DEFAULT 0',
  'SELECT 1');
PREPARE sjg_credential_stmt FROM @sjg_add_credential_version;
EXECUTE sjg_credential_stmt;
DEALLOCATE PREPARE sjg_credential_stmt;
