import express from 'express';
import mongoose from 'mongoose';
import { connectDatabase } from './database.js';
import { ResumeItem } from './resume-item.js';

export const app = express();
app.use(express.json({ limit: '16kb' }));

app.get('/api/resume-items', async (req, res, next) => {
  try {
    await connectDatabase();
    const items = await ResumeItem.find().lean();
    res.json(items);
  } catch (error) {
    next(error);
  }
});

app.post('/api/resume-items', async (req, res, next) => {
  try {
    const { job_title, start_year, end_year, employer, accomplishment } = req.body || {};
    const item = new ResumeItem({ job_title, start_year, end_year, employer, accomplishment });
    await item.validate();
    await connectDatabase();
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: 'Please check the resume item fields and try again.' });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must contain valid JSON.' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large.' });
  }
  console.error('Resume API error:', error.name);
  res.status(500).json({ error: 'Unable to process the request. Please try again later.' });
});
