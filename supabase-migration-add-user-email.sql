-- Migração: Adicionar campo user_email na tabela imports
-- Execute este script no SQL Editor do Supabase se a tabela já existir

ALTER TABLE imports 
ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Comentário sobre o campo
COMMENT ON COLUMN imports.user_email IS 'Email do usuário que realizou a importação';

