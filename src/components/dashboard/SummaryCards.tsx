import type { TransactionSummary } from '../../types';
import { formatBrazilianCurrency } from '../../utils/currencyUtils';
import { TrendingUp, DollarSign, FileText } from 'lucide-react';

interface SummaryCardsProps {
  summary: TransactionSummary;
  loading?: boolean;
}

export function SummaryCards({ summary, loading }: SummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-lg p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total de Transações',
      value: summary.totalTransacoes.toLocaleString('pt-BR'),
      icon: FileText,
      color: 'blue',
    },
    {
      title: 'Valor Bruto Total',
      value: formatBrazilianCurrency(summary.valorBrutoTotal),
      icon: DollarSign,
      color: 'green',
    },
    {
      title: 'Valor Líquido Total',
      value: formatBrazilianCurrency(summary.valorLiquidoTotal),
      icon: TrendingUp,
      color: 'purple',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white rounded-lg shadow-md lg:shadow-lg p-4 lg:p-6 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h3 className="text-xs lg:text-sm font-medium text-gray-600">{card.title}</h3>
              <div className={`p-2 rounded-lg ${colorClasses[card.color as keyof typeof colorClasses]}`}>
                <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
              </div>
            </div>
            <p className="text-xl lg:text-2xl font-bold text-gray-900 break-words">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}
