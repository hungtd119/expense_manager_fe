import React, { useState } from 'react';
import { createCategory, updateCategory, deleteCategory } from '../api/reference';
import SegmentedType from '../components/SegmentedType';
import Message from '../components/Message';

export default function CategoriesScreen({ categories, reload, setToast }) {
  const emptyForm = { id: '', name: '', type: 'expense', icon: '🍔', color: '#3b82f6' };
  const [form, setForm] = useState(emptyForm);
  const [activeTab, setActiveTab] = useState('expense');
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('error');
  const [saving, setSaving] = useState(false);

  const filteredCategories = categories.filter((cat) => cat.type === activeTab);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        name: form.name,
        type: form.type,
        icon: form.icon,
        color: form.color
      };

      if (form.id) {
        await updateCategory(form.id, payload);
      } else {
        await createCategory(payload);
      }
      await reload();
      setForm({ ...emptyForm, type: activeTab });
      setVariant('success');
      setMessage(form.id ? 'Da cap nhat danh muc.' : 'Da tao danh muc moi.');
    } catch (error) {
      setVariant('error');
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  function edit(category) {
    setForm({
      id: category.id,
      name: category.name,
      type: category.type,
      icon: category.icon || '🍔',
      color: category.color || '#3b82f6'
    });
    setMessage('');
  }

  async function remove(category) {
    if (!window.confirm(`Xoa danh muc "${category.name}"?`)) return;
    try {
      await deleteCategory(category.id);
      await reload();
      setToast('Da xoa danh muc.');
    } catch (error) {
      setVariant('error');
      setMessage(error.message);
    }
  }

  return (
    <section className="screen-grid two-column">
      <form className="transaction-form" onSubmit={submit}>
        <div className="panel-heading">
          <h3>{form.id ? 'Sua danh muc' : 'Tao danh muc moi'}</h3>
          <span>Phan loai giao dich thu/chi</span>
        </div>
        <SegmentedType
          name="categoryType"
          value={form.type}
          onChange={(type) => setForm({ ...form, type })}
        />
        <label className="field">
          <span>Ten danh muc</span>
          <input
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="An uong, Luong thuong, Hoa don"
            required
            type="text"
            value={form.name}
          />
        </label>
        <label className="field">
          <span>Icon (Emoji)</span>
          <input
            maxLength="4"
            onChange={(event) => setForm({ ...form, icon: event.target.value })}
            placeholder="🍔"
            required
            type="text"
            value={form.icon}
          />
        </label>
        <label className="field">
          <span>Mau sac</span>
          <input
            onChange={(event) => setForm({ ...form, color: event.target.value })}
            required
            type="color"
            value={form.color}
          />
        </label>
        <div className="form-actions">
          <button className="primary-button" disabled={saving} type="submit">
            {form.id ? 'Cap nhat danh muc' : 'Luu danh muc'}
          </button>
          {form.id ? (
            <button className="secondary-button compact" onClick={() => setForm({ ...emptyForm, type: activeTab })} type="button">
              Huy sua
            </button>
          ) : null}
        </div>
        <Message value={message} variant={variant} />
      </form>

      <section className="transaction-list-panel">
        <div className="tabs" role="tablist" style={{ marginBottom: '16px' }}>
          {[
            ['expense', 'Chi tieu'],
            ['income', 'Thu nhap']
          ].map(([tab, label]) => (
            <button
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setForm({ ...form, type: tab });
              }}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
        <div className="list-toolbar">
          <h3>Danh muc</h3>
          <span className="toolbar-meta">{filteredCategories.length} muc</span>
        </div>
        <div className="transaction-list">
          {filteredCategories.length ? (
            filteredCategories.map((category) => (
              <article className="transaction-item" key={category.id}>
                <div className="transaction-main">
                  <span
                    className="category-dot"
                    style={{
                      background: category.color || '#657084',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      color: '#fff',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%'
                    }}
                  >
                    {category.icon || '🍔'}
                  </span>
                  <div style={{ marginLeft: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong>{category.name}</strong>
                      {category.isDefault ? (
                        <span className="source-badge" style={{ backgroundColor: '#e2e8f0', color: '#475569' }}>Moc dinh</span>
                      ) : (
                        <span className="source-badge" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>Tu tao</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="transaction-side">
                  {!category.isDefault ? (
                    <div className="row-actions">
                      <button className="link-button" onClick={() => edit(category)} type="button">Sua</button>
                      <button className="link-button danger" onClick={() => remove(category)} type="button">Xoa</button>
                    </div>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <p className="empty-state">Chua co danh muc nao trong nhom nay.</p>
          )}
        </div>
      </section>
    </section>
  );
}
