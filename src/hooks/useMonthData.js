import { useState, useCallback } from 'react';
import { listCategories, listWallets } from '../api/reference';
import { listTransactions } from '../api/transactions';
import { getDashboard } from '../api/dashboard';
import { listBudgets } from '../api/budgets';
import { listRecurringTransactions } from '../api/recurring';
import { currentMonth } from '../utils/formatters';

export default function useMonthData() {
  const [month, setMonth] = useState(currentMonth());
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [transactionsMeta, setTransactionsMeta] = useState({ page: 1, pageSize: 50, total: 0, totalPages: 1 });
  const [dashboard, setDashboard] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const loadReferenceData = useCallback(async () => {
    try {
      const [categoryData, walletData] = await Promise.all([
        listCategories(),
        listWallets()
      ]);
      setCategories(categoryData.categories || []);
      setWallets(walletData.wallets || []);
    } catch (error) {
      console.error('Failed to load reference data:', error);
    }
  }, []);

  const loadMonthData = useCallback(async (nextMonth = month, page = 1, pageSize = 50) => {
    setLoading(true);
    try {
      const recurringData = await listRecurringTransactions();
      setRecurringTransactions(recurringData.recurringTransactions || []);
      if (recurringData.generatedCount > 0) {
        setToast(`Da tao ${recurringData.generatedCount} giao dich dinh ky den han.`);
      }

      const [transactionData, dashboardData, budgetData] = await Promise.all([
        listTransactions(nextMonth, page, pageSize),
        getDashboard(nextMonth),
        listBudgets(nextMonth)
      ]);
      setTransactions(transactionData.transactions || []);
      setTransactionsMeta(transactionData.meta || { page, pageSize, total: 0, totalPages: 1 });
      setDashboard(dashboardData.dashboard || null);
      setBudgets(budgetData.budgets || []);
    } catch (error) {
      console.error('Failed to load monthly data:', error);
    } finally {
      setLoading(false);
    }
  }, [month]);

  const clearData = useCallback(() => {
    setTransactions([]);
    setTransactionsMeta({ page: 1, pageSize: 50, total: 0, totalPages: 1 });
    setDashboard(null);
    setBudgets([]);
    setRecurringTransactions([]);
  }, []);

  return {
    month,
    setMonth,
    categories,
    wallets,
    transactions,
    transactionsMeta,
    dashboard,
    budgets,
    recurringTransactions,
    loading,
    toast,
    setToast,
    loadReferenceData,
    loadMonthData,
    clearData
  };
}
