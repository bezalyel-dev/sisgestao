import { useState, useEffect } from 'react';
import type { TransactionFilters } from '../../types';
import { Calendar, X } from 'lucide-react';

interface ReportFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
}

export function ReportFilters({ filters, onFiltersChange }: ReportFiltersProps) {
  const [localFilters, setLocalFilters] = useState<TransactionFilters>(filters);

  // Sincroniza quando os filtros externos mudam
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleDateChange = (field: 'dataInicio' | 'dataFim', value: Date | undefined) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleAdquirente = (adquirente: string) => {
    const current = localFilters.adquirentes || [];
    const updated = current.includes(adquirente)
      ? current.filter((a) => a !== adquirente)
      : [...current, adquirente];
    const newFilters = { ...localFilters, adquirentes: updated };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleModalidade = (modalidade: string) => {
    const current = localFilters.modalidades || [];
    const updated = current.includes(modalidade)
      ? current.filter((m) => m !== modalidade)
      : [...current, modalidade];
    const newFilters = { ...localFilters, modalidades: updated };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const cleared: TransactionFilters = {
      dataInicio: undefined,
      dataFim: undefined,
      adquirentes: [],
      modalidades: [],
    };
    setLocalFilters(cleared);
    onFiltersChange(cleared);
  };

  const hasActiveFilters = 
    localFilters.dataInicio || 
    localFilters.dataFim || 
    (localFilters.adquirentes && localFilters.adquirentes.length > 0) ||
    (localFilters.modalidades && localFilters.modalidades.length > 0);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filtros do Relatório</h3>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Limpar
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Período */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Período
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Data Início</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={
                    localFilters.dataInicio
                      ? localFilters.dataInicio.toISOString().split('T')[0]
                      : ''
                  }
                  onChange={(e) =>
                    handleDateChange('dataInicio', e.target.value ? new Date(e.target.value) : undefined)
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Data Fim</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={
                    localFilters.dataFim
                      ? localFilters.dataFim.toISOString().split('T')[0]
                      : ''
                  }
                  onChange={(e) =>
                    handleDateChange('dataFim', e.target.value ? new Date(e.target.value) : undefined)
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Adquirente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adquirente
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {['PAYTIME', 'PAGSEGURO', 'PAGSEGUR'].map((adq) => (
              <label key={adq} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={(localFilters.adquirentes || []).includes(adq)}
                  onChange={() => toggleAdquirente(adq)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{adq}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Modalidade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Modalidade de Pagamento
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {['DEBITO', 'CREDITO', 'PIX'].map((mod) => (
              <label key={mod} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={(localFilters.modalidades || []).includes(mod)}
                  onChange={() => toggleModalidade(mod)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{mod}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

