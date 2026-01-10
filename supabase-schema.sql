-- Schema SQL para criar as tabelas no Supabase

-- Tabela de imports (log de importações)
CREATE TABLE IF NOT EXISTS imports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT, -- Email do usuário que fez a importação
  filename TEXT NOT NULL,
  rows_imported INTEGER NOT NULL DEFAULT 0,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'partial'))
);

-- Tabela de transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  import_id UUID REFERENCES imports(id) ON DELETE SET NULL,
  data_exportacao TIMESTAMP WITH TIME ZONE NOT NULL,
  data_transacao TIMESTAMP WITH TIME ZONE NOT NULL,
  data_estorno TIMESTAMP WITH TIME ZONE,
  id_transacao TEXT NOT NULL,
  id_transacao_adquirente TEXT NOT NULL,
  estabelecimento TEXT NOT NULL,
  cpf_cnpj_estabelecimento TEXT NOT NULL,
  mcc_estabelecimento TEXT,
  credenciadora TEXT NOT NULL,
  cpf_cnpj_credenciadora TEXT NOT NULL,
  representante TEXT,
  cpf_cnpj_representante TEXT,
  portador TEXT,
  cartao TEXT,
  cliente TEXT,
  modalidade TEXT NOT NULL CHECK (modalidade IN ('DEBITO', 'CREDITO', 'PIX')),
  parcelas INTEGER,
  bandeira TEXT,
  serial_equipamento TEXT,
  numero_identificacao_equipamento TEXT,
  modelo_equipamento TEXT,
  valor_bruto DECIMAL(15, 2) NOT NULL,
  valor_liquido DECIMAL(15, 2) NOT NULL,
  adquirente TEXT NOT NULL,
  canal TEXT NOT NULL,
  status TEXT NOT NULL,
  motivo_falha TEXT,
  plano TEXT,
  nsu TEXT,
  split TEXT NOT NULL,
  transacao_principal TEXT NOT NULL,
  valor_original DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_import_id ON transactions(import_id);
CREATE INDEX IF NOT EXISTS idx_transactions_data_transacao ON transactions(data_transacao);
CREATE INDEX IF NOT EXISTS idx_transactions_id_transacao ON transactions(id_transacao);
CREATE INDEX IF NOT EXISTS idx_transactions_adquirente ON transactions(adquirente);
CREATE INDEX IF NOT EXISTS idx_transactions_modalidade ON transactions(modalidade);
CREATE INDEX IF NOT EXISTS idx_transactions_user_data ON transactions(user_id, data_transacao);

CREATE INDEX IF NOT EXISTS idx_imports_user_id ON imports(user_id);
CREATE INDEX IF NOT EXISTS idx_imports_imported_at ON imports(imported_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)

-- Habilitar RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE imports ENABLE ROW LEVEL SECURITY;

-- Políticas para imports
CREATE POLICY "Users can view their own imports"
  ON imports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own imports"
  ON imports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own imports"
  ON imports FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para transactions
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Unique constraint para evitar duplicatas baseado em id_transacao por usuário
-- Se id_transacao já existe para o mesmo user_id, não insere novamente
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_user_id_transacao_unique 
  ON transactions(user_id, id_transacao);
