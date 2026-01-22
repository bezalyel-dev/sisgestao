import type { Transaction } from '../types';
import { parseBrazilianDateTime } from './dateUtils';
import { parseBrazilianCurrency } from './currencyUtils';

interface CSVRow {
  [key: string]: string;
}

/**
 * Parse CSV com separador ponto e vírgula
 */
export function parseCSV(csvContent: string): CSVRow[] {
  // Normaliza quebras de linha e remove BOM se presente
  let normalizedContent = csvContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  normalizedContent = normalizedContent.replace(/^\uFEFF/, ''); // Remove BOM
  
  const lines = normalizedContent.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV deve ter pelo menos um cabeçalho e uma linha de dados');
  }

  // Parse do cabeçalho - normaliza espaços e caracteres especiais
  const headers = lines[0].split(';').map(h => h.trim());
  
  // Parse das linhas
  const rows: CSVRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Ignora linhas vazias
    
    const values = line.split(';');
    const row: CSVRow = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() || '';
    });
    
    // Ignora linhas completamente vazias
    if (Object.values(row).some(v => v)) {
      rows.push(row);
    }
  }
  
  return rows;
}

/**
 * Valida se o CSV tem as colunas esperadas (mais flexível)
 */
export function validateCSVHeaders(headers: string[]): { valid: boolean; missing: string[] } {
  const requiredColumns = [
    'DATA DA TRANSAÇÃO',
    'ID DA TRANSAÇÃO',
    'MODALIDADE',
    'VALOR BRUTO',
    'VALOR LÍQUIDO',
  ];
  
  // Normaliza headers para comparação (remove acentos e espaços extras)
  const normalizedHeaders = headers.map(h => h.toUpperCase().trim());
  
  const missing = requiredColumns.filter(col => {
    const normalizedCol = col.toUpperCase().trim();
    return !normalizedHeaders.includes(normalizedCol);
  });
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Converte linha do CSV para objeto Transaction
 */
export function csvRowToTransaction(row: CSVRow, userId?: string, importId?: string): Transaction | null {
  try {
    // Parse de datas - mais flexível
    const dataExportacaoStr = row['DATA EXPORTACÃO'] || row['DATA EXPORTACAO'] || '';
    const dataTransacaoStr = row['DATA DA TRANSAÇÃO'] || row['DATA DA TRANSAÇÃO'] || '';
    const dataEstornoStr = row['DATA DO ESTORNO'] || '';
    
    const dataExportacao = parseBrazilianDateTime(dataExportacaoStr);
    let dataTransacao = parseBrazilianDateTime(dataTransacaoStr);
    const dataEstorno = dataEstornoStr ? parseBrazilianDateTime(dataEstornoStr) : null;

    // Se data de transação não for parseada, tenta usar a data de exportação ou usa data atual
    if (!dataTransacao) {
      if (dataExportacao) {
        dataTransacao = dataExportacao;
      } else {
        // Se não conseguir parsear nenhuma data, usa a data atual como fallback
        dataTransacao = new Date();
        console.warn('Data de transação inválida, usando data atual:', dataTransacaoStr);
      }
    }

    // Parse de valores monetários
    const valorBruto = parseBrazilianCurrency(row['VALOR BRUTO'] || '0');
    const valorLiquido = parseBrazilianCurrency(row['VALOR LÍQUIDO'] || '0');
    const valorOriginal = parseBrazilianCurrency(row['VALOR ORIGINAL'] || row['VALOR BRUTO'] || '0');

    // Parse de parcelas (pode estar vazio ou numérico) - extrai número se houver texto
    let parcelas: number | null = null;
    if (row['PARCELAS']) {
      const parcelasStr = row['PARCELAS'].trim();
      const parcelasMatch = parcelasStr.match(/\d+/);
      if (parcelasMatch) {
        parcelas = parseInt(parcelasMatch[0]) || null;
      }
    }

    const idTransacao = (row['ID DA TRANSAÇÃO'] || '').trim();
    const estabelecimento = (row['ESTABELECIMENTO'] || '').trim();
    
    // Validação mínima - precisa ter pelo menos id_transacao OU estabelecimento
    if (!idTransacao && !estabelecimento) {
      console.warn('Transação inválida - faltam campos obrigatórios (id_transacao e estabelecimento vazios)');
      return null;
    }

    // Se não tiver id_transacao, gera um baseado na linha
    const finalIdTransacao = idTransacao || `generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const transaction: Transaction = {
      user_id: userId,
      import_id: importId,
      data_exportacao: dataExportacao || new Date(),
      data_transacao: dataTransacao,
      data_estorno: dataEstorno,
      id_transacao: finalIdTransacao,
      id_transacao_adquirente: (row['ID DA TRANSAÇÃO NA ADQUIRENTE'] || '').trim() || finalIdTransacao,
      estabelecimento: estabelecimento || 'NÃO INFORMADO',
      cpf_cnpj_estabelecimento: row['CPF/CNPJ ESTABELECIMENTO'] || '',
      mcc_estabelecimento: row['MCC DO ESTABELECIMENTO'] || null,
      credenciadora: row['CREDENCIADORA'] || '',
      cpf_cnpj_credenciadora: row['CPF/CNPJ CREDENCIADORA'] || '',
      representante: row['REPRESENTANTE'] || null,
      cpf_cnpj_representante: row['CPF/CNPJ REPRESENTANTE'] || null,
      portador: row['PORTADOR'] || null,
      cartao: row['CARTÃO'] || row['CARTAO'] || null,
      cliente: row['CLIENTE'] || null,
      modalidade: (row['MODALIDADE'] || 'PIX').toUpperCase().trim() as 'DEBITO' | 'CREDITO' | 'PIX',
      parcelas,
      bandeira: row['BANDEIRA'] || null,
      serial_equipamento: row['SERIAL DO EQUIPAMENTO'] || null,
      numero_identificacao_equipamento: row['NÚMERO DE IDENTIFICAÇÃO DO EQUIPAMENTO'] || null,
      modelo_equipamento: row['MODELO DO EQUIPAMENTO'] || null,
      valor_bruto: valorBruto,
      valor_liquido: valorLiquido,
      adquirente: (row['ADQUIRENTE'] || '').trim() || 'NÃO INFORMADO',
      canal: row['CANAL'] || '',
      status: row['STATUS'] || '',
      motivo_falha: row['MOTIVO DE FALHA'] || null,
      plano: row['PLANO'] || null,
      nsu: row['NSU'] || null,
      split: row['SPLIT'] || '',
      transacao_principal: row['TRANSAÇÃO PRINCIPAL'] || row['TRANSAÇÃO PRINCIPAL'] || '',
      valor_original: valorOriginal,
    };

    return transaction;
  } catch (error) {
    console.error('Erro ao converter linha CSV para transação:', error, row);
    return null;
  }
}

/**
 * Processa CSV completo e retorna array de transações válidas
 */
export function processCSV(
  csvContent: string,
  userId?: string,
  importId?: string
): { transactions: Transaction[]; errors: string[] } {
  const errors: string[] = [];
  const transactions: Transaction[] = [];

  try {
    const rows = parseCSV(csvContent);
    
    if (rows.length === 0) {
      errors.push('Nenhuma linha de dados encontrada no CSV');
      return { transactions, errors };
    }

    // Valida cabeçalhos (primeira linha) - se não houver linhas, já foi tratado acima
    if (rows.length > 0) {
      const headers = Object.keys(rows[0] || {});
      console.log('Cabeçalhos encontrados:', headers);
      
      const validation = validateCSVHeaders(headers);
      
      if (!validation.valid) {
        errors.push(`Colunas faltando: ${validation.missing.join(', ')}`);
        console.error('Colunas faltando:', validation.missing);
        console.log('Cabeçalhos disponíveis:', headers);
        // Continua mesmo com colunas faltando - tenta processar o que tiver
      }
    }

    // Processa cada linha
    let successCount = 0;
    let errorCount = 0;
    
    rows.forEach((row, index) => {
      const transaction = csvRowToTransaction(row, userId, importId);
      
      if (transaction) {
        transactions.push(transaction);
        successCount++;
      } else {
        errorCount++;
        if (errorCount <= 10) { // Limita a 10 erros no log para não poluir
          errors.push(`Linha ${index + 2}: não foi possível processar a transação`);
        }
      }
    });
    
    if (errorCount > 10) {
      errors.push(`... e mais ${errorCount - 10} linha(s) com erro (total: ${errorCount} erros, ${successCount} sucessos)`);
    }
    
    console.log(`Processamento concluído: ${successCount} transações válidas, ${errorCount} erros`);

    return { transactions, errors };
  } catch (error) {
    errors.push(`Erro ao processar CSV: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    return { transactions, errors };
  }
}
