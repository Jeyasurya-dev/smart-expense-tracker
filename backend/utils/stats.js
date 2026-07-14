import { all, get } from '../config/db.js';

const todayStr = () => new Date().toISOString().slice(0, 10);
const monthStr = () => new Date().toISOString().slice(0, 7);

export const getSummary = async () => {
  const totals = await get(
    `SELECT
      COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END),0) as totalIncome,
      COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END),0) as totalExpense,
      COUNT(*) as totalTransactions
     FROM transactions`
  );

  const month = monthStr();
  const monthly = await get(
    `SELECT
      COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END),0) as monthlyIncome,
      COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END),0) as monthlyExpense
     FROM transactions WHERE strftime('%Y-%m', date) = ?`,
    [month]
  );

  const today = todayStr();
  const todayRow = await get(
    `SELECT COUNT(*) as todayCount FROM transactions WHERE date = ?`,
    [today]
  );

  const recent = await all(
    `SELECT * FROM transactions ORDER BY createdAt DESC, id DESC LIMIT 8`
  );

  return {
    totalBalance: totals.totalIncome - totals.totalExpense,
    totalIncome: totals.totalIncome,
    totalExpense: totals.totalExpense,
    totalTransactions: totals.totalTransactions,
    monthlyIncome: monthly.monthlyIncome,
    monthlyExpense: monthly.monthlyExpense,
    monthlySavings: monthly.monthlyIncome - monthly.monthlyExpense,
    todayTransactions: todayRow.todayCount,
    recentActivity: recent,
  };
};

export const getChartData = async () => {
  // Income vs Expense (overall)
  const incomeVsExpense = await get(
    `SELECT
      COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END),0) as income,
      COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END),0) as expense
     FROM transactions`
  );

  // Monthly overview - last 6 months
  const monthlyOverview = await all(
    `SELECT strftime('%Y-%m', date) as month,
      COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE 0 END),0) as income,
      COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END),0) as expense
     FROM transactions
     GROUP BY month
     ORDER BY month DESC
     LIMIT 6`
  );

  // Category distribution (expenses)
  const categoryDistribution = await all(
    `SELECT category, COALESCE(SUM(amount),0) as total
     FROM transactions WHERE type = 'expense'
     GROUP BY category ORDER BY total DESC`
  );

  // Weekly spending - last 7 days
  const weeklySpending = await all(
    `SELECT date, COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END),0) as expense
     FROM transactions
     WHERE date >= date('now','-6 days')
     GROUP BY date
     ORDER BY date ASC`
  );

  // Cash flow - running balance over last 30 days by date
  const cashFlowRaw = await all(
    `SELECT date,
      COALESCE(SUM(CASE WHEN type='income' THEN amount ELSE -amount END),0) as net
     FROM transactions
     WHERE date >= date('now','-29 days')
     GROUP BY date
     ORDER BY date ASC`
  );
  let running = 0;
  const cashFlow = cashFlowRaw.map((r) => {
    running += r.net;
    return { date: r.date, balance: running };
  });

  return {
    incomeVsExpense,
    monthlyOverview: monthlyOverview.reverse(),
    categoryDistribution,
    weeklySpending,
    cashFlow,
  };
};
