import type { TransactionSummary } from '../../types';
import { formatBrazilianCurrency } from '../../utils/currencyUtils';
import { TrendingUp, DollarSign, FileText, TrendingDown } from 'lucide-react';

interface ReportSummaryProps {
  summary: TransactionSummary;
  loading?: boolean;
}

export function ReportSummary({ summary, loading }: ReportSummaryProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
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

  const taxaMedia = summary.totalTransacoes > 0
    ? ((summary.valorBrutoTotal - summary.valorLiquidoTotal) / summary.valorBrutoTotal * 100)
    : 0;

  const cards = [
    {
      title: 'Total de Transações',
      value: summary.totalTransacoes.toLocaleString('pt-BR'),
      icon: FileText,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Valor Bruto Total',
      value: formatBrazilianCurrency(summary.valorBrutoTotal),
      icon: DollarSign,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Valor Líquido Total',
      value: formatBrazilianCurrency(summary.valorLiquidoTotal),
      icon: TrendingUp,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Taxa Média',
      value: `${taxaMedia.toFixed(2)}%`,
      subValue: formatBrazilianCurrency(summary.valorBrutoTotal - summary.valorLiquidoTotal),
      icon: TrendingDown,
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`w-5 h-5 ${card.textColor}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            {card.subValue && (
              <p className="text-xs text-gray-500 mt-1">Desconto: {card.subValue}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

