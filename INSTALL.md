# Instruções de Instalação

## Passo 1: Configurar o Banco de Dados no Supabase

1. Acesse o painel do Supabase: https://hippeoxfvuiskyeuiazj.supabase.co
2. Vá para a seção **SQL Editor**
3. Copie e cole o conteúdo do arquivo `supabase-schema.sql`
4. Execute o script SQL

Isso criará:
- Tabela `transactions` com todas as colunas necessárias
- Tabela `imports` para log de importações
- Índices para melhor performance
- Row Level Security (RLS) configurado
- Políticas de segurança para que cada usuário veja apenas suas próprias transações

## Passo 2: Criar um Usuário

1. No painel do Supabase, vá para **Authentication** > **Users**
2. Clique em **Add User** > **Create new user**
3. Preencha email e senha
4. **Não marque** "Auto Confirm User" se quiser verificar por email, ou marque se quiser criar usuário já confirmado

## Passo 3: Instalar Dependências

```bash
npm install
```

## Passo 4: Executar o Projeto

```bash
npm run dev
```

## Passo 5: Acessar o Sistema

1. Acesse `http://localhost:5173`
2. Faça login com o usuário criado no Passo 2
3. Navegue até "Importar CSV" para importar sua primeira planilha

## Importante

- O CSV deve usar ponto e vírgula (`;`) como separador
- O formato de data deve ser `DD/MM/YYYY HH:mm:ss`
- Valores monetários devem estar no formato brasileiro (vírgula como separador decimal)
- O sistema valida automaticamente duplicatas baseado em `id_transacao` por usuário
