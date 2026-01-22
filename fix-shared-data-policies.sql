-- Script para modificar as políticas RLS para permitir acesso compartilhado
-- Todos os usuários autenticados podem ver e inserir transações/imports de todos

-- ============================================
-- 1. REMOVER POLÍTICAS ANTIGAS
-- ============================================

-- Remove políticas antigas de imports
DROP POLICY IF EXISTS "Users can view their own imports" ON imports;
DROP POLICY IF EXISTS "Users can insert their own imports" ON imports;
DROP POLICY IF EXISTS "Users can update their own imports" ON imports;

-- Remove políticas antigas de transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;

-- ============================================
-- 2. CRIAR NOVAS POLÍTICAS (ACESSO COMPARTILHADO)
-- ============================================

-- Políticas para imports: Todos os usuários autenticados podem ver/inserir/atualizar
CREATE POLICY "Authenticated users can view all imports"
  ON imports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert imports"
  ON imports FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update imports"
  ON imports FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para transactions: Todos os usuários autenticados podem ver/inserir/atualizar/deletar
CREATE POLICY "Authenticated users can view all transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 3. AJUSTAR CONSTRAINT ÚNICA PARA EVITAR DUPLICATAS GLOBAIS
-- ============================================

-- Remove a constraint única antiga (baseada em user_id + id_transacao)
DROP INDEX IF EXISTS idx_transactions_user_id_transacao_unique;

-- Cria nova constraint única apenas por id_transacao (global, não por usuário)
-- Isso garante que a mesma transação não seja importada duas vezes, independente do usuário
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_id_transacao_unique 
  ON transactions(id_transacao);

-- ============================================
-- 4. VERIFICAÇÃO
-- ============================================

-- Verifica as políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('transactions', 'imports')
ORDER BY tablename, policyname;

-- Verifica os índices únicos
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'transactions'
  AND indexdef LIKE '%UNIQUE%';

