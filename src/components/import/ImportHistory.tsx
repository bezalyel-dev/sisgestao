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

  const getStatusIcon = (status: Import['status']) => {
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

  const getStatusLabel = (status: Import['status']) => {
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
        {imports.map((importItem) => (
          <div
            key={importItem.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3 flex-1">
              {getStatusIcon(importItem.status)}
              <div className="flex-1">
                <p className="font-medium text-gray-900">{importItem.filename}</p>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-sm text-gray-500">
                    {formatBrazilianDate(importItem.imported_at)}
                  </p>
                  {importItem.user_email && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{importItem.user_email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {importItem.rows_imported} linha(s)
                </p>
                <p className="text-xs text-gray-500">{getStatusLabel(importItem.status)}</p>
              </div>
              {importItem.status === 'success' && importItem.id && (
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
        ))}
      </div>
    </div>
  );
}
