import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TransactionItem from './TransactionItem';

describe('TransactionItem Component', () => {
  const transaction = {
    id: 'tx-1',
    type: 'expense',
    amount: 150000,
    categoryName: 'An uong',
    categoryColor: '#ef4444',
    walletName: 'Vi chinh',
    transactionDate: '2026-05-28',
    note: 'Ca phe sang'
  };

  it('hiển thị thông tin giao dịch đúng đắn', () => {
    render(<TransactionItem transaction={transaction} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('An uong')).toBeInTheDocument();
    expect(screen.getByText('Ca phe sang')).toBeInTheDocument();
    expect(screen.getByText(/Vi chinh/)).toBeInTheDocument();
    expect(screen.getByText(/2026-05-28/)).toBeInTheDocument();
    expect(screen.getByText(/-.*150\.000/)).toBeInTheDocument();
  });

  it('gọi hàm onEdit khi click nút Sua', () => {
    const handleEdit = vi.fn();
    render(<TransactionItem transaction={transaction} onEdit={handleEdit} onDelete={vi.fn()} />);

    fireEvent.click(screen.getByText('Sua'));
    expect(handleEdit).toHaveBeenCalled();
  });

  it('gọi hàm onDelete khi click nút Xoa', () => {
    const handleDelete = vi.fn();
    render(<TransactionItem transaction={transaction} onEdit={vi.fn()} onDelete={handleDelete} />);

    fireEvent.click(screen.getByText('Xoa'));
    expect(handleDelete).toHaveBeenCalled();
  });

  it('hiển thị badge định kỳ khi có sourceRecurringId', () => {
    const recurringTx = { ...transaction, sourceRecurringId: 'rec-1' };
    render(<TransactionItem transaction={recurringTx} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Dinh ky')).toBeInTheDocument();
  });
});
