import type { Transaction } from '../../types';
import { formatBrazilianDate, formatTime } from '../../utils/dateUtils';
import { formatBrazilianCurrency } from '../../utils/currencyUtils';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface TransactionsTableProps {
  transactions: Transaction[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export function TransactionsTable({
  transactions,
  totalCount,
  page,
  pageSize,
  onPageChange,
  loading,
}: TransactionsTableProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md lg:shadow-lg flex items-center justify-center min-h-[300px] lg:min-h-[400px] p-8">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md lg:shadow-lg flex items-center justify-center min-h-[300px] lg:min-h-[400px] p-8">
        <div className="text-center text-gray-500">
          <p className="text-sm lg:text-base font-medium mb-2">Nenhuma transação encontrada</p>
          <p className="text-xs lg:text-sm text-gray-400">
            Não há vendas para os filtros selecionados. Tente ajustar os filtros de data, hora, adquirente ou modalidade.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md lg:shadow-lg overflow-hidden flex flex-col lg:h-full">
      {/* Desktop Table */}
      <div className="hidden lg:flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Área de scroll da tabela - sem paginação aqui */}
        <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Estabelecimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Modalidade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Adquirente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Bandeira
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Valor Bruto
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Valor Líquido
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatBrazilianDate(transaction.data_transacao)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTime(transaction.data_transacao)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">{transaction.estabelecimento}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.modalidade === 'PIX'
                          ? 'bg-purple-100 text-purple-800'
                          : transaction.modalidade === 'CREDITO'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {transaction.modalidade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.adquirente}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.bandeira || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    {formatBrazilianCurrency(transaction.valor_bruto)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    {formatBrazilianCurrency(transaction.valor_liquido)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Paginação Desktop - Fixa na parte inferior */}
        {totalPages > 1 && (
          <div className="flex-shrink-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-row items-center justify-between gap-3">
            <div className="text-sm text-gray-700">
              Mostrando {(page - 1) * pageSize + 1} até{' '}
              {Math.min(page * pageSize, totalCount)} de {totalCount} transações
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 text-sm text-gray-700 whitespace-nowrap">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Cards - Aparecem normalmente em coluna */}
      <div className="lg:hidden w-full">
        {/* Lista de cards das transações */}
        <div>
          {transactions.map((transaction) => (
            <div key={transaction.id} className="p-4 hover:bg-gray-50 transition border-b border-gray-200 last:border-b-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 pr-2">
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {formatBrazilianDate(transaction.data_transacao)} às {formatTime(transaction.data_transacao)}
                  </div>
                  <div className="text-xs text-gray-600 mb-2">{transaction.estabelecimento}</div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
                    transaction.modalidade === 'PIX'
                      ? 'bg-purple-100 text-purple-800'
                      : transaction.modalidade === 'CREDITO'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {transaction.modalidade}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Adquirente</div>
                  <div className="font-medium text-gray-900 text-sm">{transaction.adquirente}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Bandeira</div>
                  <div className="font-medium text-gray-900 text-sm">{transaction.bandeira || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Valor Bruto</div>
                  <div className="font-medium text-gray-900 text-sm">{formatBrazilianCurrency(transaction.valor_bruto)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Valor Líquido</div>
                  <div className="font-medium text-green-600 text-sm">{formatBrazilianCurrency(transaction.valor_liquido)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Paginação Mobile */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-3 py-3 border-t border-gray-200 flex flex-col items-center justify-between gap-3 mt-4">
            <div className="text-xs text-gray-700 text-center">
              Mostrando {(page - 1) * pageSize + 1} até{' '}
              {Math.min(page * pageSize, totalCount)} de {totalCount} transações
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-2 text-xs text-gray-700 whitespace-nowrap">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
