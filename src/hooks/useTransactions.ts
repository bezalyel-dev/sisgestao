import { useState, useEffect, useCallback } from 'react';
import type { Transaction, TransactionFilters, TransactionSummary } from '../types';
import { getTransactions, getTransactionSummary as getSummary } from '../services/transactions';

export function useTransactions(filters?: TransactionFilters, page = 1, pageSize = 50) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>({
    totalTransacoes: 0,
    valorBrutoTotal: 0,
    valorLiquidoTotal: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [transactionsResult, summaryResult] = await Promise.all([
        getTransactions(filters, page, pageSize),
        getSummary(filters),
      ]);

      if (transactionsResult.error) {
        setError(transactionsResult.error);
        return;
      }

      if (summaryResult.error) {
        setError(summaryResult.error);
        return;
      }

      setTransactions(transactionsResult.data);
      setTotalCount(transactionsResult.count);
      
      if (summaryResult.data) {
        setSummary(summaryResult.data);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    summary,
    loading,
    error,
    totalCount,
    refetch: fetchTransactions,
  };
}
