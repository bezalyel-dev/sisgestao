import { useState, useCallback, useEffect, useRef } from 'react';
import { FileUpload } from '../components/import/FileUpload';
import { CSVPreview } from '../components/import/CSVPreview';
import { ImportHistory } from '../components/import/ImportHistory';
import { processCSV } from '../utils/csvParser';
import { insertTransactions } from '../services/transactions';
import { createImport, updateImport } from '../services/imports';
import { useAuth } from '../hooks/useAuth';
import { useImport } from '../contexts/ImportContext';
import type { Transaction, Import } from '../types';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export function ImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuth();
  const { isImporting, setIsImporting } = useImport();
  const isImportingRef = useRef(false);

  const handleFileSelect = useCallback(async (file: File | null) => {
    setSelectedFile(file);
    setTransactions([]);
    setError(null);
    setSuccess(null);

    if (!file) {
      return;
    }

    setLoading(true);
    try {
      // Lê o arquivo como texto
      const text = await file.text();
      console.log('Arquivo lido, tamanho:', text.length, 'caracteres');
      console.log('Primeiros 500 caracteres:', text.substring(0, 500));
      
      const { transactions: parsedTransactions, errors } = processCSV(
        text,
        user?.id,
        undefined
      );

      console.log(`Processamento: ${parsedTransactions.length} transações válidas, ${errors.length} erros`);

      // Mostra avisos mas não bloqueia se houver transações válidas
      if (errors.length > 0 && parsedTransactions.length === 0) {
        // Se não há transações válidas E há erros, mostra todos os erros
        setError(`Erro ao processar arquivo:\n${errors.slice(0, 20).join('\n')}${errors.length > 20 ? `\n... e mais ${errors.length - 20} erro(s)` : ''}`);
        return;
      } else if (errors.length > 0) {
        // Se há transações válidas mas também erros, mostra aviso
        setError(`Aviso: ${errors.length} linha(s) não puderam ser processadas, mas ${parsedTransactions.length} transação(ões) válida(s) foram encontradas. Você pode continuar com a importação.`);
      }

      if (parsedTransactions.length === 0) {
        setError('Nenhuma transação válida encontrada no arquivo. Verifique se o formato está correto (separador: ponto e vírgula) e se as colunas obrigatórias estão presentes.');
        return;
      }

      setTransactions(parsedTransactions);
      // Limpa erros se tiver transações válidas
      if (parsedTransactions.length > 0 && errors.length > 0) {
        // Mantém o aviso mas permite continuar
        setTimeout(() => setError(null), 5000); // Remove o aviso após 5 segundos
      }
    } catch (err) {
      console.error('Erro ao processar arquivo:', err);
      setError(err instanceof Error ? `Erro ao processar arquivo: ${err.message}` : 'Erro desconhecido ao processar arquivo. Verifique o console do navegador para mais detalhes.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleConfirmImport = useCallback(async () => {
    if (!selectedFile || transactions.length === 0 || !user) {
      return;
    }

    setLoading(true);
    setProgress(0);
    setError(null);
    setSuccess(null);
    setIsImporting(true);
    isImportingRef.current = true;

    try {
      // Cria registro de importação
      const importRecord: Import = {
        filename: selectedFile.name,
        rows_imported: 0,
        imported_at: new Date(),
        status: 'success',
        user_id: user.id,
        user_email: user.email || undefined,
      };

      const { data: importData, error: importError } = await createImport(importRecord);

      if (importError || !importData || !importData.id) {
        console.error('Erro ao criar registro de importação:', importError);
        const errorMessage = importError instanceof Error 
          ? importError.message 
          : typeof importError === 'object' && importError !== null && 'message' in importError
          ? String((importError as any).message)
          : 'Erro ao criar registro de importação. O registro não foi criado corretamente.';
        throw new Error(errorMessage);
      }

      // Atualiza transações com import_id
      const transactionsWithImportId = transactions.map((t) => ({
        ...t,
        import_id: importData.id,
      }));

      console.log(`Iniciando inserção de ${transactionsWithImportId.length} transações...`);
      
      // Insere transações com callback de progresso
      const result = await insertTransactions(transactionsWithImportId, (currentProgress) => {
        setProgress(currentProgress);
      });

      console.log('Resultado da importação:', {
        inserted: result.inserted,
        errors: result.errors,
        duplicates: result.duplicates,
        total: transactionsWithImportId.length
      });

      // Atualiza registro de importação
      const updateResult = await updateImport(importData.id, {
        rows_imported: result.inserted,
        status: result.errors > 0 ? (result.inserted > 0 ? 'partial' : 'error') : result.inserted > 0 ? 'success' : 'error',
      });

      if (updateResult.error) {
        console.error('Erro ao atualizar registro de importação:', updateResult.error);
      } else {
        console.log('Registro de importação atualizado:', updateResult.data);
      }

      setProgress(100);
      
      // Verifica se realmente inseriu algo
      if (result.inserted === 0 && result.errors === 0 && result.duplicates === transactionsWithImportId.length) {
        // Todas eram duplicatas
        setSuccess(
          `Importação concluída, mas nenhuma nova transação foi inserida. ` +
          `${result.duplicates} transação(ões) já existiam no banco (duplicatas ignoradas).`
        );
      } else if (result.inserted === 0 && result.errors === 0 && result.duplicates === 0) {
        // Nenhuma foi inserida e não houve erros ou duplicatas - problema grave
        setError(
          `Erro ao importar transações: Nenhuma transação foi inserida, mas também não houve erros ou duplicatas reportados. ` +
          `Isso pode indicar um problema com as permissões do banco de dados ou com os dados das transações. ` +
          `Verifique o console do navegador (F12) para mais detalhes.`
        );
      } else if (result.inserted === 0 && result.errors > 0) {
        // Erro na importação
        setError(
          `Erro ao importar transações: ${result.errors} erro(s) ocorreram. ` +
          `Nenhuma transação foi inserida. Verifique o console do navegador (F12) para mais detalhes.`
        );
      } else {
        setSuccess(
          `Importação concluída! ${result.inserted} transação(ões) inserida(s). ` +
          `${result.duplicates} duplicata(s) ignorada(s). ` +
          `${result.errors} erro(s).`
        );
      }

      // Limpa estado
      setSelectedFile(null);
      setTransactions([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao importar transações');
    } finally {
      setLoading(false);
      setProgress(0);
      setIsImporting(false);
      isImportingRef.current = false;
    }
  }, [selectedFile, transactions, user, setIsImporting]);

  const handleCancel = useCallback(() => {
    if (loading) {
      const confirmCancel = window.confirm(
        'Uma importação está em andamento. Se você cancelar agora, a importação será interrompida e os dados não serão salvos. Deseja realmente cancelar?'
      );
      if (!confirmCancel) {
        return;
      }
      // Cancela a importação (não há como cancelar async operations, mas marca como não importando)
      setIsImporting(false);
      setLoading(false);
      setProgress(0);
    }
    setSelectedFile(null);
    setTransactions([]);
    setError(null);
    setSuccess(null);
  }, [loading, setIsImporting]);

  // Adiciona listener para beforeunload (atualizar/fechar página)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Usa tanto o estado quanto a ref para garantir que funciona
      if (loading || isImporting || isImportingRef.current) {
        e.preventDefault();
        // Navegadores modernos mostram apenas uma mensagem padrão, mas ainda assim pedem confirmação
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [loading, isImporting]);

  // Limpa o estado de importação quando o componente desmonta (usuário sai da página)
  useEffect(() => {
    return () => {
      // Sempre limpa quando o componente desmonta
      setIsImporting(false);
      isImportingRef.current = false;
    };
  }, [setIsImporting]);

  // Garante que o estado seja limpo quando não há mais loading (importação finalizada)
  useEffect(() => {
    if (!loading && isImporting) {
      // Pequeno delay para garantir que a finalização foi processada
      const timer = setTimeout(() => {
        setIsImporting(false);
        isImportingRef.current = false;
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [loading, isImporting, setIsImporting]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Importar Planilha</h1>
        <p className="text-gray-600">Selecione um arquivo CSV para importar as transações</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Erro</p>
            <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">Sucesso</p>
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      {!transactions.length && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <FileUpload onFileSelect={handleFileSelect} acceptedFile={selectedFile} />
          {loading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processando arquivo...</span>
            </div>
          )}
        </div>
      )}

      {transactions.length > 0 && (
        <>
          <CSVPreview
            transactions={transactions}
            onConfirm={handleConfirmImport}
            onCancel={handleCancel}
            loading={loading}
          />
          
          {/* Barra de Progresso */}
          {loading && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg shadow-lg p-6 animate-pulse">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                  <h3 className="text-lg font-semibold text-gray-900">Importando transações...</h3>
                </div>
                <span className="text-lg font-bold text-indigo-600">{Math.round(progress)}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner mb-4 relative">
                <div
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2 relative z-10"
                  style={{ width: `${Math.max(progress, 5)}%` }}
                >
                  {progress > 15 && (
                    <span className="text-xs font-bold text-white drop-shadow">
                      {Math.round(progress)}%
                    </span>
                  )}
                </div>
                {/* Animação de brilho */}
                {progress > 0 && progress < 100 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none z-20"></div>
                )}
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">
                    ⚠️ Atenção: Importação em andamento
                  </p>
                  <p className="text-sm text-yellow-700">
                    Por favor, <strong>não saia desta página</strong> e <strong>não atualize</strong>. 
                    Se você sair ou atualizar agora, a importação será <strong>interrompida</strong> e os dados não serão salvos.
                  </p>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-gray-500 text-center">
                Processando {transactions.length} transação(ões)... {Math.min(Math.round(progress * transactions.length / 100), transactions.length)} de {transactions.length} concluída(s)
              </div>
            </div>
          )}
        </>
      )}

      <ImportHistory />
    </div>
  );
}
