import { filterTransactions } from '../models/Transaction.js';
import { toCSV, toMarkdown, toPDF, toExcel, toDOCX } from '../utils/exportUtils.js';

const getRangeForPreset = (preset) => {
  const today = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  switch (preset) {
    case 'weekly': {
      const start = new Date(today); start.setDate(start.getDate() - 6);
      return { startDate: iso(start), endDate: iso(today) };
    }
    case 'monthly': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { startDate: iso(start), endDate: iso(today) };
    }
    case 'yearly': {
      const start = new Date(today.getFullYear(), 0, 1);
      return { startDate: iso(start), endDate: iso(today) };
    }
    default:
      return {};
  }
};

export const exportHandler = async (req, res) => {
  try {
    const { format = 'csv' } = req.params;
    const { preset, startDate, endDate, category, type, ids, title } = req.query;

    let range = {};
    if (preset && preset !== 'complete' && preset !== 'selected' && preset !== 'category' && preset !== 'range') {
      range = getRangeForPreset(preset);
    } else if (preset === 'range') {
      range = { startDate, endDate };
    }

    const idList = ids ? String(ids).split(',').map((n) => parseInt(n, 10)) : undefined;

    const transactions = await filterTransactions({
      category: category || undefined,
      type: type || undefined,
      startDate: range.startDate,
      endDate: range.endDate,
      ids: idList,
    });

    const reportTitle = title || 'Expense Statement';
    const filenameBase = `statement-${new Date().toISOString().slice(0, 10)}`;

    switch (format) {
      case 'csv': {
        const csv = toCSV(transactions);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.csv"`);
        return res.send(csv);
      }
      case 'md': {
        const md = toMarkdown(transactions, reportTitle);
        res.setHeader('Content-Type', 'text/markdown');
        res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.md"`);
        return res.send(md);
      }
      case 'pdf': {
        const buffer = await toPDF(transactions, reportTitle);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.pdf"`);
        return res.send(buffer);
      }
      case 'excel':
      case 'xlsx': {
        const buffer = await toExcel(transactions, reportTitle);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.xlsx"`);
        return res.send(buffer);
      }
      case 'docx': {
        const buffer = await toDOCX(transactions, reportTitle);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.docx"`);
        return res.send(buffer);
      }
      default:
        return res.status(400).json({ success: false, message: 'Unsupported format. Use csv, pdf, excel, docx, or md.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating export', error: error.message });
  }
};
