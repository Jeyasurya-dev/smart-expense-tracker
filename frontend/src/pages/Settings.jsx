import React, { useRef, useState } from 'react';
import { Sun, Moon, Download, Upload, DatabaseBackup, FileUp } from 'lucide-react';
import GlassPanel from '../components/GlassPanel';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { getBackupUrl, importBackup, getExportUrl } from '../services/api';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const fileRef = useRef(null);
  const [restoring, setRestoring] = useState(false);

  const handleRestoreFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoring(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await importBackup({ ...parsed, mode: 'merge' });
      showToast(res.message || 'Backup restored', 'success');
    } catch (err) {
      showToast(err.message || 'Invalid backup file', 'error');
    } finally {
      setRestoring(false);
      e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <GlassPanel title="Appearance">
        <div className="grid grid-cols-2 gap-3 max-w-md">
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium ${theme === 'dark' ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/60'}`}
          >
            <Moon className="w-4 h-4" /> Dark
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium ${theme === 'light' ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/60'}`}
          >
            <Sun className="w-4 h-4" /> Light
          </button>
        </div>
      </GlassPanel>

      <GlassPanel title="Backup & Restore">
        <p className="text-sm text-white/50 mb-4">
          Download a full backup of your transactions, budgets, and goals as JSON, or restore from a previous backup file.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href={getBackupUrl()} download
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl text-sm text-white"
          >
            <DatabaseBackup className="w-4 h-4" /> Download Backup
          </a>
          <button
            onClick={() => fileRef.current?.click()} disabled={restoring}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl text-sm text-white disabled:opacity-50"
          >
            <Upload className="w-4 h-4" /> {restoring ? 'Restoring...' : 'Restore from File'}
          </button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleRestoreFile} />
        </div>
      </GlassPanel>

      <GlassPanel title="Export Statements">
        <p className="text-sm text-white/50 mb-4">Download your complete transaction history in your preferred format.</p>
        <div className="flex flex-wrap gap-2">
          {['csv', 'pdf', 'excel', 'docx', 'md'].map((f) => (
            <a
              key={f} href={getExportUrl(f, { preset: 'complete' })} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl text-xs text-white uppercase"
            >
              <Download className="w-3.5 h-3.5" /> {f}
            </a>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel title="About">
        <div className="text-sm text-white/50 flex items-center gap-2">
          <FileUp className="w-4 h-4" /> ExpenseFlow · SQLite-powered · Local-first
        </div>
      </GlassPanel>
    </div>
  );
};

export default Settings;
