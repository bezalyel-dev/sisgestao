import { useState } from 'react';
import { FilterPanel } from '../components/dashboard/FilterPanel';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { TransactionsTable } from '../components/dashboard/TransactionsTable';
import { useTransactions } from '../hooks/useTransactions';
import type { TransactionFilters } from '../types';

export function DashboardPage() {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const { transactions, summary, loading, error, totalCount } = useTransactions(
    filters,
    page,
    pageSize
  );

  return (
    <div className="space-y-4 lg:space-y-6 pb-4 lg:pb-6 lg:h-full lg:flex lg:flex-col lg:min-h-0">
      {/* Conteúdo fixo no topo */}
      <div className="space-y-4 lg:space-y-6 lg:flex-shrink-0">
        <div className="lg:mt-0 mt-2">
          <p className="text-xs lg:text-sm text-gray-600">
            Visualize e filtre todas as transações importadas
          </p>
        </div>

        {error && (
          <div className="p-3 lg:p-4 bg-red-50 border border-red-200 rounded-lg text-sm lg:text-base text-red-800">
            Erro ao carregar transações: {error.message}
          </div>
        )}

        <SummaryCards summary={summary} loading={loading} />
      </div>

      {/* Área de filtros e transações - Mobile: coluna, Desktop: grid */}
      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 lg:gap-6 lg:flex-1 lg:min-h-0">
        {/* Filtros - Aparecem primeiro no mobile, fixos no desktop */}
        <div className="flex-shrink-0 lg:col-span-1 lg:sticky lg:top-4 lg:self-start lg:h-fit">
          <FilterPanel filters={filters} onFiltersChange={(newFilters) => {
            setFilters(newFilters);
            setPage(1); // Reset para primeira página ao mudar filtros
          }} />
        </div>
        {/* Transações - Aparecem logo abaixo dos filtros no mobile */}
        <div className="lg:col-span-3 lg:flex lg:flex-col lg:min-h-0 lg:flex-1">
          <TransactionsTable
            transactions={transactions}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
