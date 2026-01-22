import { supabase } from './supabase';
import type { Transaction, TransactionFilters, TransactionSummary } from '../types';
import type { Database } from '../types/database';

type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
type TransactionRow = Database['public']['Tables']['transactions']['Row'];

/**
 * Converte Transaction para formato de insert do Supabase
 */
function transactionToInsert(transaction: Transaction): TransactionInsert {
  return {
    user_id: transaction.user_id || undefined,
    import_id: transaction.import_id || undefined,
    data_exportacao: typeof transaction.data_exportacao === 'string' 
      ? transaction.data_exportacao 
      : transaction.data_exportacao.toISOString(),
    data_transacao: typeof transaction.data_transacao === 'string'
      ? transaction.data_transacao
      : transaction.data_transacao.toISOString(),
    data_estorno: transaction.data_estorno 
      ? (typeof transaction.data_estorno === 'string' ? transaction.data_estorno : transaction.data_estorno.toISOString())
      : null,
    id_transacao: transaction.id_transacao,
    id_transacao_adquirente: transaction.id_transacao_adquirente,
    estabelecimento: transaction.estabelecimento,
    cpf_cnpj_estabelecimento: transaction.cpf_cnpj_estabelecimento,
    mcc_estabelecimento: transaction.mcc_estabelecimento || null,
    credenciadora: transaction.credenciadora,
    cpf_cnpj_credenciadora: transaction.cpf_cnpj_credenciadora,
    representante: transaction.representante || null,
    cpf_cnpj_representante: transaction.cpf_cnpj_representante || null,
    portador: transaction.portador || null,
    cartao: transaction.cartao || null,
    cliente: transaction.cliente || null,
    modalidade: transaction.modalidade,
    parcelas: transaction.parcelas || null,
    bandeira: transaction.bandeira || null,
    serial_equipamento: transaction.serial_equipamento || null,
    numero_identificacao_equipamento: transaction.numero_identificacao_equipamento || null,
    modelo_equipamento: transaction.modelo_equipamento || null,
    valor_bruto: transaction.valor_bruto,
    valor_liquido: transaction.valor_liquido,
    adquirente: transaction.adquirente,
    canal: transaction.canal,
    status: transaction.status,
    motivo_falha: transaction.motivo_falha || null,
    plano: transaction.plano || null,
    nsu: transaction.nsu || null,
    split: transaction.split,
    transacao_principal: transaction.transacao_principal,
    valor_original: transaction.valor_original,
  };
}

/**
 * Converte TransactionRow para Transaction
 */
function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    user_id: row.user_id || undefined,
    import_id: row.import_id || undefined,
    data_exportacao: new Date(row.data_exportacao),
    data_transacao: new Date(row.data_transacao),
    data_estorno: row.data_estorno ? new Date(row.data_estorno) : null,
    id_transacao: row.id_transacao,
    id_transacao_adquirente: row.id_transacao_adquirente,
    estabelecimento: row.estabelecimento,
    cpf_cnpj_estabelecimento: row.cpf_cnpj_estabelecimento,
    mcc_estabelecimento: row.mcc_estabelecimento,
    credenciadora: row.credenciadora,
    cpf_cnpj_credenciadora: row.cpf_cnpj_credenciadora,
    representante: row.representante,
    cpf_cnpj_representante: row.cpf_cnpj_representante,
    portador: row.portador,
    cartao: row.cartao,
    cliente: row.cliente,
    modalidade: row.modalidade,
    parcelas: row.parcelas,
    bandeira: row.bandeira,
    serial_equipamento: row.serial_equipamento,
    numero_identificacao_equipamento: row.numero_identificacao_equipamento,
    modelo_equipamento: row.modelo_equipamento,
    valor_bruto: row.valor_bruto,
    valor_liquido: row.valor_liquido,
    adquirente: row.adquirente,
    canal: row.canal,
    status: row.status,
    motivo_falha: row.motivo_falha,
    plano: row.plano,
    nsu: row.nsu,
    split: row.split,
    transacao_principal: row.transacao_principal,
    valor_original: row.valor_original,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  };
}

/**
 * Insere uma transação
 */
export async function insertTransaction(transaction: Transaction): Promise<{ data: Transaction | null; error: Error | null }> {
  try {
    const insertData = transactionToInsert(transaction);
    // Usa type assertion para contornar problema de inferência de tipos do Supabase
    const { data, error } = await (supabase
      .from('transactions') as any)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      // Se for erro de duplicata, retorna null sem erro
      if (error.code === '23505') {
        return { data: null, error: null };
      }
      return { data: null, error: error as Error };
    }

    return { data: data ? rowToTransaction(data) : null, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Insere múltiplas transações em lote
 * @param transactions Array de transações para inserir
 * @param onProgress Callback opcional para reportar progresso (0-100)
 */
export async function insertTransactions(
  transactions: Transaction[],
  onProgress?: (progress: number) => void
): Promise<{ inserted: number; errors: number; duplicates: number }> {
  let inserted = 0;
  let errors = 0;
  let duplicates = 0;

  // Processa em lotes de 100 para evitar problemas de performance
  const batchSize = 100;
  const totalBatches = Math.ceil(transactions.length / batchSize);
  
  // Notifica progresso inicial (criando registro de importação)
  if (onProgress) {
    onProgress(5); // 5% para criação do registro
  }
  
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    const insertData = batch.map(transactionToInsert);
    const currentBatch = Math.floor(i / batchSize) + 1;

    try {
      // Usa type assertion para contornar problema de inferência de tipos do Supabase
      const { data, error } = await (supabase
        .from('transactions') as any)
        .insert(insertData)
        .select();

      if (error) {
        console.error(`Erro ao inserir lote ${currentBatch}/${totalBatches}:`, error);
        console.error('Detalhes do erro:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Se houver erro, tenta inserir uma por uma para identificar duplicatas
        for (const transaction of batch) {
          const result = await insertTransaction(transaction);
          if (result.error) {
            if (result.error.message.includes('duplicate') || result.error.message.includes('unique')) {
              duplicates++;
            } else {
              errors++;
              console.error('Erro ao inserir transação individual:', result.error);
            }
          } else if (result.data) {
            inserted++;
          } else {
            duplicates++;
          }
        }
      } else {
        const insertedCount = data?.length || 0;
        inserted += insertedCount;
        console.log(`Lote ${currentBatch}/${totalBatches} inserido com sucesso: ${insertedCount} transações`);
      }
      
      // Calcula e reporta progresso: 5% inicial + 90% para inserção + 5% para atualização final
      // Progresso base: 5% (criação do registro)
      // Progresso da inserção: 5% + (currentBatch / totalBatches) * 90
      const insertionProgress = 5 + (currentBatch / totalBatches) * 90;
      if (onProgress) {
        onProgress(Math.min(insertionProgress, 95)); // Máximo 95% antes de atualizar o registro
      }
    } catch (error) {
      console.error(`Erro inesperado ao inserir lote ${currentBatch}/${totalBatches}:`, error);
      errors += batch.length;
    }
  }

  // Notifica progresso final
  if (onProgress) {
    onProgress(100);
  }

  return { inserted, errors, duplicates };
}

/**
 * Busca transações com filtros
 */
export async function getTransactions(
  filters?: TransactionFilters,
  page = 1,
  pageSize = 50
): Promise<{ data: Transaction[]; count: number; error: Error | null }> {
  try {
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' });

    // Aplica filtros de data e hora
    if (filters?.dataInicio) {
      const startDate = new Date(filters.dataInicio);
      // Se houver hora de início, aplica ela; senão, começa do início do dia
      if (filters.horaInicio) {
        const [hours, minutes] = filters.horaInicio.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          startDate.setHours(hours, minutes, 0, 0);
        } else {
          startDate.setHours(0, 0, 0, 0);
        }
      } else {
        startDate.setHours(0, 0, 0, 0);
      }
      query = query.gte('data_transacao', startDate.toISOString());
    }

    if (filters?.dataFim) {
      const endDate = new Date(filters.dataFim);
      // Se houver hora de fim, aplica ela; senão, termina no fim do dia
      if (filters.horaFim) {
        const [hours, minutes] = filters.horaFim.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          endDate.setHours(hours, minutes, 59, 999);
        } else {
          endDate.setHours(23, 59, 59, 999);
        }
      } else {
        endDate.setHours(23, 59, 59, 999);
      }
      query = query.lte('data_transacao', endDate.toISOString());
    }

    if (filters?.adquirentes && filters.adquirentes.length > 0) {
      query = query.in('adquirente', filters.adquirentes);
    }

    if (filters?.modalidades && filters.modalidades.length > 0) {
      query = query.in('modalidade', filters.modalidades);
    }

    // Ordena por data de transação (mais recente primeiro)
    query = query.order('data_transacao', { ascending: false });

    // Paginação
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      return { data: [], count: 0, error: error as Error };
    }

    const transactions = data?.map(rowToTransaction) || [];
    return { data: transactions, count: count || 0, error: null };
  } catch (error) {
    return { data: [], count: 0, error: error as Error };
  }
}

/**
 * Busca todas as transações de uma importação (sem paginação, para exportação)
 */
export async function getTransactionsByImportId(
  importId: string
): Promise<{ data: Transaction[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('import_id', importId)
      .order('data_transacao', { ascending: false });

    if (error) {
      return { data: [], error: error as Error };
    }

    const transactions = data?.map(rowToTransaction) || [];
    return { data: transactions, error: null };
  } catch (error) {
    return { data: [], error: error as Error };
  }
}

/**
 * Busca todas as transações com filtros (sem paginação, para exportação)
 */
export async function getAllTransactions(
  filters?: TransactionFilters
): Promise<{ data: Transaction[]; error: Error | null }> {
  try {
    let query = supabase
      .from('transactions')
      .select('*');

    // Aplica filtros de data e hora
    if (filters?.dataInicio) {
      const startDate = new Date(filters.dataInicio);
      // Se houver hora de início, aplica ela; senão, começa do início do dia
      if (filters.horaInicio) {
        const [hours, minutes] = filters.horaInicio.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          startDate.setHours(hours, minutes, 0, 0);
        } else {
          startDate.setHours(0, 0, 0, 0);
        }
      } else {
        startDate.setHours(0, 0, 0, 0);
      }
      query = query.gte('data_transacao', startDate.toISOString());
    }

    if (filters?.dataFim) {
      const endDate = new Date(filters.dataFim);
      // Se houver hora de fim, aplica ela; senão, termina no fim do dia
      if (filters.horaFim) {
        const [hours, minutes] = filters.horaFim.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          endDate.setHours(hours, minutes, 59, 999);
        } else {
          endDate.setHours(23, 59, 59, 999);
        }
      } else {
        endDate.setHours(23, 59, 59, 999);
      }
      query = query.lte('data_transacao', endDate.toISOString());
    }

    if (filters?.adquirentes && filters.adquirentes.length > 0) {
      query = query.in('adquirente', filters.adquirentes);
    }

    if (filters?.modalidades && filters.modalidades.length > 0) {
      query = query.in('modalidade', filters.modalidades);
    }

    query = query.order('data_transacao', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return { data: [], error: error as Error };
    }

    const transactions = data?.map(rowToTransaction) || [];
    return { data: transactions, error: null };
  } catch (error) {
    return { data: [], error: error as Error };
  }
}

/**
 * Calcula resumo das transações com filtros
 */
export async function getTransactionSummary(
  filters?: TransactionFilters
): Promise<{ data: TransactionSummary | null; error: Error | null }> {
  try {
    let query = supabase
      .from('transactions')
      .select('valor_bruto, valor_liquido', { count: 'exact' });

    // Aplica os mesmos filtros de data e hora
    if (filters?.dataInicio) {
      const startDate = new Date(filters.dataInicio);
      // Se houver hora de início, aplica ela; senão, começa do início do dia
      if (filters.horaInicio) {
        const [hours, minutes] = filters.horaInicio.split(':').map(Number);
        startDate.setHours(hours, minutes, 0, 0);
      } else {
        startDate.setHours(0, 0, 0, 0);
      }
      query = query.gte('data_transacao', startDate.toISOString());
    }

    if (filters?.dataFim) {
      const endDate = new Date(filters.dataFim);
      // Se houver hora de fim, aplica ela; senão, termina no fim do dia
      if (filters.horaFim) {
        const [hours, minutes] = filters.horaFim.split(':').map(Number);
        endDate.setHours(hours, minutes, 59, 999);
      } else {
        endDate.setHours(23, 59, 59, 999);
      }
      query = query.lte('data_transacao', endDate.toISOString());
    }

    if (filters?.adquirentes && filters.adquirentes.length > 0) {
      query = query.in('adquirente', filters.adquirentes);
    }

    if (filters?.modalidades && filters.modalidades.length > 0) {
      query = query.in('modalidade', filters.modalidades);
    }

    const { data, error, count } = await query;

    if (error) {
      return { data: null, error: error as Error };
    }

    const transactions = data || [];
    const totalTransacoes = count || 0;
    const valorBrutoTotal = transactions.reduce((sum: number, t: any) => sum + (Number(t.valor_bruto) || 0), 0);
    const valorLiquidoTotal = transactions.reduce((sum: number, t: any) => sum + (Number(t.valor_liquido) || 0), 0);

    return {
      data: {
        totalTransacoes,
        valorBrutoTotal,
        valorLiquidoTotal,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
