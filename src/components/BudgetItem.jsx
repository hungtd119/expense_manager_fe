import React from 'react';
import { moneyFormatter } from '../utils/formatters';

export default function BudgetItem({ budget, onEdit, onDelete }) {
  const width = Math.min(Math.max(budget.percentUsed, 2), 100);
  const statusText = budget.alertLevel === 'exceeded' ? 'Vuot ngan sach' : budget.alertLevel === 'warning' ? 'Gan vuot' : 'On dinh';
  return (
    <article className={`budget-item ${budget.alertLevel}`}>
      <div className="budget-head">
        <div><strong><i style={{ background: budget.categoryColor }} />{budget.categoryName}</strong><p>{budget.alertMessage}</p></div>
        <span className={`budget-badge ${budget.alertLevel}`}>{statusText}</span>
      </div>
      <div className="bar-track tall" aria-hidden="true"><div className={`bar-fill ${budget.alertLevel}`} style={{ width: `${width}%` }} /></div>
      <div className="budget-meta"><span>{moneyFormatter.format(budget.spent)} / {moneyFormatter.format(budget.amountLimit)}</span><span>{budget.percentUsed}%</span></div>
      <div className="budget-actions"><button className="link-button" onClick={onEdit} type="button">Sua</button><button className="link-button danger" onClick={onDelete} type="button">Xoa</button></div>
    </article>
  );
}
