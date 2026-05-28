import React, { useState } from 'react';
import { createRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction } from '../api/recurring';
import { currentDateTimeLocal } from '../utils/formatters';
import SegmentedType from '../components/SegmentedType';
import Message from '../components/Message';
import RecurringItem from '../components/RecurringItem';
import AppSelect from '../components/AppSelect';

export default function RecurringScreen({ categories, wallets, recurringTransactions, reload, setToast }) {
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
      const payload = {
        type: form.type,
        amount: Number(form.amount),
        categoryId: selectedCategory,
        walletId: selectedWallet,
        frequency: form.frequency,
        nextRunAt: form.nextRunAt,
        note: form.note,
        active: true
      };
      
      let data;
      if (form.id) {
        data = await updateRecurringTransaction(form.id, payload);
      } else {
        data = await createRecurringTransaction(payload);
      }
      
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
      await deleteRecurringTransaction(recurring.id);
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
        <label className="field">
          <span>Danh muc</span>
          <AppSelect
            options={categoryOptions.map((c) => ({ value: c.id, label: c.name, icon: c.icon, color: c.color }))}
            onChange={(val) => setForm({ ...form, categoryId: val })}
            value={selectedCategory}
            required
            placeholder="Chon danh muc..."
          />
        </label>
        <label className="field">
          <span>Vi</span>
          <AppSelect
            options={wallets.map((w) => ({ value: w.id, label: `${w.name} (${w.currency})` }))}
            onChange={(val) => setForm({ ...form, walletId: val })}
            value={selectedWallet}
            required
            placeholder="Chon vi..."
          />
        </label>
        <label className="field">
          <span>Tan suat</span>
          <AppSelect
            options={[
              { value: 'daily', label: 'Hang ngay' },
              { value: 'weekly', label: 'Hang tuan' },
              { value: 'monthly', label: 'Hang thang' }
            ]}
            onChange={(val) => setForm({ ...form, frequency: val })}
            value={form.frequency}
            searchable={false}
          />
        </label>
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
