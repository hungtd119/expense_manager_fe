import React, { useState } from 'react';
import { createTransaction, updateTransaction, deleteTransaction } from '../api/transactions';
import { todayDate } from '../utils/formatters';
import SegmentedType from '../components/SegmentedType';
import Message from '../components/Message';
import TransactionItem from '../components/TransactionItem';

export default function TransactionsScreen({ categories, wallets, transactions, transactionsMeta, reload, setToast }) {
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
      if (form.id) {
        await updateTransaction(form.id, payload);
      } else {
        await createTransaction(payload);
      }
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
      await deleteTransaction(transaction.id);
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
        <div className="list-toolbar">
          <h3>Giao dich</h3>
          <span className="toolbar-meta">
            {transactionsMeta ? `Trang ${transactionsMeta.page}/${transactionsMeta.totalPages} (${transactionsMeta.total} muc)` : `${transactions.length} muc`}
          </span>
        </div>
        <div className="transaction-list">
          {transactions.length ? transactions.map((transaction) => (
            <TransactionItem key={transaction.id} onDelete={() => remove(transaction)} onEdit={() => edit(transaction)} transaction={transaction} />
          )) : <p className="empty-state">Chua co giao dich trong thang nay.</p>}
        </div>
        {transactionsMeta && transactionsMeta.totalPages > 1 && (
          <div className="pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
            <button
              className="secondary-button compact"
              disabled={transactionsMeta.page <= 1}
              onClick={() => reload(transactionsMeta.page - 1, transactionsMeta.pageSize)}
              type="button"
            >
              Trang truoc
            </button>
            <span style={{ fontSize: '14px', color: '#64748b' }}>
              {transactionsMeta.page} / {transactionsMeta.totalPages}
            </span>
            <button
              className="secondary-button compact"
              disabled={transactionsMeta.page >= transactionsMeta.totalPages}
              onClick={() => reload(transactionsMeta.page + 1, transactionsMeta.pageSize)}
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
