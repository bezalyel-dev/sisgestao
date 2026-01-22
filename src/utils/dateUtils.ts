import { format, parse, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Converte data no formato brasileiro DD/MM/YYYY HH:mm:ss para Date
 */
export function parseBrazilianDateTime(dateTimeString: string): Date | null {
  try {
    if (!dateTimeString || !dateTimeString.trim()) {
      return null;
    }
    
    // Remove espaços extras e trim
    let cleaned = dateTimeString.trim();
    
    // Formato esperado: DD/MM/YYYY HH:mm:ss ou DD/MM/YYYY  HH:mm:ss (com espaços extras)
    // Normaliza espaços múltiplos para um único espaço
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Tenta parsear com formato brasileiro completo (data + hora)
    let parsed = parse(cleaned, 'dd/MM/yyyy HH:mm:ss', new Date());
    
    if (isValid(parsed)) {
      return parsed;
    }
    
    // Tenta sem segundos
    parsed = parse(cleaned, 'dd/MM/yyyy HH:mm', new Date());
    if (isValid(parsed)) {
      return parsed;
    }
    
    // Tenta apenas data se hora não estiver presente
    parsed = parse(cleaned, 'dd/MM/yyyy', new Date());
    if (isValid(parsed)) {
      return parsed;
    }
    
    // Última tentativa: tenta parse ISO ou Date nativo
    const dateObj = new Date(cleaned);
    if (!isNaN(dateObj.getTime())) {
      return dateObj;
    }
    
    console.warn('Não foi possível parsear data:', dateTimeString);
    return null;
  } catch (error) {
    console.error('Erro ao parsear data:', error, dateTimeString);
    return null;
  }
}

/**
 * Formata data para exibição brasileira
 */
export function formatBrazilianDate(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });
  } catch {
    return '';
  }
}

/**
 * Formata apenas a data (sem hora)
 */
export function formatBrazilianDateOnly(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return '';
  }
}

/**
 * Formata apenas a hora
 */
export function formatTime(date: Date | string): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'HH:mm:ss', { locale: ptBR });
  } catch {
    return '';
  }
}
