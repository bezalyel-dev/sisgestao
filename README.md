# Sistema de Gestão de Transações

Sistema completo para importação, visualização e análise de transações financeiras com integração ao Supabase.

## Tecnologias

- React 18 + Vite
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Auth)
- React Router
- React Hook Form
- Zod

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://hippeoxfvuiskyeuiazj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcHBlb3hmdnVpc2t5ZXVpYXpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNTMwMTUsImV4cCI6MjA4MzYyOTAxNX0.ThNZsPlBIoQwmX39PR8LnuJtWMFOnjXCRTPeOC4Be4Q
```

### 3. Configurar banco de dados

1. Acesse o Supabase Dashboard (https://supabase.com/dashboard)
2. Abra o SQL Editor
3. Execute o script SQL completo em `supabase-schema.sql` para criar:
   - Tabela `transactions` (todas as transações)
   - Tabela `imports` (log de importações)
   - Índices para performance
   - Row Level Security (RLS) policies
   - Constraints e triggers

**Importante**: As credenciais do Supabase já estão configuradas no código, mas você pode criar um arquivo `.env` para sobrescrever se necessário.

### 4. Configurar emails em português (Opcional mas recomendado)

Por padrão, os emails de autenticação do Supabase são enviados em inglês. Para traduzir para português:

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
2. Seu Projeto → **Authentication** → **Email Templates**
3. Para cada template (Confirm Signup, Change Email, Reset Password, etc.), copie os templates traduzidos do arquivo `supabase-email-templates-pt-br.md`
4. Cole no campo correspondente e salve

**Templates prontos disponíveis em:** `supabase-email-templates-pt-br.md`

Isso fará com que todos os emails enviados pelo sistema (confirmação de cadastro, mudança de email, redefinição de senha) sejam enviados em português.

### 5. Executar o projeto

```bash
npm run dev
```

O sistema estará disponível em `http://localhost:5173`

## Funcionalidades

### Autenticação
- Login com email e senha
- Gerenciamento de sessão via Supabase Auth
- Proteção de rotas

### Importação de CSV
- Upload de arquivo CSV (separador: `;`)
- Validação de formato e colunas
- Preview dos dados antes de importar
- Processamento em lote
- Tratamento de duplicatas
- Histórico de importações

### Dashboard
- Filtros por:
  - Data/Hora (range)
  - Adquirente (PAYTIME, PAGSEGURO)
  - Modalidade (DEBITO, CREDITO, PIX)
- Cards de resumo:
  - Total de transações
  - Valor Bruto Total
  - Valor Líquido Total
- Tabela paginada com todas as transações filtradas
- Valores atualizados dinamicamente conforme os filtros

## Estrutura do CSV

O sistema espera um CSV com as seguintes colunas:
- DATA EXPORTACÃO
- DATA DA TRANSAÇÃO
- ID DA TRANSAÇÃO
- ESTABELECIMENTO
- MODALIDADE (DEBITO, CREDITO, PIX)
- VALOR BRUTO
- VALOR LÍQUIDO
- ADQUIRENTE
- E outras colunas opcionais conforme o modelo da planilha

**Importante**: O separador deve ser ponto e vírgula (`;`).

## Scripts

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Visualiza build de produção
- `npm run lint` - Executa linting

## Uso

### Primeiro acesso

1. Execute o projeto com `npm run dev`
2. Acesse `http://localhost:5173`
3. Você será redirecionado para a página de login
4. Crie uma conta ou faça login com suas credenciais do Supabase
5. Após o login, você verá o Dashboard

### Importar CSV

1. Clique em "Importar CSV" no menu lateral
2. Selecione ou arraste o arquivo CSV
3. O sistema irá validar e mostrar um preview dos dados
4. Revise os dados e clique em "Confirmar Importação"
5. As transações serão importadas e você verá o resultado

### Filtrar transações no Dashboard

1. Use o painel de filtros à esquerda:
   - Selecione período (data início e fim)
   - Marque os adquirentes desejados
   - Marque as modalidades desejadas
2. Clique em "Aplicar Filtros"
3. Os cards de resumo e a tabela serão atualizados automaticamente
4. Os valores mostram o total bruto e líquido das transações filtradas

## Estrutura do Projeto

```
src/
├── components/       # Componentes React
│   ├── auth/        # Componentes de autenticação
│   ├── dashboard/   # Componentes do dashboard
│   ├── import/      # Componentes de importação
│   └── layout/      # Layout base
├── hooks/           # Custom hooks
├── pages/           # Páginas principais
├── services/        # Serviços (Supabase, API)
├── types/           # TypeScript types
└── utils/           # Funções utilitárias
```
