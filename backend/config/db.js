import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../database.db');

const sqlite3Verbose = sqlite3.verbose();

let db = null;

// --- Promise wrappers around sqlite3's callback API ---
export const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });

export const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });

export const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

export const exec = (sql) =>
  new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

const SCHEMA = `
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  amount REAL NOT NULL CHECK(amount > 0),
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  category TEXT NOT NULL DEFAULT 'Others',
  date TEXT NOT NULL DEFAULT (date('now')),
  notes TEXT DEFAULT '',
  tags TEXT DEFAULT '',
  receiptImage TEXT DEFAULT NULL,
  isRecurring INTEGER NOT NULL DEFAULT 0,
  recurringFrequency TEXT DEFAULT NULL,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE TRIGGER IF NOT EXISTS trg_transactions_updated
AFTER UPDATE ON transactions
FOR EACH ROW
BEGIN
  UPDATE transactions SET updatedAt = datetime('now') WHERE id = NEW.id;
END;

CREATE TABLE IF NOT EXISTS budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  month TEXT NOT NULL,
  limitAmount REAL NOT NULL CHECK(limitAmount >= 0),
  createdAt TEXT DEFAULT (datetime('now')),
  UNIQUE(category, month)
);

CREATE TABLE IF NOT EXISTS goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  targetAmount REAL NOT NULL CHECK(targetAmount > 0),
  currentAmount REAL NOT NULL DEFAULT 0,
  deadline TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
`;

export const initializeDB = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3Verbose.Database(dbPath, (err) => {
      if (err) {
        console.error(`Error opening database: ${err.message}`);
        return reject(err);
      }
      console.log(`SQLite database connected at: ${dbPath}`);
    });

    db.exec(SCHEMA, (err) => {
      if (err) {
        console.error(`Error initializing schema: ${err.message}`);
        return reject(err);
      }
      console.log('All tables ensured (transactions, budgets, goals).');
      resolve(db);
    });
  });
};

export const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDB() first.');
  }
  return db;
};

export { dbPath };
export default { initializeDB, getDB, run, get, all, exec };
