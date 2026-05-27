import React from 'react';
import { moneyFormatter } from '../utils/formatters';

export default function TransactionItem({ transaction, onEdit, onDelete }) {
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
