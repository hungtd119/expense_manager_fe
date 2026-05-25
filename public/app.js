const tokenKey = 'expense_manager_token';
let mode = 'login';
let currentUser = null;
let categories = [];
let wallets = [];
let transactions = [];
let dashboard = null;
let budgets = [];
let recurringTransactions = [];
let isLoading = false;

const authForm = document.querySelector('#authForm');
const formMessage = document.querySelector('#formMessage');
const submitButton = document.querySelector('#submitButton');
const nameField = document.querySelector('.name-field');
const tabs = document.querySelectorAll('.tab');
const sessionPanel = document.querySelector('#sessionPanel');
const sessionUser = document.querySelector('#sessionUser');
const logoutButton = document.querySelector('#logoutButton');
const trackerApp = document.querySelector('#trackerApp');
const transactionForm = document.querySelector('#transactionForm');
const transactionIdInput = document.querySelector('#transactionId');
const amountInput = document.querySelector('#amount');
const categorySelect = document.querySelector('#category');
const walletSelect = document.querySelector('#wallet');
const dateInput = document.querySelector('#transactionDate');
const noteInput = document.querySelector('#note');
const monthFilter = document.querySelector('#monthFilter');
const transactionMessage = document.querySelector('#transactionMessage');
const saveTransactionButton = document.querySelector('#saveTransactionButton');
const cancelEditButton = document.querySelector('#cancelEditButton');
const transactionList = document.querySelector('#transactionList');
const refreshButton = document.querySelector('#refreshButton');
const incomeTotal = document.querySelector('#incomeTotal');
const expenseTotal = document.querySelector('#expenseTotal');
const balanceTotal = document.querySelector('#balanceTotal');
const savingsRate = document.querySelector('#savingsRate');
const transactionCount = document.querySelector('#transactionCount');
const averageExpense = document.querySelector('#averageExpense');
const categoryBreakdown = document.querySelector('#categoryBreakdown');
const topCategoryLabel = document.querySelector('#topCategoryLabel');
const monthInsight = document.querySelector('#monthInsight');
const topCategories = document.querySelector('#topCategories');
const budgetForm = document.querySelector('#budgetForm');
const budgetIdInput = document.querySelector('#budgetId');
const budgetCategorySelect = document.querySelector('#budgetCategory');
const budgetLimitInput = document.querySelector('#budgetLimit');
const saveBudgetButton = document.querySelector('#saveBudgetButton');
const cancelBudgetEditButton = document.querySelector('#cancelBudgetEditButton');
const budgetMessage = document.querySelector('#budgetMessage');
const budgetList = document.querySelector('#budgetList');
const budgetSummaryLabel = document.querySelector('#budgetSummaryLabel');
const recurringForm = document.querySelector('#recurringForm');
const recurringIdInput = document.querySelector('#recurringId');
const recurringAmountInput = document.querySelector('#recurringAmount');
const recurringCategorySelect = document.querySelector('#recurringCategory');
const recurringWalletSelect = document.querySelector('#recurringWallet');
const recurringFrequencySelect = document.querySelector('#recurringFrequency');
const recurringNextRunDateInput = document.querySelector('#recurringNextRunDate');
const recurringNoteInput = document.querySelector('#recurringNote');
const saveRecurringButton = document.querySelector('#saveRecurringButton');
const cancelRecurringEditButton = document.querySelector('#cancelRecurringEditButton');
const recurringMessage = document.querySelector('#recurringMessage');
const recurringList = document.querySelector('#recurringList');
const recurringSummaryLabel = document.querySelector('#recurringSummaryLabel');

const moneyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
});

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonth() {
  return todayDate().slice(0, 7);
}

function currentDateTimeLocal() {
  const date = new Date();
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function setMessage(message, variant = 'error') {
  formMessage.textContent = message;
  formMessage.classList.toggle('success', variant === 'success');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDateTimeLocal(value) {
  if (!value) return 'Chua dat lich';
  const normalized = value.includes('T') ? value : `${value}T00:00`;
  const [datePart, timePart = '00:00'] = normalized.split('T');
  const [year, month, day] = datePart.split('-');
  const [hour, minute] = timePart.split(':');
  if (!year || !month || !day || !hour || !minute) return value;
  return `${day}/${month}/${year} ${hour}:${minute}`;
}

function setTransactionMessage(message, variant = 'error') {
  transactionMessage.textContent = message;
  transactionMessage.classList.toggle('success', variant === 'success');
}

function setBudgetMessage(message, variant = 'error') {
  budgetMessage.textContent = message;
  budgetMessage.classList.toggle('success', variant === 'success');
}

function setRecurringMessage(message, variant = 'error') {
  recurringMessage.textContent = message;
  recurringMessage.classList.toggle('success', variant === 'success');
}

function setLoading(nextValue) {
  isLoading = nextValue;
  trackerApp.classList.toggle('is-loading', isLoading);
  refreshButton.disabled = isLoading;
  if (isLoading) {
    refreshButton.textContent = 'Dang tai';
  } else {
    refreshButton.textContent = 'Tai lai';
  }
}

function setMode(nextMode) {
  mode = nextMode;
  tabs.forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.mode === mode);
  });
  nameField.classList.toggle('hidden', mode !== 'register');
  submitButton.textContent = mode === 'register' ? 'Dang ky' : 'Dang nhap';
  setMessage('');
}

async function request(path, options = {}) {
  const token = localStorage.getItem(tokenKey);
  const response = await fetch(path, {
    ...options,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Co loi xay ra.');
  }
  return data;
}

function showSession(user) {
  currentUser = user;
  sessionPanel.classList.remove('hidden');
  trackerApp.classList.remove('hidden');
  sessionUser.textContent = `${user.name} (${user.email})`;
}

function hideSession() {
  currentUser = null;
  sessionPanel.classList.add('hidden');
  trackerApp.classList.add('hidden');
  sessionUser.textContent = '';
  transactions = [];
  dashboard = null;
  budgets = [];
  recurringTransactions = [];
  renderTransactions();
  renderDashboard();
  renderBudgets();
  renderRecurringTransactions();
}

function selectedType() {
  return document.querySelector('input[name="transactionType"]:checked').value;
}

function selectedRecurringType() {
  return document.querySelector('input[name="recurringType"]:checked').value;
}

function setSelectedType(type) {
  const input = document.querySelector(`input[name="transactionType"][value="${type}"]`);
  if (input) input.checked = true;
  renderCategoryOptions();
}

function setSelectedRecurringType(type) {
  const input = document.querySelector(`input[name="recurringType"][value="${type}"]`);
  if (input) input.checked = true;
  renderRecurringCategoryOptions();
}

function renderCategoryOptions() {
  const type = selectedType();
  const options = categories
    .filter((category) => category.type === type)
    .map((category) => `<option value="${category.id}">${category.name}</option>`)
    .join('');
  categorySelect.innerHTML = options;
}

function renderBudgetCategoryOptions() {
  budgetCategorySelect.innerHTML = categories
    .filter((category) => category.type === 'expense')
    .map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`)
    .join('');
}

function renderRecurringCategoryOptions() {
  const type = selectedRecurringType();
  recurringCategorySelect.innerHTML = categories
    .filter((category) => category.type === type)
    .map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`)
    .join('');
}

function renderWalletOptions() {
  walletSelect.innerHTML = wallets
    .map((wallet) => `<option value="${wallet.id}">${wallet.name} (${wallet.currency})</option>`)
    .join('');
  recurringWalletSelect.innerHTML = wallets
    .map((wallet) => `<option value="${wallet.id}">${escapeHtml(wallet.name)} (${wallet.currency})</option>`)
    .join('');
}

function resetTransactionForm() {
  transactionForm.reset();
  transactionIdInput.value = '';
  dateInput.value = todayDate();
  setSelectedType('expense');
  saveTransactionButton.textContent = 'Luu giao dich';
  cancelEditButton.classList.add('hidden');
  setTransactionMessage('');
}

function resetBudgetForm() {
  budgetForm.reset();
  budgetIdInput.value = '';
  saveBudgetButton.textContent = 'Luu ngan sach';
  cancelBudgetEditButton.classList.add('hidden');
  setBudgetMessage('');
}

function resetRecurringForm() {
  recurringForm.reset();
  recurringIdInput.value = '';
  recurringNextRunDateInput.value = currentDateTimeLocal();
  setSelectedRecurringType('expense');
  saveRecurringButton.textContent = 'Luu dinh ky';
  cancelRecurringEditButton.classList.add('hidden');
  setRecurringMessage('');
}

function transactionPayload() {
  return {
    type: selectedType(),
    amount: Number(amountInput.value),
    categoryId: categorySelect.value,
    walletId: walletSelect.value,
    transactionDate: dateInput.value,
    note: noteInput.value
  };
}

function budgetPayload() {
  return {
    categoryId: budgetCategorySelect.value,
    amountLimit: Number(budgetLimitInput.value)
  };
}

function recurringPayload() {
  return {
    type: selectedRecurringType(),
    amount: Number(recurringAmountInput.value),
    categoryId: recurringCategorySelect.value,
    walletId: recurringWalletSelect.value,
    frequency: recurringFrequencySelect.value,
    nextRunAt: recurringNextRunDateInput.value,
    note: recurringNoteInput.value,
    active: true
  };
}

function renderSummary() {
  const totals = dashboard?.totals || { income: 0, expense: 0, balance: 0, savingsRate: 0 };
  const counts = dashboard?.counts || { all: 0 };

  incomeTotal.textContent = moneyFormatter.format(totals.income);
  expenseTotal.textContent = moneyFormatter.format(totals.expense);
  balanceTotal.textContent = moneyFormatter.format(totals.balance);
  savingsRate.textContent = `${totals.savingsRate}%`;
  transactionCount.textContent = counts.all;
  averageExpense.textContent = moneyFormatter.format(dashboard?.averageExpense || 0);
}

function renderDashboard() {
  renderSummary();

  const expenseByCategory = dashboard?.expenseByCategory || [];
  if (!expenseByCategory.length) {
    categoryBreakdown.innerHTML = '<p class="empty-state">Chua co chi tieu de hien thi bieu do.</p>';
    topCategories.innerHTML = '<p class="empty-state compact-empty">Chua co top danh muc.</p>';
    topCategoryLabel.textContent = 'Chua co du lieu';
    monthInsight.textContent = dashboard?.insight || 'Chua co du lieu chi tieu trong thang nay.';
    return;
  }

  topCategoryLabel.textContent = `Top: ${expenseByCategory[0].categoryName}`;
  monthInsight.textContent = dashboard.insight;

  categoryBreakdown.innerHTML = expenseByCategory
    .map(
      (item) => `
        <div class="category-row">
          <div class="category-row-head">
            <span>
              <i style="background:${item.categoryColor}"></i>
              ${escapeHtml(item.categoryName)}
            </span>
            <strong>${moneyFormatter.format(item.amount)}</strong>
          </div>
          <div class="bar-track" aria-hidden="true">
            <div class="bar-fill" style="width:${Math.max(item.percent, 2)}%; background:${item.categoryColor}"></div>
          </div>
          <div class="category-row-foot">
            <span>${item.count} giao dich</span>
            <span>${item.percent}% tong chi</span>
          </div>
        </div>
      `
    )
    .join('');

  topCategories.innerHTML = expenseByCategory
    .slice(0, 3)
    .map(
      (item, index) => `
        <div class="top-category">
          <span class="rank">${index + 1}</span>
          <div>
            <strong>${escapeHtml(item.categoryName)}</strong>
            <p>${item.percent}% · ${moneyFormatter.format(item.amount)}</p>
          </div>
        </div>
      `
    )
    .join('');
}

function renderTransactions() {
  renderDashboard();

  if (!transactions.length) {
    transactionList.innerHTML = '<p class="empty-state">Chua co giao dich trong thang nay.</p>';
    return;
  }

  transactionList.innerHTML = transactions
    .map((transaction) => {
      const sign = transaction.type === 'income' ? '+' : '-';
      const note = transaction.note ? `<p>${escapeHtml(transaction.note)}</p>` : '';
      const recurringBadge = transaction.sourceRecurringId
        ? '<span class="source-badge">Dinh ky</span>'
        : '';
      return `
        <article class="transaction-item" data-id="${transaction.id}">
          <div class="transaction-main">
            <span class="category-dot" style="background:${transaction.categoryColor || '#657084'}"></span>
            <div>
              <div class="item-title-line">
                <strong>${escapeHtml(transaction.categoryName || 'Khong ro')}</strong>
                ${recurringBadge}
              </div>
              <p>${transaction.transactionDate} · ${escapeHtml(transaction.walletName || 'Vi')}</p>
              ${note}
            </div>
          </div>
          <div class="transaction-side ${transaction.type}">
            <strong>${sign}${moneyFormatter.format(transaction.amount)}</strong>
            <div class="row-actions">
              <button class="link-button" data-action="edit" type="button">Sua</button>
              <button class="link-button danger" data-action="delete" type="button">Xoa</button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderBudgets() {
  budgetSummaryLabel.textContent = `${budgets.length} ngan sach`;

  if (!budgets.length) {
    budgetList.innerHTML = '<p class="empty-state">Chua co ngan sach trong thang nay.</p>';
    return;
  }

  budgetList.innerHTML = budgets
    .map((budget) => {
      const width = Math.min(Math.max(budget.percentUsed, 2), 100);
      const statusText =
        budget.alertLevel === 'exceeded'
          ? 'Vuot ngan sach'
          : budget.alertLevel === 'warning'
            ? 'Gan vuot'
            : 'On dinh';
      return `
        <article class="budget-item ${budget.alertLevel}" data-id="${budget.id}">
          <div class="budget-head">
            <div>
              <strong>
                <i style="background:${budget.categoryColor}"></i>
                ${escapeHtml(budget.categoryName)}
              </strong>
              <p>${budget.alertMessage}</p>
            </div>
            <span class="budget-badge ${budget.alertLevel}">${statusText}</span>
          </div>
          <div class="bar-track tall" aria-hidden="true">
            <div class="bar-fill ${budget.alertLevel}" style="width:${width}%"></div>
          </div>
          <div class="budget-meta">
            <span>${moneyFormatter.format(budget.spent)} / ${moneyFormatter.format(budget.amountLimit)}</span>
            <span>${budget.percentUsed}%</span>
          </div>
          <div class="budget-actions">
            <button class="link-button" data-action="edit-budget" type="button">Sua</button>
            <button class="link-button danger" data-action="delete-budget" type="button">Xoa</button>
          </div>
        </article>
      `;
    })
    .join('');
}

function frequencyLabel(frequency) {
  if (frequency === 'daily') return 'Hang ngay';
  if (frequency === 'weekly') return 'Hang tuan';
  return 'Hang thang';
}

function renderRecurringTransactions() {
  recurringSummaryLabel.textContent = `${recurringTransactions.length} khoan`;

  if (!recurringTransactions.length) {
    recurringList.innerHTML = '<p class="empty-state">Chua co khoan dinh ky.</p>';
    return;
  }

  recurringList.innerHTML = recurringTransactions
    .map((recurring) => {
      const sign = recurring.type === 'income' ? '+' : '-';
      const note = recurring.note ? `<p>${escapeHtml(recurring.note)}</p>` : '';
      return `
        <article class="recurring-item ${recurring.active ? '' : 'inactive'}" data-id="${recurring.id}">
          <div class="recurring-main">
            <span class="category-dot" style="background:${recurring.categoryColor || '#657084'}"></span>
            <div>
              <strong>${escapeHtml(recurring.categoryName || 'Khong ro')}</strong>
              <p>${frequencyLabel(recurring.frequency)} · chay tiep ${formatDateTimeLocal(recurring.nextRunAt || recurring.nextRunDate)}</p>
              ${note}
            </div>
          </div>
          <div class="recurring-side ${recurring.type}">
            <strong>${sign}${moneyFormatter.format(recurring.amount)}</strong>
            <div class="row-actions">
              <button class="link-button" data-action="edit-recurring" type="button">Sua</button>
              <button class="link-button danger" data-action="delete-recurring" type="button">Tat</button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

async function loadReferenceData() {
  const [categoryData, walletData] = await Promise.all([
    request('/api/categories'),
    request('/api/wallets')
  ]);
  categories = categoryData.categories;
  wallets = walletData.wallets;
  renderCategoryOptions();
  renderBudgetCategoryOptions();
  renderRecurringCategoryOptions();
  renderWalletOptions();
}

async function loadTransactions() {
  setLoading(true);
  try {
    const recurringData = await request('/api/recurring-transactions');
    recurringTransactions = recurringData.recurringTransactions;
    if (recurringData.generatedCount > 0) {
      setRecurringMessage(`Da tao ${recurringData.generatedCount} giao dich dinh ky den han.`, 'success');
    }

    const [transactionData, dashboardData, budgetData] = await Promise.all([
      request(`/api/transactions?month=${monthFilter.value}`),
      request(`/api/dashboard?month=${monthFilter.value}`),
      request(`/api/budgets?month=${monthFilter.value}`)
    ]);
    dashboard = dashboardData.dashboard;
    budgets = budgetData.budgets;
    transactions = transactionData.transactions;
    renderTransactions();
    renderBudgets();
    renderRecurringTransactions();
  } catch (error) {
    setTransactionMessage(error.message);
  } finally {
    setLoading(false);
  }
}

async function bootTracker() {
  monthFilter.value = currentMonth();
  dateInput.value = todayDate();
  await loadReferenceData();
  resetTransactionForm();
  resetBudgetForm();
  resetRecurringForm();
  await loadTransactions();
}

async function loadSession() {
  const token = localStorage.getItem(tokenKey);
  if (!token) {
    hideSession();
    return;
  }

  try {
    const data = await request('/api/me');
    showSession(data.user);
    await bootTracker();
  } catch {
    localStorage.removeItem(tokenKey);
    hideSession();
  }
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => setMode(tab.dataset.mode));
});

document.querySelectorAll('input[name="transactionType"]').forEach((input) => {
  input.addEventListener('change', renderCategoryOptions);
});

document.querySelectorAll('input[name="recurringType"]').forEach((input) => {
  input.addEventListener('change', renderRecurringCategoryOptions);
});

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setMessage('');
  submitButton.disabled = true;

  const payload = {
    email: document.querySelector('#email').value,
    password: document.querySelector('#password').value
  };

  if (mode === 'register') {
    payload.name = document.querySelector('#name').value;
  }

  try {
    const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const data = await request(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    localStorage.setItem(tokenKey, data.token);
    showSession(data.user);
    await bootTracker();
    setMessage(mode === 'register' ? 'Dang ky thanh cong.' : 'Dang nhap thanh cong.', 'success');
    authForm.reset();
  } catch (error) {
    setMessage(error.message);
  } finally {
    submitButton.disabled = false;
  }
});

transactionForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setTransactionMessage('');
  saveTransactionButton.disabled = true;

  try {
    const id = transactionIdInput.value;
    const endpoint = id ? `/api/transactions/${id}` : '/api/transactions';
    const method = id ? 'PUT' : 'POST';
    await request(endpoint, {
      method,
      body: JSON.stringify(transactionPayload())
    });
    await loadTransactions();
    resetTransactionForm();
    setTransactionMessage(id ? 'Da cap nhat giao dich.' : 'Da luu giao dich.', 'success');
  } catch (error) {
    setTransactionMessage(error.message);
  } finally {
    saveTransactionButton.disabled = false;
  }
});

budgetForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setBudgetMessage('');
  saveBudgetButton.disabled = true;

  try {
    const id = budgetIdInput.value;
    const endpoint = id ? `/api/budgets/${id}` : `/api/budgets?month=${monthFilter.value}`;
    const method = id ? 'PUT' : 'POST';
    await request(endpoint, {
      method,
      body: JSON.stringify(budgetPayload())
    });
    await loadTransactions();
    resetBudgetForm();
    setBudgetMessage(id ? 'Da cap nhat ngan sach.' : 'Da luu ngan sach.', 'success');
  } catch (error) {
    setBudgetMessage(error.message);
  } finally {
    saveBudgetButton.disabled = false;
  }
});

recurringForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setRecurringMessage('');
  saveRecurringButton.disabled = true;

  try {
    const id = recurringIdInput.value;
    const endpoint = id ? `/api/recurring-transactions/${id}` : '/api/recurring-transactions';
    const method = id ? 'PUT' : 'POST';
    const data = await request(endpoint, {
      method,
      body: JSON.stringify(recurringPayload())
    });
    await loadTransactions();
    resetRecurringForm();
    const generatedText = data.generatedCount > 0 ? ` Da tao ${data.generatedCount} giao dich den han.` : '';
    setRecurringMessage(
      `${id ? 'Da cap nhat khoan dinh ky.' : 'Da luu khoan dinh ky.'}${generatedText}`,
      'success'
    );
  } catch (error) {
    setRecurringMessage(error.message);
  } finally {
    saveRecurringButton.disabled = false;
  }
});

transactionList.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const item = button.closest('.transaction-item');
  const transaction = transactions.find((entry) => entry.id === item.dataset.id);
  if (!transaction) return;

  if (button.dataset.action === 'edit') {
    transactionIdInput.value = transaction.id;
    setSelectedType(transaction.type);
    amountInput.value = transaction.amount;
    categorySelect.value = transaction.categoryId;
    walletSelect.value = transaction.walletId;
    dateInput.value = transaction.transactionDate;
    noteInput.value = transaction.note || '';
    saveTransactionButton.textContent = 'Cap nhat giao dich';
    cancelEditButton.classList.remove('hidden');
    setTransactionMessage('');
    amountInput.focus();
    return;
  }

  if (button.dataset.action === 'delete') {
    const ok = window.confirm('Xoa giao dich nay?');
    if (!ok) return;

    try {
      await request(`/api/transactions/${transaction.id}`, { method: 'DELETE' });
      await loadTransactions();
      resetTransactionForm();
      setTransactionMessage('Da xoa giao dich.', 'success');
    } catch (error) {
      setTransactionMessage(error.message);
    }
  }
});

budgetList.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const item = button.closest('.budget-item');
  const budget = budgets.find((entry) => entry.id === item.dataset.id);
  if (!budget) return;

  if (button.dataset.action === 'edit-budget') {
    budgetIdInput.value = budget.id;
    budgetCategorySelect.value = budget.categoryId;
    budgetLimitInput.value = budget.amountLimit;
    saveBudgetButton.textContent = 'Cap nhat ngan sach';
    cancelBudgetEditButton.classList.remove('hidden');
    setBudgetMessage('');
    budgetLimitInput.focus();
    return;
  }

  if (button.dataset.action === 'delete-budget') {
    const ok = window.confirm('Xoa ngan sach nay?');
    if (!ok) return;

    try {
      await request(`/api/budgets/${budget.id}`, { method: 'DELETE' });
      await loadTransactions();
      resetBudgetForm();
      setBudgetMessage('Da xoa ngan sach.', 'success');
    } catch (error) {
      setBudgetMessage(error.message);
    }
  }
});

recurringList.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const item = button.closest('.recurring-item');
  const recurring = recurringTransactions.find((entry) => entry.id === item.dataset.id);
  if (!recurring) return;

  if (button.dataset.action === 'edit-recurring') {
    recurringIdInput.value = recurring.id;
    setSelectedRecurringType(recurring.type);
    recurringAmountInput.value = recurring.amount;
    recurringCategorySelect.value = recurring.categoryId;
    recurringWalletSelect.value = recurring.walletId;
    recurringFrequencySelect.value = recurring.frequency;
    recurringNextRunDateInput.value = recurring.nextRunAt || `${recurring.nextRunDate}T00:00`;
    recurringNoteInput.value = recurring.note || '';
    saveRecurringButton.textContent = 'Cap nhat dinh ky';
    cancelRecurringEditButton.classList.remove('hidden');
    setRecurringMessage('');
    recurringAmountInput.focus();
    return;
  }

  if (button.dataset.action === 'delete-recurring') {
    const ok = window.confirm('Tat khoan dinh ky nay?');
    if (!ok) return;

    try {
      await request(`/api/recurring-transactions/${recurring.id}`, { method: 'DELETE' });
      await loadTransactions();
      resetRecurringForm();
      setRecurringMessage('Da tat khoan dinh ky.', 'success');
    } catch (error) {
      setRecurringMessage(error.message);
    }
  }
});

cancelEditButton.addEventListener('click', resetTransactionForm);
cancelBudgetEditButton.addEventListener('click', resetBudgetForm);
cancelRecurringEditButton.addEventListener('click', resetRecurringForm);
refreshButton.addEventListener('click', loadTransactions);
monthFilter.addEventListener('change', async () => {
  resetBudgetForm();
  resetRecurringForm();
  await loadTransactions();
});

logoutButton.addEventListener('click', async () => {
  try {
    await request('/api/auth/logout', { method: 'POST' });
  } finally {
    localStorage.removeItem(tokenKey);
    hideSession();
    setMessage('Da dang xuat.', 'success');
  }
});

setMode('login');
loadSession();
