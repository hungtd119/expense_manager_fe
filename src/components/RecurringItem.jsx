import React from 'react';
import { moneyFormatter, frequencyLabel, formatDateTimeLocal } from '../utils/formatters';

export default function RecurringItem({ recurring, onEdit, onDelete }) {
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
