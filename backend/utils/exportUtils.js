import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType } from 'docx';

const fmt = (n) => `Rs. ${Number(n).toFixed(2)}`;

const summarize = (transactions) => {
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  return { income, expense, balance: income - expense, count: transactions.length };
};

// ---------- CSV ----------
export const toCSV = (transactions) => {
  const header = ['ID', 'Date', 'Title', 'Category', 'Type', 'Amount', 'Notes', 'Tags'];
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = transactions.map(t =>
    [t.id, t.date, t.title, t.category, t.type, t.amount, t.notes, t.tags].map(escape).join(',')
  );
  return [header.join(','), ...rows].join('\n');
};

// ---------- Markdown ----------
export const toMarkdown = (transactions, title = 'Expense Statement') => {
  const s = summarize(transactions);
  let md = `# ${title}\n\n`;
  md += `Generated: ${new Date().toLocaleString()}\n\n`;
  md += `## Summary\n\n`;
  md += `- Total Income: ${fmt(s.income)}\n- Total Expense: ${fmt(s.expense)}\n- Net Balance: ${fmt(s.balance)}\n- Transactions: ${s.count}\n\n`;
  md += `## Transactions\n\n`;
  md += `| Date | Title | Category | Type | Amount | Notes |\n`;
  md += `|------|-------|----------|------|--------|-------|\n`;
  transactions.forEach(t => {
    md += `| ${t.date} | ${t.title} | ${t.category} | ${t.type} | ${fmt(t.amount)} | ${t.notes || ''} |\n`;
  });
  return md;
};

// ---------- PDF ----------
export const toPDF = (transactions, title = 'Expense Statement') =>
  new Promise((resolve, reject) => {
    try {
      const s = summarize(transactions);
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(20).text(title, { align: 'center' });
      doc.moveDown(0.3);
      doc.fontSize(9).fillColor('#666').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown();

      doc.fillColor('#000').fontSize(12).text('Summary', { underline: true });
      doc.fontSize(10);
      doc.text(`Total Income: ${fmt(s.income)}`);
      doc.text(`Total Expense: ${fmt(s.expense)}`);
      doc.text(`Net Balance: ${fmt(s.balance)}`);
      doc.text(`Total Transactions: ${s.count}`);
      doc.moveDown();

      doc.fontSize(12).text('Transactions', { underline: true });
      doc.moveDown(0.3);

      const colX = [40, 100, 220, 300, 360, 440];
      const headers = ['Date', 'Title', 'Category', 'Type', 'Amount', 'Notes'];
      doc.fontSize(9).font('Helvetica-Bold');
      headers.forEach((h, i) => doc.text(h, colX[i], doc.y, { continued: i < headers.length - 1, width: 90 }));
      doc.moveDown(0.5);
      doc.font('Helvetica');

      transactions.forEach((t) => {
        if (doc.y > 760) doc.addPage();
        const y = doc.y;
        doc.text(t.date, colX[0], y, { width: 55 });
        doc.text(t.title, colX[1], y, { width: 115 });
        doc.text(t.category, colX[2], y, { width: 75 });
        doc.text(t.type, colX[3], y, { width: 55 });
        doc.text(fmt(t.amount), colX[4], y, { width: 75 });
        doc.text(t.notes || '-', colX[5], y, { width: 110 });
        doc.moveDown(0.6);
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });

// ---------- Excel ----------
export const toExcel = async (transactions, title = 'Expense Statement') => {
  const workbook = new ExcelJS.Workbook();
  const s = summarize(transactions);

  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.addRow([title]);
  summarySheet.addRow([`Generated: ${new Date().toLocaleString()}`]);
  summarySheet.addRow([]);
  summarySheet.addRow(['Total Income', s.income]);
  summarySheet.addRow(['Total Expense', s.expense]);
  summarySheet.addRow(['Net Balance', s.balance]);
  summarySheet.addRow(['Total Transactions', s.count]);
  summarySheet.getColumn(1).width = 22;

  const sheet = workbook.addWorksheet('Transactions');
  sheet.columns = [
    { header: 'ID', key: 'id', width: 8 },
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Title', key: 'title', width: 25 },
    { header: 'Category', key: 'category', width: 16 },
    { header: 'Type', key: 'type', width: 10 },
    { header: 'Amount', key: 'amount', width: 14 },
    { header: 'Notes', key: 'notes', width: 25 },
    { header: 'Tags', key: 'tags', width: 18 },
  ];
  sheet.getRow(1).font = { bold: true };
  transactions.forEach((t) => sheet.addRow(t));

  return workbook.xlsx.writeBuffer();
};

// ---------- DOCX ----------
export const toDOCX = async (transactions, title = 'Expense Statement') => {
  const s = summarize(transactions);

  const tableRows = [
    new TableRow({
      children: ['Date', 'Title', 'Category', 'Type', 'Amount', 'Notes'].map(h =>
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })] })
      ),
    }),
    ...transactions.map(t => new TableRow({
      children: [t.date, t.title, t.category, t.type, fmt(t.amount), t.notes || ''].map(v =>
        new TableCell({ children: [new Paragraph(String(v))] })
      ),
    })),
  ];

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ text: title, heading: HeadingLevel.TITLE }),
        new Paragraph({ text: `Generated: ${new Date().toLocaleString()}` }),
        new Paragraph({ text: '' }),
        new Paragraph({ text: 'Summary', heading: HeadingLevel.HEADING_2 }),
        new Paragraph(`Total Income: ${fmt(s.income)}`),
        new Paragraph(`Total Expense: ${fmt(s.expense)}`),
        new Paragraph(`Net Balance: ${fmt(s.balance)}`),
        new Paragraph(`Total Transactions: ${s.count}`),
        new Paragraph({ text: '' }),
        new Paragraph({ text: 'Transactions', heading: HeadingLevel.HEADING_2 }),
        new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: tableRows }),
      ],
    }],
  });

  return Packer.toBuffer(doc);
};
