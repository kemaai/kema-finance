import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const escapeCsv = (val: unknown): string => {
  const s = val === null || val === undefined ? '' : String(val);
  if (/[",;\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

export interface ReportSection {
  title: string;
  rows: Array<[string, string | number]>;
}

export const exportReportCSV = (
  filename: string,
  sections: ReportSection[],
) => {
  const lines: string[] = [];
  for (const section of sections) {
    lines.push(escapeCsv(section.title));
    lines.push('Métrica;Valor');
    for (const [k, v] of section.rows) {
      lines.push(`${escapeCsv(k)};${escapeCsv(v)}`);
    }
    lines.push('');
  }
  // BOM for Excel UTF-8
  const blob = new Blob(['\uFEFF' + lines.join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  triggerDownload(blob, filename.replace(/\.[a-z]+$/i, '') + '.csv');
};

export const exportReportPDF = (
  filename: string,
  title: string,
  subtitle: string,
  sections: ReportSection[],
) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.text(title, pageWidth / 2, 40, { align: 'center' });
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(subtitle, pageWidth / 2, 58, { align: 'center' });
  doc.setTextColor(0);

  let cursorY = 80;
  for (const section of sections) {
    autoTable(doc, {
      startY: cursorY,
      head: [[section.title, '']],
      body: section.rows.map(([k, v]) => [k, String(v)]),
      theme: 'striped',
      headStyles: { fillColor: [249, 115, 22] }, // primary orange
      styles: { fontSize: 9 },
      margin: { left: 40, right: 40 },
    });
    // @ts-expect-error lastAutoTable adicionado por jspdf-autotable
    cursorY = (doc.lastAutoTable?.finalY || cursorY) + 20;
  }

  doc.save(filename.replace(/\.[a-z]+$/i, '') + '.pdf');
};