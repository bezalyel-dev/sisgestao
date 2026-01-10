import { useState, useCallback } from 'react';
import { FileUpload } from '../components/import/FileUpload';
import { CSVPreview } from '../components/import/CSVPreview';
import { ImportHistory } from '../components/import/ImportHistory';
import { processCSV } from '../utils/csvParser';
import { insertTransactions } from '../services/transactions';
import { createImport, updateImport } from '../services/imports';
import { useAuth } from '../hooks/useAuth';
import type { Transaction, Import } from '../types';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export function ImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuth();

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
    setError(null);
    setSuccess(null);

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

      if (importError || !importData) {
        console.error('Erro ao criar registro de importação:', importError);
        const errorMessage = importError instanceof Error 
          ? importError.message 
          : typeof importError === 'object' && importError !== null && 'message' in importError
          ? String((importError as any).message)
          : 'Erro desconhecido ao criar registro de importação';
        throw new Error(`Erro ao criar registro de importação: ${errorMessage}`);
      }

      // Atualiza transações com import_id
      const transactionsWithImportId = transactions.map((t) => ({
        ...t,
        import_id: importData.id,
      }));

      // Insere transações
      const result = await insertTransactions(transactionsWithImportId);

      // Atualiza registro de importação
      await updateImport(importData.id, {
        rows_imported: result.inserted,
        status: result.errors > 0 ? (result.inserted > 0 ? 'partial' : 'error') : 'success',
      });

      setSuccess(
        `Importação concluída! ${result.inserted} transação(ões) inserida(s). ` +
        `${result.duplicates} duplicata(s) ignorada(s). ` +
        `${result.errors} erro(s).`
      );

      // Limpa estado
      setSelectedFile(null);
      setTransactions([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao importar transações');
    } finally {
      setLoading(false);
    }
  }, [selectedFile, transactions, user]);

  const handleCancel = useCallback(() => {
    setSelectedFile(null);
    setTransactions([]);
    setError(null);
    setSuccess(null);
  }, []);

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
        <CSVPreview
          transactions={transactions}
          onConfirm={handleConfirmImport}
          onCancel={handleCancel}
          loading={loading}
        />
      )}

      <ImportHistory />
    </div>
  );
}
