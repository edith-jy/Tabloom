
const expenseForm = document.querySelector('#expense-form');
const expensesList = document.querySelector('#expenses-list');
const outstandingTotal = document.querySelector('#outstanding-total');
const formMessage = document.querySelector('#form-message');

// Retrieve and display expenses
async function loadExpenses() {
  try {
    const response = await fetch('/api/expenses');

    if (!response.ok) {
      throw new Error('Unable to load expenses.');
    }

    const expenses = await response.json();

    displayExpenses(expenses);
    calculateOutstanding(expenses);
  } catch (error) {
    expensesList.textContent = 'Unable to load expenses.';
    console.error(error);
  }
}

// Display expenses on the page
function displayExpenses(expenses) {
  expensesList.replaceChildren();

  if (expenses.length === 0) {
    expensesList.textContent = 'No expenses yet. Add one above!';
    return;
  }

  expenses.forEach(expense => {
    const card = document.createElement('article');
    card.className = 'expense-card';

    const title = document.createElement('h3');
    title.textContent = expense.description;

    const amount = document.createElement('p');
    amount.textContent = `$${Number(expense.amount).toFixed(2)}`;

    const people = document.createElement('p');
    people.textContent = `${expense.paid_by} paid for ${expense.owed_by}`;

    const date = document.createElement('p');
    date.textContent = new Date(expense.date).toLocaleDateString();

    const status = document.createElement('p');
    status.className = 'paid-status';
    status.textContent = expense.is_paid ? 'Paid' : 'Unpaid';

    const actions = document.createElement('div');
    actions.className = 'expense-actions';

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => editExpense(expense));

    const paidButton = document.createElement('button');
    paidButton.textContent = expense.is_paid ? 'Mark unpaid' : 'Mark paid';
    paidButton.addEventListener('click', () => togglePaid(expense));

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-button';
    deleteButton.addEventListener('click', () => deleteExpense(expense._id));

    actions.append(editButton, paidButton, deleteButton);

    card.append(title, amount, people, date, status, actions);
    expensesList.append(card);
  });
}

// Calculate the outstanding total
function calculateOutstanding(expenses) {
  const total = expenses
    .filter(expense => !expense.is_paid)
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  outstandingTotal.textContent = `$${total.toFixed(2)}`;
}

// Add an expense
expenseForm.addEventListener('submit', async event => {
  event.preventDefault();

  const formData = new FormData(expenseForm);

  const expense = {
    description: formData.get('description'),
    paid_by: formData.get('paid_by'),
    owed_by: formData.get('owed_by'),
    amount: Number(formData.get('amount')),
    date: formData.get('date')
  };

  try {
    const response = await fetch('/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(expense)
    });

    if (!response.ok) {
      throw new Error('Unable to add expense.');
    }

    expenseForm.reset();
    formMessage.textContent = 'Expense added successfully.';

    await loadExpenses();
  } catch (error) {
    formMessage.textContent = 'Something went wrong. Please try again.';
    console.error(error);
  }
});

// Edit an expense
async function editExpense(expense) {
  const description = prompt('Description:', expense.description);
  if (description === null) return;

  const paidBy = prompt('Paid by:', expense.paid_by);
  if (paidBy === null) return;

  const owedBy = prompt('Owed by:', expense.owed_by);
  if (owedBy === null) return;

  const amount = prompt('Amount:', expense.amount);
  if (amount === null) return;

  const date = prompt('Date (YYYY-MM-DD):', expense.date.slice(0, 10));
  if (date === null) return;

  const updates = {
    description,
    paid_by: paidBy,
    owed_by: owedBy,
    amount: Number(amount),
    date
  };

  try {
    const response = await fetch(`/api/expenses/${expense._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error('Unable to update expense.');
    }

    await loadExpenses();
  } catch (error) {
    alert('Unable to update expense. Please check the information.');
    console.error(error);
  }
}

// Mark an expense as paid or unpaid
async function togglePaid(expense) {
  try {
    const response = await fetch(`/api/expenses/${expense._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        is_paid: !expense.is_paid
      })
    });

    if (!response.ok) {
      throw new Error('Unable to update payment status.');
    }

    await loadExpenses();
  } catch (error) {
    alert('Unable to update payment status.');
    console.error(error);
  }
}

// Delete an expense
async function deleteExpense(id) {
  if (!confirm('Are you sure you want to delete this expense?')) {
    return;
  }

  try {
    const response = await fetch(`/api/expenses/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Unable to delete expense.');
    }

    await loadExpenses();
  } catch (error) {
    alert('Unable to delete expense.');
    console.error(error);
  }
}

// Load expenses when the page opens
loadExpenses();
