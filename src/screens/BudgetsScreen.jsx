import React, { useState } from 'react';
import { createBudget, updateBudget, deleteBudget } from '../api/budgets';
import Message from '../components/Message';
import BudgetItem from '../components/BudgetItem';
import AppSelect from '../components/AppSelect';

export default function BudgetsScreen({ categories, budgets, month, reload }) {
  const emptyForm = { id: '', categoryId: '', amountLimit: '' };
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('error');
  const expenseCategories = categories.filter((category) => category.type === 'expense');
  const selectedCategory = form.categoryId || expenseCategories[0]?.id || '';

  async function submit(event) {
    event.preventDefault();
    try {
      if (form.id) {
        await updateBudget(form.id, { categoryId: selectedCategory, amountLimit: Number(form.amountLimit) });
      } else {
        await createBudget(month, { categoryId: selectedCategory, amountLimit: Number(form.amountLimit) });
      }
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
      await deleteBudget(budget.id);
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
        <label className="field">
          <span>Danh muc chi</span>
          <AppSelect
            options={expenseCategories.map((c) => ({ value: c.id, label: c.name, icon: c.icon, color: c.color }))}
            onChange={(val) => setForm({ ...form, categoryId: val })}
            value={selectedCategory}
            required
            placeholder="Chon danh muc chi..."
          />
        </label>
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
