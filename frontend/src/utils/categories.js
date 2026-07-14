import {
  Banknote, Utensils, ShoppingCart, Receipt, ShoppingBag, Bus, Fuel,
  Home, CreditCard, Stethoscope, Clapperboard, Plane, GraduationCap,
  TrendingUp, MoreHorizontal,
} from 'lucide-react';

export const CATEGORIES = [
  'Salary', 'Food', 'Grocery', 'Bills', 'Shopping', 'Transport', 'Fuel',
  'Rent', 'EMI', 'Medical', 'Entertainment', 'Travel', 'Education',
  'Investment', 'Others',
];

export const CATEGORY_META = {
  Salary: { icon: Banknote, color: '#10b981', bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  Food: { icon: Utensils, color: '#f97316', bg: 'bg-orange-500/15', text: 'text-orange-400' },
  Grocery: { icon: ShoppingCart, color: '#84cc16', bg: 'bg-lime-500/15', text: 'text-lime-400' },
  Bills: { icon: Receipt, color: '#ef4444', bg: 'bg-red-500/15', text: 'text-red-400' },
  Shopping: { icon: ShoppingBag, color: '#ec4899', bg: 'bg-pink-500/15', text: 'text-pink-400' },
  Transport: { icon: Bus, color: '#06b6d4', bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
  Fuel: { icon: Fuel, color: '#f59e0b', bg: 'bg-amber-500/15', text: 'text-amber-400' },
  Rent: { icon: Home, color: '#8b5cf6', bg: 'bg-violet-500/15', text: 'text-violet-400' },
  EMI: { icon: CreditCard, color: '#6366f1', bg: 'bg-indigo-500/15', text: 'text-indigo-400' },
  Medical: { icon: Stethoscope, color: '#f43f5e', bg: 'bg-rose-500/15', text: 'text-rose-400' },
  Entertainment: { icon: Clapperboard, color: '#a855f7', bg: 'bg-purple-500/15', text: 'text-purple-400' },
  Travel: { icon: Plane, color: '#0ea5e9', bg: 'bg-sky-500/15', text: 'text-sky-400' },
  Education: { icon: GraduationCap, color: '#3b82f6', bg: 'bg-blue-500/15', text: 'text-blue-400' },
  Investment: { icon: TrendingUp, color: '#22c55e', bg: 'bg-green-500/15', text: 'text-green-400' },
  Others: { icon: MoreHorizontal, color: '#64748b', bg: 'bg-slate-500/15', text: 'text-slate-400' },
};

export const getCategoryMeta = (category) => CATEGORY_META[category] || CATEGORY_META.Others;
