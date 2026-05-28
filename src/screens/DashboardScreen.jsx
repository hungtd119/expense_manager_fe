import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { moneyFormatter } from '../utils/formatters';
import SummaryGrid from '../components/SummaryGrid';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

export default function DashboardScreen({ dashboard }) {
  const expenseByCategory = dashboard?.expenseByCategory || [];
  const dailyBreakdown = dashboard?.dailyBreakdown || [];

  // 1. Data for Bar Chart: Daily Income vs Expense
  const barChartData = {
    labels: dailyBreakdown.map(day => day.date.split('-')[2]), // Just get the day part (DD)
    datasets: [
      {
        label: 'Thu nhập',
        data: dailyBreakdown.map(day => day.income),
        backgroundColor: '#146c60', // Primary theme color
        borderRadius: 4,
      },
      {
        label: 'Chi tiêu',
        data: dailyBreakdown.map(day => day.expense),
        backgroundColor: '#b42318', // Danger theme color
        borderRadius: 4,
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { weight: '600' }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return ` ${context.dataset.label}: ${moneyFormatter.format(context.raw)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        title: {
          display: true,
          text: 'Ngày trong tháng',
          font: { size: 11, weight: '600' }
        }
      },
      y: {
        grid: { color: '#e7ebf1' },
        ticks: {
          callback: (value) => {
            if (value >= 1e6) return `${value / 1e6}M`;
            if (value >= 1e3) return `${value / 1e3}K`;
            return value;
          }
        }
      }
    }
  };

  // 2. Data for Pie Chart: Expense by Category
  const pieChartData = {
    labels: expenseByCategory.map(item => item.categoryName),
    datasets: [
      {
        data: expenseByCategory.map(item => item.amount),
        backgroundColor: expenseByCategory.map(item => item.categoryColor || '#cbd5e1'),
        borderWidth: 1,
        borderColor: '#ffffff',
      }
    ]
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 10,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 12, weight: '500' }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const val = context.raw;
            const percent = ((val / total) * 100).toFixed(1);
            return ` ${context.label}: ${moneyFormatter.format(val)} (${percent}%)`;
          }
        }
      }
    }
  };

  // 3. Data for Line/Area Chart: Cumulative Balance Trend
  let cumulativeSum = 0;
  const lineChartData = {
    labels: dailyBreakdown.map(day => day.date.split('-')[2]),
    datasets: [
      {
        label: 'Số dư lũy kế',
        data: dailyBreakdown.map(day => {
          cumulativeSum += (day.income - day.expense);
          return cumulativeSum;
        }),
        borderColor: '#d98d2b', // Accent color
        backgroundColor: 'rgba(217, 141, 43, 0.1)', // Light translucent accent fill
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: dailyBreakdown.length > 15 ? 0 : 3,
        pointHoverRadius: 5,
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            return ` Số dư tích lũy: ${moneyFormatter.format(context.raw)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        title: {
          display: true,
          text: 'Ngày trong tháng',
          font: { size: 11, weight: '600' }
        }
      },
      y: {
        grid: { color: '#e7ebf1' },
        ticks: {
          callback: (value) => {
            if (value >= 1e6) return `${value / 1e6}M`;
            if (value >= 1e3) return `${value / 1e3}K`;
            return value;
          }
        }
      }
    }
  };

  return (
    <>
      <SummaryGrid dashboard={dashboard} />
      
      {/* Visual Charts Grid */}
      <section className="dashboard-charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '18px', marginBottom: '18px' }}>
        <article className="dashboard-panel" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '16px' }}>Thu chi hàng ngày</h3>
          <div style={{ flex: 1, position: 'relative' }}>
            {dailyBreakdown.length ? <Bar data={barChartData} options={barChartOptions} /> : <p className="empty-state">Chưa có dữ liệu.</p>}
          </div>
        </article>

        <article className="dashboard-panel" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '16px' }}>Xu hướng số dư lũy kế</h3>
          <div style={{ flex: 1, position: 'relative' }}>
            {dailyBreakdown.length ? <Line data={lineChartData} options={lineChartOptions} /> : <p className="empty-state">Chưa có dữ liệu.</p>}
          </div>
        </article>

        <article className="dashboard-panel" style={{ height: '320px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '16px' }}>Tỷ lệ chi tiêu theo danh mục</h3>
          <div style={{ flex: 1, position: 'relative' }}>
            {expenseByCategory.length ? <Pie data={pieChartData} options={pieChartOptions} /> : <p className="empty-state">Chưa có dữ liệu chi tiêu.</p>}
          </div>
        </article>
      </section>

      {/* Breakdown Details Grid */}
      <section className="dashboard-grid">
        <article className="dashboard-panel">
          <div className="list-toolbar">
            <h3>Chi tiết chi tiêu</h3>
            <span className="toolbar-meta">{expenseByCategory[0] ? `Top: ${expenseByCategory[0].categoryName}` : 'Chưa có dữ liệu'}</span>
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
                <div className="category-row-foot"><span>{item.count} giao dịch</span><span>{item.percent}% tổng chi</span></div>
              </div>
            )) : <p className="empty-state">Chưa có chi tiêu để hiển thị biểu đồ.</p>}
          </div>
        </article>
        
        <article className="dashboard-panel">
          <h3>Nhận xét tháng này</h3>
          <p className="insight-text">{dashboard?.insight || 'Chưa có dữ liệu chi tiêu trong tháng này.'}</p>
          <div className="top-categories">
            {expenseByCategory.slice(0, 3).map((item, index) => (
              <div className="top-category" key={item.categoryId}>
                <span className="rank">{index + 1}</span>
                <div><strong>{item.categoryName}</strong><p>{item.percent}% · {moneyFormatter.format(item.amount)}</p></div>
              </div>
            ))}
            {!expenseByCategory.length ? <p className="empty-state compact-empty">Chưa có top danh mục.</p> : null}
          </div>
        </article>
      </section>
    </>
  );
}
