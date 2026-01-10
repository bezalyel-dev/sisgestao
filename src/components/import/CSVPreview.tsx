import { useState } from 'react';
import type { Transaction } from '../../types';
import { formatBrazilianDate } from '../../utils/dateUtils';
import { formatBrazilianCurrency as formatCurrency } from '../../utils/currencyUtils';
import { Check, X, Loader2 } from 'lucide-react';

interface CSVPreviewProps {
  transactions: Transaction[];
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function CSVPreview({ transactions, onConfirm, onCancel, loading }: CSVPreviewProps) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm();
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Preview dos Dados
        </h3>
        <p className="text-sm text-gray-600">
          {transactions.length} transação(ões) encontrada(s). Revise antes de confirmar.
        </p>
      </div>

      <div className="mb-6 max-h-96 overflow-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estabelecimento
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modalidade
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Adquirente
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor Bruto
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valor Líquido
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.slice(0, 10).map((transaction, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {formatBrazilianDate(transaction.data_transacao)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {transaction.estabelecimento}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.modalidade === 'PIX' ? 'bg-purple-100 text-purple-800' :
                    transaction.modalidade === 'CREDITO' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {transaction.modalidade}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {transaction.adquirente}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(transaction.valor_bruto)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(transaction.valor_liquido)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length > 10 && (
          <div className="px-4 py-3 bg-gray-50 text-sm text-gray-600 text-center">
            ... e mais {transactions.length - 10} transação(ões)
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onCancel}
          disabled={confirming || loading}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <X className="w-4 h-4 inline mr-2" />
          Cancelar
        </button>
        <button
          onClick={handleConfirm}
          disabled={confirming || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center"
        >
          {confirming || loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Importando...
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Confirmar Importação
            </>
          )}
        </button>
      </div>
    </div>
  );
}
