import React, { useEffect, useState } from 'react';
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank, CalendarClock,
  Receipt, ArrowDownCircle, ArrowUpCircle,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import GlassPanel from '../components/GlassPanel';
import { SkeletonStatGrid, SkeletonBlock } from '../components/Skeleton';
import IncomeExpenseChart from '../components/charts/IncomeExpenseChart';
import MonthlyOverviewChart from '../components/charts/MonthlyOverviewChart';
import CategoryDistributionChart from '../components/charts/CategoryDistributionChart';
import WeeklySpendingChart from '../components/charts/WeeklySpendingChart';
import CashFlowChart from '../components/charts/CashFlowChart';
import { getSummary, getCharts } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/format';
import { getCategoryMeta } from '../utils/categories';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [s, c] = await Promise.all([getSummary(), getCharts()]);
    setSummary(s.data);
    setCharts(c.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading || !summary || !charts) {
    return (
      <div className="flex flex-col gap-6">
        <SkeletonStatGrid count={8} />
        <div className="grid md:grid-cols-2 gap-4">
          <SkeletonBlock className="h-72" />
          <SkeletonBlock className="h-72" />
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Balance', value: formatCurrency(summary.totalBalance), icon: Wallet, accent: 'from-indigo-500 to-violet-500' },
    { label: 'Total Income', value: formatCurrency(summary.totalIncome), icon: TrendingUp, accent: 'from-emerald-500 to-teal-500' },
    { label: 'Total Expense', value: formatCurrency(summary.totalExpense), icon: TrendingDown, accent: 'from-red-500 to-rose-500' },
    { label: 'Monthly Savings', value: formatCurrency(summary.monthlySavings), icon: PiggyBank, accent: 'from-amber-500 to-orange-500' },
    { label: 'Monthly Income', value: formatCurrency(summary.monthlyIncome), icon: ArrowUpCircle, accent: 'from-emerald-500 to-lime-500' },
    { label: 'Monthly Expense', value: formatCurrency(summary.monthlyExpense), icon: ArrowDownCircle, accent: 'from-rose-500 to-pink-500' },
    { label: 'Total Transactions', value: summary.totalTransactions, icon: Receipt, accent: 'from-sky-500 to-cyan-500' },
    { label: "Today's Transactions", value: summary.todayTransactions, icon: CalendarClock, accent: 'from-fuchsia-500 to-purple-500' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.04} />)}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <GlassPanel title="Income vs Expense" delay={0.1}>
          <IncomeExpenseChart data={charts.incomeVsExpense} />
        </GlassPanel>
        <GlassPanel title="Monthly Overview" delay={0.15}>
          <MonthlyOverviewChart data={charts.monthlyOverview} />
        </GlassPanel>
        <GlassPanel title="Category Distribution" delay={0.2}>
          <CategoryDistributionChart data={charts.categoryDistribution} />
        </GlassPanel>
        <GlassPanel title="Weekly Spending" delay={0.25}>
          <WeeklySpendingChart data={charts.weeklySpending} />
        </GlassPanel>
        <GlassPanel title="Cash Flow (30 days)" className="md:col-span-2" delay={0.3}>
          <CashFlowChart data={charts.cashFlow} />
        </GlassPanel>
      </div>

      <GlassPanel title="Recent Activity" delay={0.35}>
        <div className="flex flex-col divide-y divide-white/5">
          {summary.recentActivity.map((t) => {
            const meta = getCategoryMeta(t.category);
            const Icon = meta.icon;
            return (
              <div key={t.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${meta.bg}`}>
                    <Icon className={`w-4 h-4 ${meta.text}`} />
                  </div>
                  <div>
                    <div className="text-sm text-white font-medium">{t.title}</div>
                    <div className="text-xs text-white/40">{formatDateTime(t.createdAt)}</div>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
              </div>
            );
          })}
          {summary.recentActivity.length === 0 && (
            <div className="text-center py-8 text-white/40 text-sm">No activity yet — add your first transaction!</div>
          )}
        </div>
      </GlassPanel>
    </div>
  );
};

export default Dashboard;
