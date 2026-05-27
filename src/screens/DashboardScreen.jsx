import React from 'react';
import { moneyFormatter } from '../utils/formatters';
import SummaryGrid from '../components/SummaryGrid';

export default function DashboardScreen({ dashboard }) {
  const expenseByCategory = dashboard?.expenseByCategory || [];
  return (
    <>
      <SummaryGrid dashboard={dashboard} />
      <section className="dashboard-grid">
        <article className="dashboard-panel">
          <div className="list-toolbar">
            <h3>Chi tieu theo danh muc</h3>
            <span className="toolbar-meta">{expenseByCategory[0] ? `Top: ${expenseByCategory[0].categoryName}` : 'Chua co du lieu'}</span>
          </div>
          <div className="category-breakdown">
            {expenseByCategory.length ? expenseByCategory.map((item) => (
              <div className="category-row" key={item.categoryId}>
                <div className="category-row-head">
                  <span><i style={{ background: item.categoryColor }} />{item.categoryName}</span>
                  <strong>{moneyFormatter.format(item.amount)}</strong>
                </div>
                <div className="bar-track" aria-hidden="true">
                  <div className="bar-fill" style={{ width: `${Math.max(item.percent, 2)}%`, background: item.categoryColor }} />
                </div>
                <div className="category-row-foot"><span>{item.count} giao dich</span><span>{item.percent}% tong chi</span></div>
              </div>
            )) : <p className="empty-state">Chua co chi tieu de hien thi bieu do.</p>}
          </div>
        </article>
        <article className="dashboard-panel">
          <h3>Insight thang</h3>
          <p className="insight-text">{dashboard?.insight || 'Chua co du lieu chi tieu trong thang nay.'}</p>
          <div className="top-categories">
            {expenseByCategory.slice(0, 3).map((item, index) => (
              <div className="top-category" key={item.categoryId}>
                <span className="rank">{index + 1}</span>
                <div><strong>{item.categoryName}</strong><p>{item.percent}% · {moneyFormatter.format(item.amount)}</p></div>
              </div>
            ))}
            {!expenseByCategory.length ? <p className="empty-state compact-empty">Chua co top danh muc.</p> : null}
          </div>
        </article>
      </section>
    </>
  );
}
