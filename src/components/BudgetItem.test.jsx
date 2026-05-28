import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BudgetItem from './BudgetItem';

describe('BudgetItem Component', () => {
  const budget = {
    id: 'b-1',
    categoryName: 'Mua sam',
    categoryColor: '#8b5cf6',
    amountLimit: 2000000,
    spent: 1200000,
    percentUsed: 60,
    alertLevel: 'ok',
    alertMessage: 'Dang trong gioi han.'
  };

  it('hiển thị thông tin ngân sách bình thường', () => {
    render(<BudgetItem budget={budget} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Mua sam')).toBeInTheDocument();
    expect(screen.getByText('On dinh')).toBeInTheDocument();
    expect(screen.getByText(/1\.200\.000.*2\.000\.000/)).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('hiển thị badge và màu sắc cảnh báo khi gần vượt', () => {
    const warningBudget = { ...budget, percentUsed: 85, alertLevel: 'warning' };
    render(<BudgetItem budget={warningBudget} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Gan vuot')).toBeInTheDocument();
  });

  it('gọi hàm onEdit và onDelete khi bấm nút', () => {
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();
    render(<BudgetItem budget={budget} onEdit={handleEdit} onDelete={handleDelete} />);

    fireEvent.click(screen.getByText('Sua'));
    expect(handleEdit).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Xoa'));
    expect(handleDelete).toHaveBeenCalled();
  });
});
