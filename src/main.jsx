import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BarChart3,
  CalendarClock,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  RefreshCw,
  WalletCards,
  Tags
} from 'lucide-react';
import './app.css';

import useAuth from './hooks/useAuth';
import useMonthData from './hooks/useMonthData';

import AuthScreen from './screens/AuthScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import DashboardScreen from './screens/DashboardScreen';
import BudgetsScreen from './screens/BudgetsScreen';
import RecurringScreen from './screens/RecurringScreen';
import WalletsScreen from './screens/WalletsScreen';
import CategoriesScreen from './screens/CategoriesScreen';

import Message from './components/Message';

function viewTitle(activeView) {
  if (activeView === 'dashboard') return 'Tong quan thang';
  if (activeView === 'budgets') return 'Ngan sach';
  if (activeView === 'recurring') return 'Giao dich dinh ky';
  if (activeView === 'wallets') return 'Vi cua toi';
  if (activeView === 'categories') return 'Danh muc chi tieu';
  return 'Giao dich';
}

function App() {
  const { user, setUser, booting, logout } = useAuth();
  const [activeView, setActiveView] = useState('transactions');
  
  const {
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
  } = useMonthData();

  useEffect(() => {
    if (user) {
      loadReferenceData();
      loadMonthData(month);
    }
  }, [user, month, loadReferenceData, loadMonthData]);

  const handleAuthenticated = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    await logout();
    clearData();
  };

  const changeMonth = async (nextMonth) => {
    setMonth(nextMonth);
  };

  if (booting) {
    return (
      <main className="loading-screen">
        <div className="brand-mark">₫</div>
        <p>Dang tai du lieu...</p>
      </main>
    );
  }

  if (!user) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  const context = {
    categories,
    wallets,
    transactions,
    transactionsMeta,
    dashboard,
    budgets,
    recurringTransactions,
    month,
    loading,
    reload: async (page = 1, pageSize = 50) => {
      await loadReferenceData();
      await loadMonthData(month, page, pageSize);
    },
    setToast
  };

  return (
    <main className="workspace-shell">
      <aside className="workspace-sidebar">
        <div className="workspace-brand">
          <div className="brand-mark compact-mark">₫</div>
          <div>
            <strong>Expense Manager</strong>
            <p>{user.name}</p>
          </div>
        </div>
        <nav className="app-nav" aria-label="Man hinh">
          {[
            { id: 'transactions', label: 'Giao dich', icon: ReceiptText },
            { id: 'dashboard', label: 'Tong quan', icon: LayoutDashboard },
            { id: 'budgets', label: 'Ngan sach', icon: BarChart3 },
            { id: 'recurring', label: 'Dinh ky', icon: CalendarClock },
            { id: 'wallets', label: 'Vi', icon: WalletCards },
            { id: 'categories', label: 'Danh muc', icon: Tags }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={activeView === item.id ? 'active' : ''}
                key={item.id}
                onClick={() => setActiveView(item.id)}
                type="button"
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <button className="logout-control" onClick={handleLogout} type="button">
          <LogOut size={18} />
          <span>Dang xuat</span>
        </button>
      </aside>

      <section className="workspace-content">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">So giao dich</p>
            <h2>{viewTitle(activeView)}</h2>
          </div>
          <div className="header-actions">
            <label className="month-picker">
              <span>Thang</span>
              <input onChange={(event) => changeMonth(event.target.value)} type="month" value={month} />
            </label>
            <button className="icon-button" disabled={loading} onClick={() => loadMonthData(month)} title="Tai lai" type="button">
              <RefreshCw size={18} />
            </button>
          </div>
        </header>

        {toast ? <Message value={toast} variant="success" /> : null}
        {activeView === 'transactions' ? <TransactionsScreen {...context} /> : null}
        {activeView === 'dashboard' ? <DashboardScreen {...context} /> : null}
        {activeView === 'budgets' ? <BudgetsScreen {...context} /> : null}
        {activeView === 'recurring' ? <RecurringScreen {...context} /> : null}
        {activeView === 'wallets' ? <WalletsScreen {...context} /> : null}
        {activeView === 'categories' ? <CategoriesScreen {...context} /> : null}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
