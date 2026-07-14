import React, { useEffect, useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, getDay, addMonths, subMonths } from 'date-fns';
import GlassPanel from '../components/GlassPanel';
import { getTransactions } from '../services/api';
import { formatCurrency } from '../utils/format';

const Calendar = () => {
  const [cursor, setCursor] = useState(new Date());
  const [txByDay, setTxByDay] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const load = async () => {
      const start = format(startOfMonth(cursor), 'yyyy-MM-dd');
      const end = format(endOfMonth(cursor), 'yyyy-MM-dd');
      const res = await getTransactions({ startDate: start, endDate: end, limit: 500, sortBy: 'date', sortOrder: 'ASC' });
      const map = {};
      res.data.forEach((t) => {
        if (!map[t.date]) map[t.date] = { income: 0, expense: 0, items: [] };
        map[t.date][t.type] += t.amount;
        map[t.date].items.push(t);
      });
      setTxByDay(map);
      setSelectedDay(null);
    };
    load();
  }, [cursor]);

  const days = useMemo(() => eachDayOfInterval({ start: startOfMonth(cursor), end: endOfMonth(cursor) }), [cursor]);
  const leadingBlanks = useMemo(() => getDay(startOfMonth(cursor)), [cursor]);

  return (
    <div className="flex flex-col gap-5">
      <GlassPanel
        title={format(cursor, 'MMMM yyyy')}
        action={
          <div className="flex gap-2">
            <button onClick={() => setCursor((c) => subMonths(c, 1))} className="p-2 rounded-lg bg-white/10 hover:bg-white/20"><ChevronLeft className="w-4 h-4 text-white" /></button>
            <button onClick={() => setCursor((c) => addMonths(c, 1))} className="p-2 rounded-lg bg-white/10 hover:bg-white/20"><ChevronRight className="w-4 h-4 text-white" /></button>
          </div>
        }
      >
        <div className="grid grid-cols-7 gap-2 text-center text-xs text-white/40 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: leadingBlanks }).map((_, i) => <div key={`b${i}`} />)}
          {days.map((d) => {
            const key = format(d, 'yyyy-MM-dd');
            const info = txByDay[key];
            const isToday = key === format(new Date(), 'yyyy-MM-dd');
            return (
              <button
                key={key} onClick={() => setSelectedDay(info ? key : null)}
                className={`aspect-square rounded-xl p-1.5 flex flex-col items-center justify-center text-xs transition-all ${
                  isToday ? 'ring-2 ring-indigo-400' : ''
                } ${info ? 'bg-white/10 hover:bg-white/20 cursor-pointer' : 'bg-white/5 text-white/30'}`}
              >
                <span className="text-white/70">{format(d, 'd')}</span>
                {info?.expense > 0 && <span className="text-[9px] text-red-400">-{formatCurrency(info.expense).replace('₹', '')}</span>}
                {info?.income > 0 && <span className="text-[9px] text-emerald-400">+{formatCurrency(info.income).replace('₹', '')}</span>}
              </button>
            );
          })}
        </div>
      </GlassPanel>

      {selectedDay && txByDay[selectedDay] && (
        <GlassPanel title={`Transactions on ${selectedDay}`}>
          <div className="flex flex-col divide-y divide-white/5">
            {txByDay[selectedDay].items.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-white">{t.title} <span className="text-white/40 text-xs">({t.category})</span></span>
                <span className={t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}
    </div>
  );
};

export default Calendar;
