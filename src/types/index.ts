export interface Transaction {
  id?: string;
  user_id?: string;
  import_id?: string;
  data_exportacao: Date | string;
  data_transacao: Date | string;
  data_estorno?: Date | string | null;
  id_transacao: string;
  id_transacao_adquirente: string;
  estabelecimento: string;
  cpf_cnpj_estabelecimento: string;
  mcc_estabelecimento?: string | null;
  credenciadora: string;
  cpf_cnpj_credenciadora: string;
  representante?: string | null;
  cpf_cnpj_representante?: string | null;
  portador?: string | null;
  cartao?: string | null;
  cliente?: string | null;
  modalidade: 'DEBITO' | 'CREDITO' | 'PIX';
  parcelas?: number | null;
  bandeira?: string | null;
  serial_equipamento?: string | null;
  numero_identificacao_equipamento?: string | null;
  modelo_equipamento?: string | null;
  valor_bruto: number;
  valor_liquido: number;
  adquirente: string;
  canal: string;
  status: string;
  motivo_falha?: string | null;
  plano?: string | null;
  nsu?: string | null;
  split: string;
  transacao_principal: string;
  valor_original: number;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface Import {
  id?: string;
  user_id?: string;
  user_email?: string; // Email do usuário que fez a importação
  filename: string;
  rows_imported: number;
  imported_at: Date | string;
  status: 'success' | 'error' | 'partial';
}

export interface TransactionFilters {
  dataInicio?: Date | null;
  dataFim?: Date | null;
  adquirentes?: string[];
  modalidades?: string[];
}

export interface TransactionSummary {
  totalTransacoes: number;
  valorBrutoTotal: number;
  valorLiquidoTotal: number;
}
