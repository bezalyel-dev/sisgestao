export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string
          user_id: string | null
          import_id: string | null
          data_exportacao: string
          data_transacao: string
          data_estorno: string | null
          id_transacao: string
          id_transacao_adquirente: string
          estabelecimento: string
          cpf_cnpj_estabelecimento: string
          mcc_estabelecimento: string | null
          credenciadora: string
          cpf_cnpj_credenciadora: string
          representante: string | null
          cpf_cnpj_representante: string | null
          portador: string | null
          cartao: string | null
          cliente: string | null
          modalidade: 'DEBITO' | 'CREDITO' | 'PIX'
          parcelas: number | null
          bandeira: string | null
          serial_equipamento: string | null
          numero_identificacao_equipamento: string | null
          modelo_equipamento: string | null
          valor_bruto: number
          valor_liquido: number
          adquirente: string
          canal: string
          status: string
          motivo_falha: string | null
          plano: string | null
          nsu: string | null
          split: string
          transacao_principal: string
          valor_original: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          import_id?: string | null
          data_exportacao: string
          data_transacao: string
          data_estorno?: string | null
          id_transacao: string
          id_transacao_adquirente: string
          estabelecimento: string
          cpf_cnpj_estabelecimento: string
          mcc_estabelecimento?: string | null
          credenciadora: string
          cpf_cnpj_credenciadora: string
          representante?: string | null
          cpf_cnpj_representante?: string | null
          portador?: string | null
          cartao?: string | null
          cliente?: string | null
          modalidade: 'DEBITO' | 'CREDITO' | 'PIX'
          parcelas?: number | null
          bandeira?: string | null
          serial_equipamento?: string | null
          numero_identificacao_equipamento?: string | null
          modelo_equipamento?: string | null
          valor_bruto: number
          valor_liquido: number
          adquirente: string
          canal: string
          status: string
          motivo_falha?: string | null
          plano?: string | null
          nsu?: string | null
          split: string
          transacao_principal: string
          valor_original: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          import_id?: string | null
          data_exportacao?: string
          data_transacao?: string
          data_estorno?: string | null
          id_transacao?: string
          id_transacao_adquirente?: string
          estabelecimento?: string
          cpf_cnpj_estabelecimento?: string
          mcc_estabelecimento?: string | null
          credenciadora?: string
          cpf_cnpj_credenciadora?: string
          representante?: string | null
          cpf_cnpj_representante?: string | null
          portador?: string | null
          cartao?: string | null
          cliente?: string | null
          modalidade?: 'DEBITO' | 'CREDITO' | 'PIX'
          parcelas?: number | null
          bandeira?: string | null
          serial_equipamento?: string | null
          numero_identificacao_equipamento?: string | null
          modelo_equipamento?: string | null
          valor_bruto?: number
          valor_liquido?: number
          adquirente?: string
          canal?: string
          status?: string
          motivo_falha?: string | null
          plano?: string | null
          nsu?: string | null
          split?: string
          transacao_principal?: string
          valor_original?: number
          created_at?: string
          updated_at?: string
        }
      }
      imports: {
        Row: {
          id: string
          user_id: string | null
          user_email: string | null
          filename: string
          rows_imported: number
          imported_at: string
          status: 'success' | 'error' | 'partial'
        }
        Insert: {
          id?: string
          user_id?: string | null
          user_email?: string | null
          filename: string
          rows_imported: number
          imported_at?: string
          status: 'success' | 'error' | 'partial'
        }
        Update: {
          id?: string
          user_id?: string | null
          user_email?: string | null
          filename?: string
          rows_imported?: number
          imported_at?: string
          status?: 'success' | 'error' | 'partial'
        }
      }
    }
  }
}
