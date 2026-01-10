-- Script para adicionar a coluna user_email na tabela imports
-- Execute este script no SQL Editor do Supabase

-- Adiciona a coluna user_email se ela não existir
ALTER TABLE imports 
ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Adiciona comentário explicativo
COMMENT ON COLUMN imports.user_email IS 'Email do usuário que realizou a importação';

-- Verifica se a coluna foi criada
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'imports' 
  AND column_name = 'user_email';

