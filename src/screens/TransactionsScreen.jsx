import React, { useState, useEffect, useRef } from 'react';
import { createTransaction, updateTransaction, deleteTransaction } from '../api/transactions';
import { todayDate } from '../utils/formatters';
import SegmentedType from '../components/SegmentedType';
import Message from '../components/Message';
import TransactionItem from '../components/TransactionItem';
import AppSelect from '../components/AppSelect';

export default function TransactionsScreen({ 
  categories, 
  wallets, 
  transactions, 
  transactionsMeta, 
  reload, 
  setToast,
  filters,
  setFilters,
  month
}) {
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
  
  // Local states for inputs that we want to debounce
  const [localSearch, setLocalSearch] = useState(filters?.q || '');
  const [localMin, setLocalMin] = useState(filters?.minAmount || '');
  const [localMax, setLocalMax] = useState(filters?.maxAmount || '');

  // Ref to track if it is the first render
  const isFirstRender = useRef(true);

  const categoryOptions = categories.filter((category) => category.type === form.type);
  const selectedCategory = form.categoryId || categoryOptions[0]?.id || '';
  const selectedWallet = form.walletId || wallets[0]?.id || '';

  // Synchronize local states when global filters are updated (e.g., reset)
  useEffect(() => {
    if (filters) {
      setLocalSearch(filters.q || '');
      setLocalMin(filters.minAmount || '');
      setLocalMax(filters.maxAmount || '');
    }
  }, [filters]);

  // Debounce filter trigger
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const updated = {
        ...filters,
        q: localSearch,
        minAmount: localMin,
        maxAmount: localMax
      };
      setFilters(updated);
      reload(1, transactionsMeta?.pageSize || 50, updated);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, localMin, localMax]);

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    reload(1, transactionsMeta?.pageSize || 50, updated);
  };

  const resetFilters = () => {
    const cleared = { type: '', categoryId: '', walletId: '', q: '', minAmount: '', maxAmount: '' };
    setFilters(cleared);
    reload(1, transactionsMeta?.pageSize || 50, cleared);
  };

  const exportCSV = async () => {
    try {
      const token = localStorage.getItem('expense_manager_token');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://api.sweete.id.vn';
      
      let url = `${baseUrl}/api/export/transactions?month=${month}&format=csv`;
      
      const response = await fetch(url, {
        headers: {
          ...(token ? { authorization: `Bearer ${token}` } : {})
        }
      });
      
      if (!response.ok) {
        throw new Error('Không thể tải file xuất dữ liệu.');
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `transactions-${month}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      setToast('Đã xuất file CSV thành công.');
    } catch (error) {
      console.error(error);
      setMessage(error.message);
      setVariant('error');
    }
  };

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
      if (form.id) {
        await updateTransaction(form.id, payload);
      } else {
        await createTransaction(payload);
      }
      await reload(transactionsMeta?.page || 1, transactionsMeta?.pageSize || 50, filters);
      setForm(emptyForm);
      setVariant('success');
      setMessage(form.id ? 'Đã cập nhật giao dịch.' : 'Đã lưu giao dịch.');
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
    if (!window.confirm('Xóa giao dịch này?')) return;
    try {
      await deleteTransaction(transaction.id);
      await reload(transactionsMeta?.page || 1, transactionsMeta?.pageSize || 50, filters);
      setToast('Đã xóa giao dịch.');
    } catch (error) {
      setVariant('error');
      setMessage(error.message);
    }
  }

  return (
    <section className="screen-grid two-column">
      <form className="transaction-form" onSubmit={submit}>
        <div className="panel-heading">
          <h3>{form.id ? 'Sửa giao dịch' : 'Nhập nhanh'}</h3>
          <span>Thu/chi hàng ngày</span>
        </div>
        <SegmentedType name="transactionType" value={form.type} onChange={(type) => setForm({ ...form, type, categoryId: '' })} />
        <label className="field"><span>Số tiền</span><input inputMode="decimal" min="1" onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="150000" required type="number" value={form.amount} /></label>
        <label className="field">
          <span>Danh mục</span>
          <AppSelect
            options={categoryOptions.map((c) => ({ value: c.id, label: c.name, icon: c.icon, color: c.color }))}
            onChange={(val) => setForm({ ...form, categoryId: val })}
            value={selectedCategory}
            required
            placeholder="Chọn danh mục..."
          />
        </label>
        <label className="field">
          <span>Ví</span>
          <AppSelect
            options={wallets.map((w) => ({ value: w.id, label: `${w.name} (${w.currency})` }))}
            onChange={(val) => setForm({ ...form, walletId: val })}
            value={selectedWallet}
            required
            placeholder="Chọn ví..."
          />
        </label>
        <label className="field"><span>Ngày</span><input onChange={(event) => setForm({ ...form, transactionDate: event.target.value })} required type="date" value={form.transactionDate} /></label>
        <label className="field"><span>Ghi chú</span><input maxLength="160" onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Cà phê sáng" value={form.note} /></label>
        <div className="form-actions">
          <button className="primary-button" disabled={saving} type="submit">{form.id ? 'Cập nhật giao dịch' : 'Lưu giao dịch'}</button>
          {form.id ? <button className="secondary-button compact" onClick={() => setForm(emptyForm)} type="button">Hủy sửa</button> : null}
        </div>
        <Message value={message} variant={variant} />
      </form>

      <section className="transaction-list-panel">
        <div className="list-toolbar" style={{ marginBottom: '14px' }}>
          <h3>Giao dịch</h3>
          <span className="toolbar-meta">
            {transactionsMeta ? `Trang ${transactionsMeta.page}/${transactionsMeta.totalPages} (${transactionsMeta.total} mục)` : `${transactions.length} mục`}
          </span>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
          gap: '8px', 
          marginBottom: '16px', 
          background: 'var(--border-soft)', 
          padding: '12px', 
          borderRadius: '8px'
        }}>
          <AppSelect
            clearable
            options={[
              { value: '', label: 'Tất cả loại' },
              { value: 'income', label: 'Thu nhập' },
              { value: 'expense', label: 'Chi tiêu' }
            ]}
            onChange={(val) => handleFilterChange('type', val)}
            placeholder="Tất cả loại"
            value={filters?.type || ''}
          />

          <AppSelect
            clearable
            options={[
              { value: '', label: 'Tất cả ví' },
              ...wallets.map((w) => ({ value: w.id, label: w.name }))
            ]}
            onChange={(val) => handleFilterChange('walletId', val)}
            placeholder="Tất cả ví"
            value={filters?.walletId || ''}
          />

          <AppSelect
            clearable
            options={[
              { value: '', label: 'Tất cả danh mục' },
              ...categories
                .filter((c) => !(filters?.type) || c.type === filters.type)
                .map((c) => ({ value: c.id, label: c.name, icon: c.icon, color: c.color }))
            ]}
            onChange={(val) => handleFilterChange('categoryId', val)}
            placeholder="Tất cả danh mục"
            value={filters?.categoryId || ''}
          />

          <input 
            type="text" 
            placeholder="Tìm ghi chú..." 
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />

          <input 
            type="number" 
            placeholder="Min VND..." 
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
          />

          <input 
            type="number" 
            placeholder="Max VND..." 
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
          />

          <div style={{ display: 'flex', gap: '8px', gridColumn: '1 / -1', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button 
              type="button" 
              onClick={exportCSV} 
              className="primary-button" 
              style={{ padding: '0 12px', minHeight: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '6px', fontSize: '13px' }}
            >
              Xuất CSV
            </button>
            <button 
              type="button" 
              onClick={resetFilters} 
              className="secondary-button compact" 
              style={{ padding: '0 12px', minHeight: '32px', height: '32px', borderRadius: '6px', fontSize: '13px' }}
            >
              Đặt lại
            </button>
          </div>
        </div>

        <div className="transaction-list">
          {transactions.length ? transactions.map((transaction) => (
            <TransactionItem key={transaction.id} onDelete={() => remove(transaction)} onEdit={() => edit(transaction)} transaction={transaction} />
          )) : <p className="empty-state">Chưa có giao dịch phù hợp.</p>}
        </div>
        
        {transactionsMeta && transactionsMeta.totalPages > 1 && (
          <div className="pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
            <button
              className="secondary-button compact"
              disabled={transactionsMeta.page <= 1}
              onClick={() => reload(transactionsMeta.page - 1, transactionsMeta.pageSize, filters)}
              type="button"
            >
              Trang trước
            </button>
            <span style={{ fontSize: '14px', color: '#64748b' }}>
              {transactionsMeta.page} / {transactionsMeta.totalPages}
            </span>
            <button
              className="secondary-button compact"
              disabled={transactionsMeta.page >= transactionsMeta.totalPages}
              onClick={() => reload(transactionsMeta.page + 1, transactionsMeta.pageSize, filters)}
              type="button"
            >
              Trang sau
            </button>
          </div>
        )}
      </section>
    </section>
  );
}
