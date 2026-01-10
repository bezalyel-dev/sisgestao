-- Script SQL SEGURO para limpar/zerar o banco de dados
-- Este script usa TRUNCATE que é mais rápido e reseta as sequências automaticamente
-- ATENÇÃO: Este script irá DELETAR TODOS os dados!

-- Método 1: TRUNCATE (mais rápido, mas não funciona se houver foreign keys dependentes)
-- Desabilitar verificação temporariamente
SET session_replication_role = 'replica';

-- Deletar na ordem correta (transactions primeiro devido à foreign key)
TRUNCATE TABLE transactions CASCADE;
TRUNCATE TABLE imports CASCADE;

-- Reabilitar verificação
SET session_replication_role = 'origin';

-- Método 2: DELETE (mais seguro, funciona mesmo com foreign keys)
-- Se o TRUNCATE acima não funcionar, use este:
/*
DELETE FROM transactions;
DELETE FROM imports;
*/

-- Verificar se está vazio
SELECT 
    'transactions' as tabela, 
    COUNT(*) as total_registros,
    'Status: ' || CASE WHEN COUNT(*) = 0 THEN 'VAZIA ✓' ELSE 'AINDA TEM DADOS' END as status
FROM transactions
UNION ALL
SELECT 
    'imports' as tabela, 
    COUNT(*) as total_registros,
    'Status: ' || CASE WHEN COUNT(*) = 0 THEN 'VAZIA ✓' ELSE 'AINDA TEM DADOS' END as status
FROM imports;

