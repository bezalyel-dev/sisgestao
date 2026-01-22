-- ============================================
-- SCRIPT PARA ZERAR/LIMPAR O BANCO DE DADOS
-- ============================================
-- ATENÇÃO: Este script irá DELETAR TODOS os dados das tabelas!
-- Execute no SQL Editor do Supabase

-- Opção 1: DELETE (mais seguro, funciona com foreign keys)
-- Deletar transações primeiro (devido à foreign key)
DELETE FROM transactions;

-- Deletar registros de importação
DELETE FROM imports;

-- Opção 2: TRUNCATE (mais rápido, mas precisa desabilitar checks)
-- Se a opção 1 não funcionar, use esta:
/*
SET session_replication_role = 'replica';
TRUNCATE TABLE transactions CASCADE;
TRUNCATE TABLE imports CASCADE;
SET session_replication_role = 'origin';
*/

-- Verificar se as tabelas estão vazias
SELECT 
    'transactions' as tabela, 
    COUNT(*) as total_registros,
    CASE WHEN COUNT(*) = 0 THEN '✓ VAZIA' ELSE '⚠ AINDA TEM DADOS' END as status
FROM transactions
UNION ALL
SELECT 
    'imports' as tabela, 
    COUNT(*) as total_registros,
    CASE WHEN COUNT(*) = 0 THEN '✓ VAZIA' ELSE '⚠ AINDA TEM DADOS' END as status
FROM imports;

