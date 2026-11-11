import express from 'express';
import mongoose from 'mongoose';
import { connectDatabase } from './database.js';
import { Expense } from './expense.js';

export const app = express();
app.use(express.json({ limit: '16kb' }));

// READ: Retrieve all expenses
app.get('/api/expenses', async (req, res, next) => {
  try {
    await connectDatabase();

    const expenses = await Expense.find()
      .sort({ date: -1 })
      .lean();

    res.json(expenses);
  } catch (error) {
    next(error);
  }
});

// CREATE: Add an expense
app.post('/api/expenses', async (req, res, next) => {
  try {
    const { description, paid_by, owed_by, amount, date } = req.body || {};

    const item = new Expense({ description, paid_by, owed_by, amount, date });

    await connectDatabase();
    await item.validate();
    await item.save();

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

// UPDATE: Edit an expense
app.put('/api/expenses/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!/^[a-f\d]{24}$/i.test(id)) {
      return res.status(400).json({ error: 'Invalid expense ID.' });
    }

    const allowedFields = ['description', 'paid_by', 'owed_by', 'amount', 'date', 'is_paid'];
    const body = req.body || {};
    const updates = {};

    for (const field of allowedFields) {
      if (Object.hasOwn(body, field)) {
        updates[field] = body[field];
      }
    }

    await connectDatabase();

    const expense = await Expense.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found.' });
    }

    res.json(expense);
  } catch (error) {
    next(error);
  }
});

// DELETE: Remove an expense
app.delete('/api/expenses/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!/^[a-f\d]{24}$/i.test(id)) {
      return res.status(400).json({ error: 'Invalid expense ID.' });
    }

    await connectDatabase();
    const expense = await Expense.findByIdAndDelete(id);

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found.' });
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// Error handling
app.use((error, req, res, next) => {
  if (
    error instanceof mongoose.Error.ValidationError ||
    error instanceof mongoose.Error.CastError
  ) {
    return res.status(400).json({
      error: 'Please check the expense fields and try again.'
    });
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must contain valid JSON.' });
  }

  console.error('Expense API error:', error.name);
  res.status(500).json({ error: 'Unable to process the request. Please try again later.' });
});

