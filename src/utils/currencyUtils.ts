/**
 * Converte valor monetário brasileiro (formato: " 49,00") para número
 */
export function parseBrazilianCurrency(value: string): number {
  try {
    if (!value || !value.trim()) {
      return 0;
    }
    
    // Remove espaços extras, símbolos de moeda e caracteres não numéricos exceto vírgula e ponto
    let cleaned = value
      .trim()
      .replace(/[\sÅR$]/g, '') // Remove espaços, símbolo Å, R e $
      .replace(/\./g, '') // Remove pontos (milhares)
      .replace(',', '.'); // Substitui vírgula por ponto para parse
    
    return parseFloat(cleaned) || 0;
  } catch (error) {
    console.error('Erro ao parsear valor monetário:', error, value);
    return 0;
  }
}

/**
 * Formata número para formato monetário brasileiro
 */
export function formatBrazilianCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata número para formato monetário brasileiro sem símbolo de moeda
 */
export function formatBrazilianCurrencyNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
