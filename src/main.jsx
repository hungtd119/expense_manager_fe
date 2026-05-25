import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BarChart3,
  CalendarClock,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  RefreshCw,
  WalletCards
} from 'lucide-react';
import './app.css';

const tokenKey = 'expense_manager_token';

const moneyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
});

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonth() {
  return todayDate().slice(0, 7);
}

function currentDateTimeLocal() {
  const date = new Date();
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function formatDateTimeLocal(value) {
  if (!value) return 'Chua dat lich';
  const normalized = value.includes('T') ? value : `${value}T00:00`;
  const [datePart, timePart = '00:00'] = normalized.split('T');
  const [year, month, day] = datePart.split('-');
  const [hour, minute] = timePart.split(':');
  if (!year || !month || !day || !hour || !minute) return value;
  return `${day}/${month}/${year} ${hour}:${minute}`;
}

function frequencyLabel(frequency) {
  if (frequency === 'daily') return 'Hang ngay';
  if (frequency === 'weekly') return 'Hang tuan';
  return 'Hang thang';
}

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem(tokenKey);
  const response = await fetch(path, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Co loi xay ra.');
  }
  return data;
}

function Message({ value, variant = 'error' }) {
  return <p className={`form-message ${variant === 'success' ? 'success' : ''}`} role="status">{value}</p>;
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [messageVariant, setMessageVariant] = useState('error');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const payload = { email: form.email, password: form.password };
      if (mode === 'register') payload.name = form.name;
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const data = await apiRequest(endpoint, { method: 'POST', body: JSON.stringify(payload) });
      localStorage.setItem(tokenKey, data.token);
      setMessageVariant('success');
      setMessage(mode === 'register' ? 'Dang ky thanh cong.' : 'Dang nhap thanh cong.');
      onAuthenticated(data.user);
    } catch (error) {
      setMessageVariant('error');
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="app-shell auth-shell">
      <section className="brand-panel" aria-label="Tong quan san pham">
        <div className="brand-mark">₫</div>
        <h1>Expense Manager</h1>
        <p>Ghi thu chi nhanh, xem lai giao dich theo thang va giu du lieu tach rieng theo tai khoan.</p>
      </section>

      <section className="auth-panel" aria-label="Dang nhap">
        <div className="tabs" role="tablist">
          {['login', 'register'].map((item) => (
            <button
              className={`tab ${mode === item ? 'active' : ''}`}
              key={item}
              onClick={() => {
                setMode(item);
                setMessage('');
              }}
              type="button"
            >
              {item === 'login' ? 'Dang nhap' : 'Dang ky'}
            </button>
          ))}
        </div>

        <form className="auth-form" onSubmit={submit}>
          {mode === 'register' ? (
            <label className="field">
              <span>Ten hien thi</span>
              <input
                autoComplete="name"
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Nguyen Van A"
                value={form.name}
              />
            </label>
          ) : null}

          <label className="field">
            <span>Email</span>
            <input
              autoComplete="email"
              inputMode="email"
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="ban@example.com"
              required
              value={form.email}
            />
          </label>

          <label className="field">
            <span>Mat khau</span>
            <input
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength="8"
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
              type="password"
              value={form.password}
            />
          </label>

          <button className="primary-button" disabled={submitting} type="submit">
            {submitting ? 'Dang xu ly' : mode === 'register' ? 'Dang ky' : 'Dang nhap'}
          </button>
          <Message value={message} variant={messageVariant} />
        </form>
      </section>
    </main>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);
  const [activeView, setActiveView] = useState('transactions');
  const [month, setMonth] = useState(currentMonth());
  const [categories, setCategories] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  async function loadReferenceData() {
    const [categoryData, walletData] = await Promise.all([
      apiRequest('/api/categories'),
      apiRequest('/api/wallets')
    ]);
    setCategories(categoryData.categories || []);
    setWallets(walletData.wallets || []);
  }

  async function loadMonthData(nextMonth = month) {
    setLoading(true);
    try {
      const recurringData = await apiRequest('/api/recurring-transactions');
      setRecurringTransactions(recurringData.recurringTransactions || []);
      if (recurringData.generatedCount > 0) {
        setToast(`Da tao ${recurringData.generatedCount} giao dich dinh ky den han.`);
      }

      const [transactionData, dashboardData, budgetData] = await Promise.all([
        apiRequest(`/api/transactions?month=${nextMonth}`),
        apiRequest(`/api/dashboard?month=${nextMonth}`),
        apiRequest(`/api/budgets?month=${nextMonth}`)
      ]);
      setTransactions(transactionData.transactions || []);
      setDashboard(dashboardData.dashboard || null);
      setBudgets(budgetData.budgets || []);
    } finally {
      setLoading(false);
    }
  }

  async function boot(userData) {
    setUser(userData);
    await loadReferenceData();
    await loadMonthData(month);
  }

  useEffect(() => {
    async function loadSession() {
      const token = localStorage.getItem(tokenKey);
      if (!token) {
        setBooting(false);
        return;
      }
      try {
        const data = await apiRequest('/api/me');
        await boot(data.user);
      } catch {
        localStorage.removeItem(tokenKey);
        setUser(null);
      } finally {
        setBooting(false);
      }
    }
    loadSession();
  }, []);

  async function logout() {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem(tokenKey);
      setUser(null);
      setTransactions([]);
      setDashboard(null);
      setBudgets([]);
      setRecurringTransactions([]);
    }
  }

  async function changeMonth(nextMonth) {
    setMonth(nextMonth);
    await loadMonthData(nextMonth);
  }

  if (booting) {
    return (
      <main className="loading-screen">
        <div className="brand-mark">₫</div>
        <p>Dang tai du lieu...</p>
      </main>
    );
  }

  if (!user) {
    return <AuthScreen onAuthenticated={boot} />;
  }

  const context = {
    categories,
    wallets,
    transactions,
    dashboard,
    budgets,
    recurringTransactions,
    month,
    loading,
    reload: () => loadMonthData(month),
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
            { id: 'recurring', label: 'Dinh ky', icon: CalendarClock }
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
        <button className="logout-control" onClick={logout} type="button">
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
      </section>
    </main>
  );
}

function viewTitle(activeView) {
  if (activeView === 'dashboard') return 'Tong quan thang';
  if (activeView === 'budgets') return 'Ngan sach';
  if (activeView === 'recurring') return 'Giao dich dinh ky';
  return 'Giao dich';
}

function SummaryGrid({ dashboard }) {
  const totals = dashboard?.totals || { income: 0, expense: 0, balance: 0, savingsRate: 0 };
  const counts = dashboard?.counts || { all: 0 };
  return (
    <section className="summary-grid" aria-label="Tom tat">
      <article className="summary-item income"><span>Thu nhap</span><strong>{moneyFormatter.format(totals.income)}</strong></article>
      <article className="summary-item expense"><span>Chi tieu</span><strong>{moneyFormatter.format(totals.expense)}</strong></article>
      <article className="summary-item balance"><span>Con lai</span><strong>{moneyFormatter.format(totals.balance)}</strong></article>
      <article className="summary-item"><span>Ty le tiet kiem</span><strong>{totals.savingsRate}%</strong></article>
      <article className="summary-item"><span>So giao dich</span><strong>{counts.all}</strong></article>
      <article className="summary-item"><span>Chi TB / giao dich</span><strong>{moneyFormatter.format(dashboard?.averageExpense || 0)}</strong></article>
    </section>
  );
}

function SegmentedType({ name, value, onChange }) {
  return (
    <div className="segmented" role="radiogroup" aria-label="Loai giao dich">
      {[
        ['expense', 'Chi'],
        ['income', 'Thu']
      ].map(([id, label]) => (
        <label key={id}>
          <input checked={value === id} name={name} onChange={() => onChange(id)} type="radio" value={id} />
          <span>{label}</span>
        </label>
      ))}
    </div>
  );
}

function TransactionsScreen({ categories, wallets, transactions, reload, setToast }) {
  const emptyForm = {
    id: '',
    type: 'expense',
    amount: '',
    categoryId: '',
    walletId: '',
    transactionDate: todayDate(),
    note: ''
  };
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('error');
  const [saving, setSaving] = useState(false);
  const categoryOptions = categories.filter((category) => category.type === form.type);
  const selectedCategory = form.categoryId || categoryOptions[0]?.id || '';
  const selectedWallet = form.walletId || wallets[0]?.id || '';

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        type: form.type,
        amount: Number(form.amount),
        categoryId: selectedCategory,
        walletId: selectedWallet,
        transactionDate: form.transactionDate,
        note: form.note
      };
      await apiRequest(form.id ? `/api/transactions/${form.id}` : '/api/transactions', {
        method: form.id ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });
      await reload();
      setForm(emptyForm);
      setVariant('success');
      setMessage(form.id ? 'Da cap nhat giao dich.' : 'Da luu giao dich.');
    } catch (error) {
      setVariant('error');
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  function edit(transaction) {
    setForm({
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      categoryId: transaction.categoryId,
      walletId: transaction.walletId,
      transactionDate: transaction.transactionDate,
      note: transaction.note || ''
    });
    setMessage('');
  }

  async function remove(transaction) {
    if (!window.confirm('Xoa giao dich nay?')) return;
    try {
      await apiRequest(`/api/transactions/${transaction.id}`, { method: 'DELETE' });
      await reload();
      setToast('Da xoa giao dich.');
    } catch (error) {
      setVariant('error');
      setMessage(error.message);
    }
  }

  return (
    <section className="screen-grid two-column">
      <form className="transaction-form" onSubmit={submit}>
        <div className="panel-heading">
          <h3>{form.id ? 'Sua giao dich' : 'Nhap nhanh'}</h3>
          <span>Thu/chi hang ngay</span>
        </div>
        <SegmentedType name="transactionType" value={form.type} onChange={(type) => setForm({ ...form, type, categoryId: '' })} />
        <label className="field"><span>So tien</span><input inputMode="decimal" min="1" onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="150000" required type="number" value={form.amount} /></label>
        <label className="field"><span>Danh muc</span><select onChange={(event) => setForm({ ...form, categoryId: event.target.value })} required value={selectedCategory}>{categoryOptions.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label className="field"><span>Vi</span><select onChange={(event) => setForm({ ...form, walletId: event.target.value })} required value={selectedWallet}>{wallets.map((wallet) => <option key={wallet.id} value={wallet.id}>{wallet.name} ({wallet.currency})</option>)}</select></label>
        <label className="field"><span>Ngay</span><input onChange={(event) => setForm({ ...form, transactionDate: event.target.value })} required type="date" value={form.transactionDate} /></label>
        <label className="field"><span>Ghi chu</span><input maxLength="160" onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Ca phe sang" value={form.note} /></label>
        <div className="form-actions">
          <button className="primary-button" disabled={saving} type="submit">{form.id ? 'Cap nhat giao dich' : 'Luu giao dich'}</button>
          {form.id ? <button className="secondary-button compact" onClick={() => setForm(emptyForm)} type="button">Huy sua</button> : null}
        </div>
        <Message value={message} variant={variant} />
      </form>

      <section className="transaction-list-panel">
        <div className="list-toolbar"><h3>Giao dich</h3><span className="toolbar-meta">{transactions.length} muc</span></div>
        <div className="transaction-list">
          {transactions.length ? transactions.map((transaction) => (
            <TransactionItem key={transaction.id} onDelete={() => remove(transaction)} onEdit={() => edit(transaction)} transaction={transaction} />
          )) : <p className="empty-state">Chua co giao dich trong thang nay.</p>}
        </div>
      </section>
    </section>
  );
}

function TransactionItem({ transaction, onEdit, onDelete }) {
  const sign = transaction.type === 'income' ? '+' : '-';
  return (
    <article className="transaction-item">
      <div className="transaction-main">
        <span className="category-dot" style={{ background: transaction.categoryColor || '#657084' }} />
        <div>
          <div className="item-title-line">
            <strong>{transaction.categoryName || 'Khong ro'}</strong>
            {transaction.sourceRecurringId ? <span className="source-badge">Dinh ky</span> : null}
          </div>
          <p>{transaction.transactionDate} · {transaction.walletName || 'Vi'}</p>
          {transaction.note ? <p>{transaction.note}</p> : null}
        </div>
      </div>
      <div className={`transaction-side ${transaction.type}`}>
        <strong>{sign}{moneyFormatter.format(transaction.amount)}</strong>
        <div className="row-actions">
          <button className="link-button" onClick={onEdit} type="button">Sua</button>
          <button className="link-button danger" onClick={onDelete} type="button">Xoa</button>
        </div>
      </div>
    </article>
  );
}

function DashboardScreen({ dashboard }) {
  const expenseByCategory = dashboard?.expenseByCategory || [];
  return (
    <>
      <SummaryGrid dashboard={dashboard} />
      <section className="dashboard-grid">
        <article className="dashboard-panel">
          <div className="list-toolbar">
            <h3>Chi tieu theo danh muc</h3>
            <span className="toolbar-meta">{expenseByCategory[0] ? `Top: ${expenseByCategory[0].categoryName}` : 'Chua co du lieu'}</span>
          </div>
          <div className="category-breakdown">
            {expenseByCategory.length ? expenseByCategory.map((item) => (
              <div className="category-row" key={item.categoryId}>
                <div className="category-row-head">
                  <span><i style={{ background: item.categoryColor }} />{item.categoryName}</span>
                  <strong>{moneyFormatter.format(item.amount)}</strong>
                </div>
                <div className="bar-track" aria-hidden="true">
                  <div className="bar-fill" style={{ width: `${Math.max(item.percent, 2)}%`, background: item.categoryColor }} />
                </div>
                <div className="category-row-foot"><span>{item.count} giao dich</span><span>{item.percent}% tong chi</span></div>
              </div>
            )) : <p className="empty-state">Chua co chi tieu de hien thi bieu do.</p>}
          </div>
        </article>
        <article className="dashboard-panel">
          <h3>Insight thang</h3>
          <p className="insight-text">{dashboard?.insight || 'Chua co du lieu chi tieu trong thang nay.'}</p>
          <div className="top-categories">
            {expenseByCategory.slice(0, 3).map((item, index) => (
              <div className="top-category" key={item.categoryId}>
                <span className="rank">{index + 1}</span>
                <div><strong>{item.categoryName}</strong><p>{item.percent}% · {moneyFormatter.format(item.amount)}</p></div>
              </div>
            ))}
            {!expenseByCategory.length ? <p className="empty-state compact-empty">Chua co top danh muc.</p> : null}
          </div>
        </article>
      </section>
    </>
  );
}

function BudgetsScreen({ categories, budgets, month, reload }) {
  const emptyForm = { id: '', categoryId: '', amountLimit: '' };
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('error');
  const expenseCategories = categories.filter((category) => category.type === 'expense');
  const selectedCategory = form.categoryId || expenseCategories[0]?.id || '';

  async function submit(event) {
    event.preventDefault();
    try {
      await apiRequest(form.id ? `/api/budgets/${form.id}` : `/api/budgets?month=${month}`, {
        method: form.id ? 'PUT' : 'POST',
        body: JSON.stringify({ categoryId: selectedCategory, amountLimit: Number(form.amountLimit) })
      });
      await reload();
      setForm(emptyForm);
      setVariant('success');
      setMessage(form.id ? 'Da cap nhat ngan sach.' : 'Da luu ngan sach.');
    } catch (error) {
      setVariant('error');
      setMessage(error.message);
    }
  }

  async function remove(budget) {
    if (!window.confirm('Xoa ngan sach nay?')) return;
    try {
      await apiRequest(`/api/budgets/${budget.id}`, { method: 'DELETE' });
      await reload();
      setVariant('success');
      setMessage('Da xoa ngan sach.');
    } catch (error) {
      setVariant('error');
      setMessage(error.message);
    }
  }

  return (
    <section className="budget-grid">
      <form className="budget-form dashboard-panel" onSubmit={submit}>
        <div className="panel-heading"><h3>{form.id ? 'Sua ngan sach' : 'Ngan sach thang'}</h3><span>Dat gioi han theo danh muc</span></div>
        <label className="field"><span>Danh muc chi</span><select onChange={(event) => setForm({ ...form, categoryId: event.target.value })} required value={selectedCategory}>{expenseCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label className="field"><span>Han muc</span><input inputMode="decimal" min="1" onChange={(event) => setForm({ ...form, amountLimit: event.target.value })} placeholder="2000000" required type="number" value={form.amountLimit} /></label>
        <div className="form-actions">
          <button className="primary-button" type="submit">{form.id ? 'Cap nhat ngan sach' : 'Luu ngan sach'}</button>
          {form.id ? <button className="secondary-button compact" onClick={() => setForm(emptyForm)} type="button">Huy sua</button> : null}
        </div>
        <Message value={message} variant={variant} />
      </form>
      <section className="dashboard-panel">
        <div className="list-toolbar"><h3>Tien do ngan sach</h3><span className="toolbar-meta">{budgets.length} ngan sach</span></div>
        <div className="budget-list">
          {budgets.length ? budgets.map((budget) => (
            <BudgetItem
              budget={budget}
              key={budget.id}
              onDelete={() => remove(budget)}
              onEdit={() => {
                setForm({ id: budget.id, categoryId: budget.categoryId, amountLimit: budget.amountLimit });
                setMessage('');
              }}
            />
          )) : <p className="empty-state">Chua co ngan sach trong thang nay.</p>}
        </div>
      </section>
    </section>
  );
}

function BudgetItem({ budget, onEdit, onDelete }) {
  const width = Math.min(Math.max(budget.percentUsed, 2), 100);
  const statusText = budget.alertLevel === 'exceeded' ? 'Vuot ngan sach' : budget.alertLevel === 'warning' ? 'Gan vuot' : 'On dinh';
  return (
    <article className={`budget-item ${budget.alertLevel}`}>
      <div className="budget-head">
        <div><strong><i style={{ background: budget.categoryColor }} />{budget.categoryName}</strong><p>{budget.alertMessage}</p></div>
        <span className={`budget-badge ${budget.alertLevel}`}>{statusText}</span>
      </div>
      <div className="bar-track tall" aria-hidden="true"><div className={`bar-fill ${budget.alertLevel}`} style={{ width: `${width}%` }} /></div>
      <div className="budget-meta"><span>{moneyFormatter.format(budget.spent)} / {moneyFormatter.format(budget.amountLimit)}</span><span>{budget.percentUsed}%</span></div>
      <div className="budget-actions"><button className="link-button" onClick={onEdit} type="button">Sua</button><button className="link-button danger" onClick={onDelete} type="button">Xoa</button></div>
    </article>
  );
}

function RecurringScreen({ categories, wallets, recurringTransactions, reload, setToast }) {
  const emptyForm = {
    id: '',
    type: 'expense',
    amount: '',
    categoryId: '',
    walletId: '',
    frequency: 'monthly',
    nextRunAt: currentDateTimeLocal(),
    note: ''
  };
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('error');
  const categoryOptions = categories.filter((category) => category.type === form.type);
  const selectedCategory = form.categoryId || categoryOptions[0]?.id || '';
  const selectedWallet = form.walletId || wallets[0]?.id || '';

  async function submit(event) {
    event.preventDefault();
    try {
      const data = await apiRequest(form.id ? `/api/recurring-transactions/${form.id}` : '/api/recurring-transactions', {
        method: form.id ? 'PUT' : 'POST',
        body: JSON.stringify({
          type: form.type,
          amount: Number(form.amount),
          categoryId: selectedCategory,
          walletId: selectedWallet,
          frequency: form.frequency,
          nextRunAt: form.nextRunAt,
          note: form.note,
          active: true
        })
      });
      await reload();
      setForm(emptyForm);
      const generatedText = data.generatedCount > 0 ? ` Da tao ${data.generatedCount} giao dich den han.` : '';
      setVariant('success');
      setMessage(`${form.id ? 'Da cap nhat khoan dinh ky.' : 'Da luu khoan dinh ky.'}${generatedText}`);
    } catch (error) {
      setVariant('error');
      setMessage(error.message);
    }
  }

  async function remove(recurring) {
    if (!window.confirm('Tat khoan dinh ky nay?')) return;
    try {
      await apiRequest(`/api/recurring-transactions/${recurring.id}`, { method: 'DELETE' });
      await reload();
      setToast('Da tat khoan dinh ky.');
    } catch (error) {
      setVariant('error');
      setMessage(error.message);
    }
  }

  return (
    <section className="recurring-grid">
      <form className="recurring-form dashboard-panel" onSubmit={submit}>
        <div className="panel-heading"><h3>{form.id ? 'Sua khoan dinh ky' : 'Khoan dinh ky'}</h3><span>Tu dong tao giao dich den han</span></div>
        <SegmentedType name="recurringType" value={form.type} onChange={(type) => setForm({ ...form, type, categoryId: '' })} />
        <label className="field"><span>So tien</span><input inputMode="decimal" min="1" onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="500000" required type="number" value={form.amount} /></label>
        <label className="field"><span>Danh muc</span><select onChange={(event) => setForm({ ...form, categoryId: event.target.value })} required value={selectedCategory}>{categoryOptions.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label className="field"><span>Vi</span><select onChange={(event) => setForm({ ...form, walletId: event.target.value })} required value={selectedWallet}>{wallets.map((wallet) => <option key={wallet.id} value={wallet.id}>{wallet.name} ({wallet.currency})</option>)}</select></label>
        <label className="field"><span>Tan suat</span><select onChange={(event) => setForm({ ...form, frequency: event.target.value })} value={form.frequency}><option value="daily">Hang ngay</option><option value="weekly">Hang tuan</option><option value="monthly">Hang thang</option></select></label>
        <label className="field"><span>Lan chay tiep</span><input onChange={(event) => setForm({ ...form, nextRunAt: event.target.value })} required type="datetime-local" value={form.nextRunAt} /></label>
        <label className="field"><span>Ghi chu</span><input maxLength="160" onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Tien nha" value={form.note} /></label>
        <div className="form-actions"><button className="primary-button" type="submit">{form.id ? 'Cap nhat dinh ky' : 'Luu dinh ky'}</button>{form.id ? <button className="secondary-button compact" onClick={() => setForm(emptyForm)} type="button">Huy sua</button> : null}</div>
        <Message value={message} variant={variant} />
      </form>
      <section className="dashboard-panel">
        <div className="list-toolbar"><h3>Danh sach dinh ky</h3><span className="toolbar-meta">{recurringTransactions.length} khoan</span></div>
        <div className="recurring-list">
          {recurringTransactions.length ? recurringTransactions.map((recurring) => (
            <RecurringItem
              key={recurring.id}
              onDelete={() => remove(recurring)}
              onEdit={() => {
                setForm({
                  id: recurring.id,
                  type: recurring.type,
                  amount: recurring.amount,
                  categoryId: recurring.categoryId,
                  walletId: recurring.walletId,
                  frequency: recurring.frequency,
                  nextRunAt: recurring.nextRunAt || `${recurring.nextRunDate}T00:00`,
                  note: recurring.note || ''
                });
                setMessage('');
              }}
              recurring={recurring}
            />
          )) : <p className="empty-state">Chua co khoan dinh ky.</p>}
        </div>
      </section>
    </section>
  );
}

function RecurringItem({ recurring, onEdit, onDelete }) {
  const sign = recurring.type === 'income' ? '+' : '-';
  return (
    <article className={`recurring-item ${recurring.active ? '' : 'inactive'}`}>
      <div className="recurring-main">
        <span className="category-dot" style={{ background: recurring.categoryColor || '#657084' }} />
        <div>
          <strong>{recurring.categoryName || 'Khong ro'}</strong>
          <p>{frequencyLabel(recurring.frequency)} · chay tiep {formatDateTimeLocal(recurring.nextRunAt || recurring.nextRunDate)}</p>
          {recurring.note ? <p>{recurring.note}</p> : null}
        </div>
      </div>
      <div className={`recurring-side ${recurring.type}`}>
        <strong>{sign}{moneyFormatter.format(recurring.amount)}</strong>
        <div className="row-actions"><button className="link-button" onClick={onEdit} type="button">Sua</button><button className="link-button danger" onClick={onDelete} type="button">Tat</button></div>
      </div>
    </article>
  );
}

createRoot(document.getElementById('root')).render(<App />);
