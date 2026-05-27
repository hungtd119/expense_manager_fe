import React from 'react';
import { moneyFormatter } from '../utils/formatters';

export default function SummaryGrid({ dashboard }) {
  const totals = dashboard?.totals || { income: 0, expense: 0, balance: 0, savingsRate: 0 };
  const counts = dashboard?.counts || { all: 0 };
  return (
    <section className="summary-grid" aria-label="Tom tat">
      <article className="summary-item income"><span>Thu nhap</span><strong>{moneyFormatter.format(totals.income)}</strong></article>
      <article className="summary-item expense"><span>Chi tieu</span><strong>{moneyFormatter.format(totals.expense)}</strong></article>
      <article className="summary-item balance"><span>Con lai</span><strong>{moneyFormatter.format(totals.balance)}</strong></article>
      <article className="summary-item"><span>Ty le tiet kiem</span><strong>{totals.savingsRate}%</strong></article>
      <article className="summary-item"><span>So giao dich</span><strong>{counts.all}</strong></article>
      <article className="summary-item"><span>Chi TB / giao dich</span><strong>{moneyFormatter.format(dashboard?.averageExpense || 0)}</strong></article>
    </section>
  );
}
