import { useState } from 'react';
import { ReportFilters } from '../components/reports/ReportFilters';
import { ReportSummary } from '../components/reports/ReportSummary';
import { useTransactions } from '../hooks/useTransactions';
import { getAllTransactions } from '../services/transactions';
import { transactionsToCSV, downloadCSV } from '../utils/exportUtils';
import { formatBrazilianDateOnly } from '../utils/dateUtils';
import type { TransactionFilters } from '../types';
import { 
  Download, 
  FileText, 
  AlertCircle, 
  Loader2, 
  BarChart3, 
  PieChart,
  TrendingUp,
  Calendar,
  Filter
} from 'lucide-react';

export function ReportsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [exporting, setExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const { summary, loading, error, totalCount } = useTransactions(
    filters,
    1,
    50
  );

  const handleExport = async (format: 'csv' = 'csv') => {
    setExporting(true);
    try {
      const { data: allTransactions, error: exportError } = await getAllTransactions(filters);

      if (exportError || !allTransactions || allTransactions.length === 0) {
        alert('Não há transações para exportar com os filtros selecionados.');
        return;
      }

      if (format === 'csv') {
        const csvContent = transactionsToCSV(allTransactions);
        const dateStr = new Date().toISOString().split('T')[0];
        const filterStr = filters.dataInicio || filters.dataFim 
          ? `_${filters.dataInicio ? formatBrazilianDateOnly(filters.dataInicio) : ''}_${filters.dataFim ? formatBrazilianDateOnly(filters.dataFim) : ''}`
          : '';
        const filename = `relatorio_transacoes_${dateStr}${filterStr}.csv`;
        
        downloadCSV(csvContent, filename);
      }
    } catch (err) {
      console.error('Erro ao exportar relatório:', err);
      alert('Erro ao exportar relatório. Tente novamente.');
    } finally {
      setExporting(false);
    }
  };

  const hasActiveFilters = 
    filters.dataInicio || 
    filters.dataFim || 
    (filters.adquirentes && filters.adquirentes.length > 0) ||
    (filters.modalidades && filters.modalidades.length > 0);

  return (
    <div className="space-y-4 lg:space-y-6 pb-4 lg:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-4 lg:p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">Relatórios e Análises</h1>
            <p className="text-indigo-100 text-sm lg:text-base">
              Gere relatórios detalhados e exporte dados das transações
            </p>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition ${
                showFilters ? 'bg-indigo-700' : 'bg-white/20 hover:bg-white/30'
              }`}
              title="Mostrar/Ocultar Filtros"
            >
              <Filter className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting || totalCount === 0 || loading}
              className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm lg:text-base"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" />
                  <span className="hidden sm:inline">Exportando...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="hidden sm:inline">Exportar Relatório CSV</span>
                  <span className="sm:hidden">Exportar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 lg:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Erro</p>
            <p className="text-sm text-red-700">{error.message}</p>
          </div>
        </div>
      )}

      {/* Filtros (Collapsível) */}
      {showFilters && (
        <ReportFilters 
          filters={filters} 
          onFiltersChange={(newFilters) => {
            setFilters(newFilters);
          }} 
        />
      )}

      {/* Resumo do Relatório */}
      <ReportSummary summary={summary} loading={loading} />

      {/* Informações do Relatório */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md lg:shadow-lg p-4 lg:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs lg:text-sm text-gray-600">Total de Registros</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900">
                {loading ? '...' : totalCount.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {hasActiveFilters ? 'Com filtros aplicados' : 'Todas as transações'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md lg:shadow-lg p-4 lg:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs lg:text-sm text-gray-600">Período do Relatório</p>
              <p className="text-xs lg:text-sm font-medium text-gray-900">
                {filters.dataInicio && filters.dataFim
                  ? `${formatBrazilianDateOnly(filters.dataInicio)} até ${formatBrazilianDateOnly(filters.dataFim)}`
                  : filters.dataInicio
                  ? `A partir de ${formatBrazilianDateOnly(filters.dataInicio)}`
                  : filters.dataFim
                  ? `Até ${formatBrazilianDateOnly(filters.dataFim)}`
                  : 'Período completo'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowFilters(true)}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Alterar período
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md lg:shadow-lg p-4 lg:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs lg:text-sm text-gray-600">Formato de Exportação</p>
              <p className="text-xs lg:text-sm font-medium text-gray-900">CSV (Excel)</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Compatível com planilhas</p>
        </div>
      </div>

      {/* Ações e Informações */}
      <div className="bg-white rounded-lg shadow-md lg:shadow-lg p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Informações do Relatório</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <h4 className="text-xs lg:text-sm font-medium text-gray-700 mb-2 lg:mb-3">Filtros Aplicados</h4>
            <div className="space-y-2">
              {!hasActiveFilters ? (
                <p className="text-xs lg:text-sm text-gray-500">Nenhum filtro aplicado - mostrando todas as transações</p>
              ) : (
                <>
                  {(filters.adquirentes && filters.adquirentes.length > 0) && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-xs lg:text-sm font-medium text-gray-600">Adquirentes:</span>
                      <div className="flex gap-1 flex-wrap">
                        {filters.adquirentes.map((adq) => (
                          <span key={adq} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                            {adq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(filters.modalidades && filters.modalidades.length > 0) && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-xs lg:text-sm font-medium text-gray-600">Modalidades:</span>
                      <div className="flex gap-1 flex-wrap">
                        {filters.modalidades.map((mod) => (
                          <span 
                            key={mod} 
                            className={`px-2 py-1 text-xs rounded-full ${
                              mod === 'PIX' ? 'bg-purple-100 text-purple-800' :
                              mod === 'CREDITO' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}
                          >
                            {mod}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-xs lg:text-sm font-medium text-gray-700 mb-2 lg:mb-3">Instruções de Exportação</h4>
            <ul className="space-y-2 text-xs lg:text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <Calendar className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                <span>Configure os filtros desejados antes de exportar</span>
              </li>
              <li className="flex items-start gap-2">
                <Download className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                <span>O arquivo CSV será baixado automaticamente</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                <span>O relatório incluirá todas as colunas das transações</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mensagem quando não há dados */}
      {!loading && totalCount === 0 && (
        <div className="bg-white rounded-lg shadow-md lg:shadow-lg p-8 lg:p-12 text-center">
          <PieChart className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-base lg:text-lg font-medium text-gray-900 mb-2">Nenhuma transação encontrada</p>
          <p className="text-sm text-gray-600 mb-4">
            {hasActiveFilters 
              ? 'Tente ajustar os filtros para encontrar transações' 
              : 'Não há transações cadastradas no sistema'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={() => setFilters({})}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition shadow-md hover:shadow-lg"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
