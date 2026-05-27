import React, { useState } from 'react';
import { createWallet, updateWallet, deleteWallet } from '../api/reference';
import Message from '../components/Message';

export default function WalletsScreen({ wallets, reload, setToast }) {
  const emptyForm = { id: '', name: '', currency: 'VND', balanceInitial: '' };
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('error');
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        name: form.name,
        currency: form.currency,
        balanceInitial: Number(form.balanceInitial || 0)
      };

      if (form.id) {
        await updateWallet(form.id, payload);
      } else {
        await createWallet(payload);
      }
      await reload();
      setForm(emptyForm);
      setVariant('success');
      setMessage(form.id ? 'Da cap nhat vi.' : 'Da tao vi moi.');
    } catch (error) {
      setVariant('error');
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  function edit(wallet) {
    setForm({
      id: wallet.id,
      name: wallet.name,
      currency: wallet.currency,
      balanceInitial: wallet.balanceInitial
    });
    setMessage('');
  }

  async function remove(wallet) {
    if (!window.confirm(`Xoa vi "${wallet.name}"?`)) return;
    try {
      await deleteWallet(wallet.id);
      await reload();
      setToast('Da xoa vi.');
    } catch (error) {
      setVariant('error');
      setMessage(error.message);
    }
  }

  return (
    <section className="screen-grid two-column">
      <form className="transaction-form" onSubmit={submit}>
        <div className="panel-heading">
          <h3>{form.id ? 'Sua vi' : 'Tao vi moi'}</h3>
          <span>Quan ly cac tai khoan/vi cua ban</span>
        </div>
        <label className="field">
          <span>Ten vi</span>
          <input
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Vi mat, Tai khoan Techcombank"
            required
            type="text"
            value={form.name}
          />
        </label>
        <label className="field">
          <span>Loai tien te</span>
          <select
            onChange={(event) => setForm({ ...form, currency: event.target.value })}
            required
            value={form.currency}
          >
            <option value="VND">VND (₫)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </label>
        <label className="field">
          <span>So du ban dau</span>
          <input
            inputMode="decimal"
            onChange={(event) => setForm({ ...form, balanceInitial: event.target.value })}
            placeholder="0"
            type="number"
            value={form.balanceInitial}
          />
        </label>
        <div className="form-actions">
          <button className="primary-button" disabled={saving} type="submit">
            {form.id ? 'Cap nhat vi' : 'Luu vi'}
          </button>
          {form.id ? (
            <button className="secondary-button compact" onClick={() => setForm(emptyForm)} type="button">
              Huy sua
            </button>
          ) : null}
        </div>
        <Message value={message} variant={variant} />
      </form>

      <section className="transaction-list-panel">
        <div className="list-toolbar">
          <h3>Danh sach vi</h3>
          <span className="toolbar-meta">{wallets.length} vi</span>
        </div>
        <div className="transaction-list">
          {wallets.length ? (
            wallets.map((wallet) => (
              <article className="transaction-item" key={wallet.id}>
                <div className="transaction-main">
                  <div className="brand-mark compact-mark" style={{ marginRight: '12px' }}>
                    {wallet.currency === 'USD' ? '$' : wallet.currency === 'EUR' ? '€' : '₫'}
                  </div>
                  <div>
                    <strong>{wallet.name}</strong>
                    <p>So du ban dau: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: wallet.currency }).format(wallet.balanceInitial)}</p>
                  </div>
                </div>
                <div className="transaction-side">
                  <div className="row-actions">
                    <button className="link-button" onClick={() => edit(wallet)} type="button">Sua</button>
                    <button className="link-button danger" onClick={() => remove(wallet)} type="button">Xoa</button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="empty-state">Chua co vi nao duoc tao.</p>
          )}
        </div>
      </section>
    </section>
  );
}
