import type { Transaction } from '../types';
import { formatBrazilianDateOnly, formatTime } from './dateUtils';
import { formatBrazilianCurrencyNumber } from './currencyUtils';

/**
 * Converte transações para formato CSV
 */
export function transactionsToCSV(transactions: Transaction[]): string {
  if (transactions.length === 0) {
    return '';
  }

  // Cabeçalhos
  const headers = [
    'DATA EXPORTACÃO',
    'DATA DA TRANSAÇÃO',
    'DATA DO ESTORNO',
    'ID DA TRANSAÇÃO',
    'ID DA TRANSAÇÃO NA ADQUIRENTE',
    'ESTABELECIMENTO',
    'CPF/CNPJ ESTABELECIMENTO',
    'MCC DO ESTABELECIMENTO',
    'CREDENCIADORA',
    'CPF/CNPJ CREDENCIADORA',
    'REPRESENTANTE',
    'CPF/CNPJ REPRESENTANTE',
    'PORTADOR',
    'CARTÃO',
    'CLIENTE',
    'MODALIDADE',
    'PARCELAS',
    'BANDEIRA',
    'SERIAL DO EQUIPAMENTO',
    'NÚMERO DE IDENTIFICAÇÃO DO EQUIPAMENTO',
    'MODELO DO EQUIPAMENTO',
    'VALOR BRUTO',
    'VALOR LÍQUIDO',
    'ADQUIRENTE',
    'CANAL',
    'STATUS',
    'MOTIVO DE FALHA',
    'PLANO',
    'NSU',
    'SPLIT',
    'TRANSAÇÃO PRINCIPAL',
    'VALOR ORIGINAL',
  ];

  // Linhas de dados
  const rows = transactions.map((t) => {
    const dataExportacao = t.data_exportacao
      ? `${formatBrazilianDateOnly(t.data_exportacao)} ${formatTime(t.data_exportacao)}`
      : '';
    const dataTransacao = t.data_transacao
      ? `${formatBrazilianDateOnly(t.data_transacao)} ${formatTime(t.data_transacao)}`
      : '';
    const dataEstorno = t.data_estorno
      ? `${formatBrazilianDateOnly(t.data_estorno)} ${formatTime(t.data_estorno)}`
      : '';

    return [
      dataExportacao,
      dataTransacao,
      dataEstorno,
      t.id_transacao || '',
      t.id_transacao_adquirente || '',
      t.estabelecimento || '',
      t.cpf_cnpj_estabelecimento || '',
      t.mcc_estabelecimento || '',
      t.credenciadora || '',
      t.cpf_cnpj_credenciadora || '',
      t.representante || '',
      t.cpf_cnpj_representante || '',
      t.portador || '',
      t.cartao || '',
      t.cliente || '',
      t.modalidade || '',
      t.parcelas?.toString() || '',
      t.bandeira || '',
      t.serial_equipamento || '',
      t.numero_identificacao_equipamento || '',
      t.modelo_equipamento || '',
      formatBrazilianCurrencyNumber(t.valor_bruto || 0),
      formatBrazilianCurrencyNumber(t.valor_liquido || 0),
      t.adquirente || '',
      t.canal || '',
      t.status || '',
      t.motivo_falha || '',
      t.plano || '',
      t.nsu || '',
      t.split || '',
      t.transacao_principal || '',
      formatBrazilianCurrencyNumber(t.valor_original || 0),
    ];
  });

  // Junta tudo
  const csvLines = [
    headers.join(';'),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')),
  ];

  return csvLines.join('\n');
}

/**
 * Faz download de um arquivo CSV
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' }); // BOM para Excel
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

