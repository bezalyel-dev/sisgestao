import { supabase } from './supabase';
import type { Import } from '../types';
import type { Database } from '../types/database';

type ImportUpdate = Database['public']['Tables']['imports']['Update'];

type ImportInsert = Database['public']['Tables']['imports']['Insert'];
type ImportRow = Database['public']['Tables']['imports']['Row'];

/**
 * Converte Import para formato de insert do Supabase
 */
function importToInsert(importData: Import): ImportInsert {
  // Valida campos obrigatórios
  if (!importData.filename) {
    throw new Error('Filename é obrigatório');
  }
  if (importData.rows_imported === undefined || importData.rows_imported === null) {
    throw new Error('rows_imported é obrigatório');
  }
  if (!importData.status) {
    throw new Error('status é obrigatório');
  }
  
  const insertData: ImportInsert = {
    user_id: importData.user_id || null,
    filename: importData.filename,
    rows_imported: importData.rows_imported,
    status: importData.status,
    // user_email temporariamente removido até a coluna ser adicionada no banco
    // Descomente após executar fix-user-email-column.sql no Supabase
    // user_email: importData.user_email || null,
  };
  
  // imported_at é opcional - se não fornecido, o banco usa DEFAULT NOW()
  // Se fornecido, garante que está em formato correto
  if (importData.imported_at) {
    insertData.imported_at = typeof importData.imported_at === 'string'
      ? importData.imported_at
      : importData.imported_at.toISOString();
  }
  
  return insertData;
}

/**
 * Converte ImportRow para Import
 */
function rowToImport(row: ImportRow): Import {
  return {
    id: row.id,
    user_id: row.user_id || undefined,
    user_email: row.user_email || undefined,
    filename: row.filename,
    rows_imported: row.rows_imported,
    imported_at: new Date(row.imported_at),
    status: row.status,
  };
}

/**
 * Cria um registro de importação
 */
export async function createImport(importData: Import): Promise<{ data: Import | null; error: Error | null }> {
  try {
    // Verifica se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { 
        data: null, 
        error: new Error('Usuário não autenticado. Por favor, faça login novamente.') 
      };
    }
    
    // Garante que o user_id está correto (deve ser o usuário autenticado)
    if (importData.user_id && importData.user_id !== user.id) {
      console.warn('user_id fornecido não corresponde ao usuário autenticado. Usando user.id da autenticação.');
    }
    
    // Usa o user_id do usuário autenticado para garantir consistência
    // Nota: user_email temporariamente removido até adicionar coluna no banco
    const insertData = importToInsert({
      ...importData,
      user_id: user.id,
      // user_email: user.email || undefined, // Descomente após adicionar coluna no banco
    });
    
    // Log para debug
    console.log('Tentando criar import com dados:', insertData);
    console.log('User ID autenticado:', user.id);
    console.log('User email:', user.email);
    
    const { data, error } = await supabase
      .from('imports')
      .insert(insertData as ImportInsert)
      .select()
      .single();

    if (error) {
      console.error('Erro do Supabase ao criar import:', error);
      console.error('Código do erro:', error.code);
      console.error('Detalhes do erro:', error.details);
      console.error('Hint do erro:', error.hint);
      
      // Retorna um erro mais detalhado com informações específicas
      let errorMessage = error.message || 'Erro desconhecido ao criar registro de importação';
      
      // Mensagens de erro mais amigáveis baseadas no código
      if (error.code === '42501') {
        errorMessage = 'Você não tem permissão para criar esta importação. Verifique se está logado corretamente.';
      } else if (error.code === '23505') {
        errorMessage = 'Já existe uma importação com esses dados.';
      } else if (error.code === '23503') {
        errorMessage = 'Erro de referência: verifique se o usuário existe.';
      } else if (error.hint) {
        errorMessage = `${errorMessage}. Dica: ${error.hint}`;
      }
      
      const detailedError = new Error(errorMessage);
      (detailedError as any).code = error.code;
      (detailedError as any).details = error.details;
      (detailedError as any).hint = error.hint;
      return { data: null, error: detailedError };
    }

    return { data: data ? rowToImport(data) : null, error: null };
  } catch (error) {
    console.error('Erro inesperado ao criar import:', error);
    return { 
      data: null, 
      error: error instanceof Error 
        ? error 
        : new Error('Erro inesperado ao criar registro de importação') 
    };
  }
}

/**
 * Atualiza um registro de importação
 */
export async function updateImport(
  id: string,
  updates: Partial<Import>
): Promise<{ data: Import | null; error: Error | null }> {
  try {
    const updateData: ImportUpdate = {};
    
    if (updates.status) updateData.status = updates.status;
    if (updates.rows_imported !== undefined) updateData.rows_imported = updates.rows_imported;

    const { data, error } = await supabase
      .from('imports')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error as Error };
    }

    return { data: data ? rowToImport(data) : null, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Busca histórico de importações (de todos os usuários)
 */
export async function getImportHistory(
  limit = 20
): Promise<{ data: Import[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('imports')
      .select('*')
      .order('imported_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { data: [], error: error as Error };
    }

    const imports = data?.map(rowToImport) || [];
    return { data: imports, error: null };
  } catch (error) {
    return { data: [], error: error as Error };
  }
}
