import React, { useState } from 'react';
import { login, register } from '../api/auth';
import { tokenKey } from '../api/client';
import Message from '../components/Message';

export default function AuthScreen({ onAuthenticated }) {
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
      let data;
      if (mode === 'register') {
        data = await register(form.name, form.email, form.password);
      } else {
        data = await login(form.email, form.password);
      }
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
