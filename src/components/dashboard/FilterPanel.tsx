import { useState, useEffect } from 'react';
import type { TransactionFilters } from '../../types';
import { Calendar, X, Clock } from 'lucide-react';

interface FilterPanelProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
}

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<TransactionFilters>(filters);

  // Atualiza filtros locais quando props mudam
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    const cleared: TransactionFilters = {
      dataInicio: undefined,
      dataFim: undefined,
      horaInicio: undefined,
      horaFim: undefined,
      adquirentes: [],
      modalidades: [],
    };
    setLocalFilters(cleared);
    onFiltersChange(cleared);
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

  const handleDateChange = (field: 'dataInicio' | 'dataFim', value: Date | undefined) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-md lg:shadow-lg p-4 lg:p-6 lg:sticky lg:top-4 lg:self-start">
      <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Filtros</h3>

      <div className="space-y-4 lg:space-y-6">
        {/* Filtro de Data */}
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
            Período
          </label>
          <div className="grid grid-cols-2 gap-2 lg:gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Data Início</label>
              <div className="relative">
                <Calendar className="absolute left-2 lg:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-gray-400" />
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
                  className="w-full pl-8 lg:pl-10 pr-2 lg:pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Data Fim</label>
              <div className="relative">
                <Calendar className="absolute left-2 lg:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-gray-400" />
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
                  className="w-full pl-8 lg:pl-10 pr-2 lg:pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filtro de Hora */}
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
            Horário
          </label>
          <div className="grid grid-cols-2 gap-2 lg:gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Hora Início</label>
              <div className="relative">
                <Clock className="absolute left-2 lg:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-gray-400 z-10" />
                <input
                  type="time"
                  value={localFilters.horaInicio || ''}
                  onChange={(e) => {
                    const newFilters = { ...localFilters, horaInicio: e.target.value || undefined };
                    setLocalFilters(newFilters);
                    onFiltersChange(newFilters);
                  }}
                  className="w-full pl-8 lg:pl-10 pr-4 lg:pr-6 py-2.5 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-gray-50 font-medium text-gray-900"
                  style={{ 
                    minWidth: '120px', 
                    letterSpacing: '0.025em',
                    colorScheme: 'light'
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Hora Fim</label>
              <div className="relative">
                <Clock className="absolute left-2 lg:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 lg:w-4 lg:h-4 text-gray-400 z-10" />
                <input
                  type="time"
                  value={localFilters.horaFim || ''}
                  onChange={(e) => {
                    const newFilters = { ...localFilters, horaFim: e.target.value || undefined };
                    setLocalFilters(newFilters);
                    onFiltersChange(newFilters);
                  }}
                  className="w-full pl-8 lg:pl-10 pr-4 lg:pr-6 py-2.5 lg:py-3 text-sm lg:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-gray-50 font-medium text-gray-900"
                  style={{ 
                    minWidth: '120px', 
                    letterSpacing: '0.025em',
                    colorScheme: 'light'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filtro de Adquirente */}
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
            Adquirente
          </label>
          <div className="space-y-2">
            {['PAYTIME', 'PAGSEGURO', 'PAGSEGUR'].map((adq) => (
              <label key={adq} className="flex items-center cursor-pointer hover:bg-gray-50 rounded p-1 -m-1 transition">
                <input
                  type="checkbox"
                  checked={(localFilters.adquirentes || []).includes(adq)}
                  onChange={() => toggleAdquirente(adq)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-xs lg:text-sm text-gray-700">{adq}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Filtro de Modalidade */}
        <div>
          <label className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
            Modalidade
          </label>
          <div className="space-y-2">
            {['DEBITO', 'CREDITO', 'PIX'].map((mod) => (
              <label key={mod} className="flex items-center cursor-pointer hover:bg-gray-50 rounded p-1 -m-1 transition">
                <input
                  type="checkbox"
                  checked={(localFilters.modalidades || []).includes(mod)}
                  onChange={() => toggleModalidade(mod)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-xs lg:text-sm text-gray-700">{mod}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 pt-3 lg:pt-4 border-t border-gray-200">
          <button
            onClick={handleApplyFilters}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium text-sm lg:text-base shadow-md hover:shadow-lg"
          >
            Aplicar Filtros
          </button>
          <button
            onClick={handleClearFilters}
            className="sm:flex-initial px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2 text-sm lg:text-base"
          >
            <X className="w-4 h-4" />
            <span className="sm:hidden lg:inline">Limpar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
