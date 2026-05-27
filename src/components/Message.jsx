import React from 'react';

export default function Message({ value, variant = 'error' }) {
  if (!value) return null;
  return <p className={`form-message ${variant === 'success' ? 'success' : ''}`} role="status">{value}</p>;
}
