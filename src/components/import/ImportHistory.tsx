import { useEffect, useState } from 'react';
import type { Import } from '../../types';
import { getImportHistory } from '../../services/imports';
import { getTransactionsByImportId } from '../../services/transactions';
import { formatBrazilianDate } from '../../utils/dateUtils';
import { transactionsToCSV, downloadCSV } from '../../utils/exportUtils';
import { Clock, FileText, CheckCircle, XCircle, AlertCircle, Loader2, Download, User } from 'lucide-react';

export function ImportHistory() {
  const [imports, setImports] = useState<Import[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    const { data, error } = await getImportHistory(10);
    if (!error && data) {
      setImports(data);
    }
    setLoading(false);
  };

  const getStatusIcon = (status: Import['status'], rowsImported: number) => {
    // Se não importou nenhuma linha, trata como erro
    if (rowsImported === 0) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'partial':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: Import['status'], rowsImported: number) => {
    // Se não importou nenhuma linha, trata como erro
    if (rowsImported === 0) {
      return 'Falhou - Nenhuma linha importada';
    }
    
    switch (status) {
      case 'success':
        return 'Sucesso';
      case 'error':
        return 'Erro';
      case 'partial':
        return 'Parcial';
      default:
        return 'Desconhecido';
    }
  };

  const isImportFailed = (importItem: Import) => {
    return importItem.rows_imported === 0 || importItem.status === 'error';
  };

  const handleDownload = async (importItem: Import) => {
    if (!importItem.id) return;

    try {
      const { data: transactions, error } = await getTransactionsByImportId(importItem.id);
      
      if (error || !transactions || transactions.length === 0) {
        alert('Não foi possível baixar as transações. Tente novamente.');
        return;
      }

      const csvContent = transactionsToCSV(transactions);
      const filename = importItem.filename || `importacao_${importItem.id}.csv`;
      downloadCSV(csvContent, filename);
    } catch (error) {
      console.error('Erro ao fazer download:', error);
      alert('Erro ao fazer download das transações.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (imports.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>Nenhuma importação realizada ainda</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Importações</h3>
      <div className="space-y-3">
        {imports.map((importItem) => {
          const failed = isImportFailed(importItem);
          
          return (
            <div
              key={importItem.id}
              className={`flex items-center justify-between p-4 border rounded-lg transition ${
                failed
                  ? 'border-red-200 bg-red-50 hover:bg-red-100'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                {getStatusIcon(importItem.status, importItem.rows_imported)}
                <div className="flex-1">
                  <p className={`font-medium ${failed ? 'text-red-900' : 'text-gray-900'}`}>
                    {importItem.filename}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <p className={`text-sm ${failed ? 'text-red-700' : 'text-gray-500'}`}>
                      {formatBrazilianDate(importItem.imported_at)}
                    </p>
                    {importItem.user_email && (
                      <div className={`flex items-center gap-1 text-sm ${failed ? 'text-red-600' : 'text-gray-600'}`}>
                        <User className="w-4 h-4" />
                        <span>{importItem.user_email}</span>
                      </div>
                    )}
                  </div>
                  {failed && (
                    <p className="text-xs text-red-600 font-medium mt-1">
                      ⚠️ Esta planilha não foi importada corretamente
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`text-sm font-medium ${failed ? 'text-red-900' : 'text-gray-900'}`}>
                    {importItem.rows_imported} linha(s)
                  </p>
                  <p className={`text-xs font-medium ${
                    failed 
                      ? 'text-red-700' 
                      : importItem.status === 'success'
                      ? 'text-green-600'
                      : importItem.status === 'partial'
                      ? 'text-yellow-600'
                      : 'text-gray-500'
                  }`}>
                    {getStatusLabel(importItem.status, importItem.rows_imported)}
                  </p>
                </div>
                {!failed && importItem.status === 'success' && importItem.id && importItem.rows_imported > 0 && (
                  <button
                    onClick={() => handleDownload(importItem)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center gap-2"
                    title="Baixar planilha importada"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
