-- Script SQL para limpar/zerar o banco de dados
-- ATENÇÃO: Este script irá DELETAR TODOS os dados das tabelas!

-- Desabilitar verificação de foreign keys temporariamente
SET session_replication_role = 'replica';

-- Deletar todas as transações (na ordem correta devido às foreign keys)
DELETE FROM transactions;

-- Deletar todos os registros de importação
DELETE FROM imports;

-- Reabilitar verificação de foreign keys
SET session_replication_role = 'origin';

-- Opcional: Resetar sequências (se houver)
-- RESET SEQUENCE se necessário

-- Verificar se as tabelas estão vazias
SELECT 
    'transactions' as tabela, 
    COUNT(*) as total_registros 
FROM transactions
UNION ALL
SELECT 
    'imports' as tabela, 
    COUNT(*) as total_registros 
FROM imports;

