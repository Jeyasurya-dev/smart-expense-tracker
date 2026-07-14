import { all, run } from '../config/db.js';

export const exportBackup = async (_req, res) => {
  try {
    const transactions = await all('SELECT * FROM transactions');
    const budgets = await all('SELECT * FROM budgets');
    const goals = await all('SELECT * FROM goals');

    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      transactions, budgets, goals,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="backup-${new Date().toISOString().slice(0, 10)}.json"`);
    res.send(JSON.stringify(backup, null, 2));
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error exporting backup', error: error.message });
  }
};

export const importBackup = async (req, res) => {
  try {
    const { transactions = [], budgets = [], goals = [], mode = 'merge' } = req.body;

    if (mode === 'replace') {
      await run('DELETE FROM transactions');
      await run('DELETE FROM budgets');
      await run('DELETE FROM goals');
    }

    for (const t of transactions) {
      await run(
        `INSERT INTO transactions (title, amount, type, category, date, notes, tags, receiptImage, isRecurring, recurringFrequency)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.title, t.amount, t.type, t.category || 'Others', t.date, t.notes || '', t.tags || '',
          t.receiptImage || null, t.isRecurring ? 1 : 0, t.recurringFrequency || null]
      );
    }
    for (const b of budgets) {
      await run(
        `INSERT INTO budgets (category, month, limitAmount) VALUES (?, ?, ?)
         ON CONFLICT(category, month) DO UPDATE SET limitAmount = excluded.limitAmount`,
        [b.category, b.month, b.limitAmount]
      );
    }
    for (const g of goals) {
      await run(
        'INSERT INTO goals (name, targetAmount, currentAmount, deadline) VALUES (?, ?, ?, ?)',
        [g.name, g.targetAmount, g.currentAmount || 0, g.deadline || null]
      );
    }

    res.status(200).json({
      success: true,
      message: `Import complete (${mode}): ${transactions.length} transactions, ${budgets.length} budgets, ${goals.length} goals.`,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error importing backup', error: error.message });
  }
};

// CSV import for transactions only
export const importCSV = async (req, res) => {
  try {
    const { rows = [] } = req.body; // array of {title, amount, type, category, date, notes, tags}
    let inserted = 0;
    for (const r of rows) {
      if (!r.title || !r.amount || !r.type) continue;
      await run(
        `INSERT INTO transactions (title, amount, type, category, date, notes, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [r.title, parseFloat(r.amount), r.type, r.category || 'Others',
          r.date || new Date().toISOString().slice(0, 10), r.notes || '', r.tags || '']
      );
      inserted++;
    }
    res.status(200).json({ success: true, message: `Imported ${inserted} transactions.` });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error importing CSV', error: error.message });
  }
};
