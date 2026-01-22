# Instruções: Configurar Dados Compartilhados entre Usuários

## Objetivo

Permitir que todos os usuários autenticados vejam e trabalhem com os mesmos dados (transações e importações), como se todos fizessem parte da mesma loja.

## Passo a Passo

### 1. Acessar o Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor**

### 2. Executar o Script SQL

1. Abra o arquivo `fix-shared-data-policies.sql`
2. Copie todo o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou pressione Ctrl+Enter)

### 3. Verificar se Funcionou

O script deve executar sem erros. Você verá:

- ✅ Todas as políticas antigas removidas
- ✅ Novas políticas criadas para acesso compartilhado
- ✅ Constraint única ajustada para ser global (apenas por `id_transacao`)
- ✅ Verificação das políticas criadas

### 4. Testar no Sistema

1. Faça login com um usuário
2. Importe uma planilha CSV
3. Faça logout e entre com outro usuário
4. Verifique se as transações importadas pelo primeiro usuário aparecem para o segundo usuário

## O Que Foi Alterado?

### Antes (Dados Separados):
- Cada usuário via apenas suas próprias transações
- Cada usuário via apenas suas próprias importações
- Duplicatas eram verificadas por usuário (`user_id + id_transacao`)

### Depois (Dados Compartilhados):
- ✅ Todos os usuários autenticados veem todas as transações
- ✅ Todos os usuários autenticados veem todas as importações
- ✅ Qualquer usuário autenticado pode importar planilhas
- ✅ Duplicatas são verificadas globalmente (apenas por `id_transacao`)
- ✅ O campo `user_id` ainda é salvo (para rastrear quem importou), mas todos podem ver tudo

## Políticas RLS Criadas

### Para Tabela `imports`:
- `Authenticated users can view all imports` - Todos podem ver todas as importações
- `Authenticated users can insert imports` - Todos podem criar importações
- `Authenticated users can update imports` - Todos podem atualizar importações

### Para Tabela `transactions`:
- `Authenticated users can view all transactions` - Todos podem ver todas as transações
- `Authenticated users can insert transactions` - Todos podem inserir transações
- `Authenticated users can update transactions` - Todos podem atualizar transações
- `Authenticated users can delete transactions` - Todos podem deletar transações

## Importante

⚠️ **Atenção**: Com essas políticas, qualquer usuário autenticado pode:
- Ver todos os dados
- Modificar todos os dados
- Deletar dados

Se você quiser restringir algumas operações (ex: apenas visualizar, não deletar), podemos ajustar as políticas. Avise se precisar!

## Reverter (Se Necessário)

Se quiser voltar ao comportamento anterior (dados separados por usuário), execute o script `supabase-schema.sql` novamente (isso recriará as políticas antigas).

