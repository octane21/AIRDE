import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ORANGE = [249, 115, 22];
const DARK = [30, 41, 59];
const GREY = [100, 116, 139];
const RISK_COLOR = { EXTREME: [239, 68, 68], HIGH: [249, 115, 22], MEDIUM: [234, 179, 8], LOW: [34, 197, 94] };

function addHeader(doc, pageTitle) {
  doc.setFillColor(10, 22, 40);
  doc.rect(0, 0, 210, 24, 'F');
  doc.setTextColor(...ORANGE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('AIRDE', 14, 12);
  doc.setTextColor(226, 232, 240);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Asset & Reliability Intelligence — Pipeline Integrity Management', 14, 17.5);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(pageTitle, 196, 12, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 190, 205);
  doc.text(new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }), 196, 17.5, { align: 'right' });
}

function addFooter(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(...GREY);
    doc.text('AIRDE V20 — Generated automatically from live data', 14, 290);
    doc.text(`Halaman ${i} / ${pageCount}`, 196, 290, { align: 'right' });
  }
}

function sectionTitle(doc, text, y) {
  doc.setTextColor(...ORANGE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(text, 14, y);
  doc.setDrawColor(...ORANGE);
  doc.setLineWidth(0.6);
  doc.line(14, y + 1.5, 196, y + 1.5);
  return y + 8;
}

/**
 * Generates and downloads the AIRDE action/risk PDF report.
 * @param {object} params
 * @param {object} params.reportSummary - { executiveSummary, topPriority, recommendation }
 * @param {object} params.kpi - dashboard KPI snapshot (ahi, riskScore, inspectionCoverage, totalAssets)
 * @param {Array} params.urgentActions - actions joined with risk+asset data, priority P0/P1 first
 */
export function generateActionReportPDF({ reportSummary, kpi, urgentActions }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  // ===== Page 1: Cover + Executive Summary =====
  addHeader(doc, 'LAPORAN TINDAKAN & STRATEGI RISIKO');

  let y = 36;
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Laporan Tindakan & Strategi Risiko Aset', 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...GREY);
  doc.text('Ringkasan kondisi portofolio aset, tindakan yang perlu dilakukan segera, dan detail aset terkait.', 14, y);
  y += 10;

  // KPI strip
  const kpis = [
    { label: 'Asset Health Index', value: `${kpi?.ahi?.value ?? '-'}`, sub: kpi?.ahi?.label || '' },
    { label: 'Avg Risk Score', value: `${kpi?.riskScore?.value ?? '-'}`, sub: kpi?.riskScore?.label || '' },
    { label: 'Inspection Coverage', value: `${kpi?.inspectionCoverage?.value ?? '-'}`, sub: '' },
    { label: 'Total Assets', value: `${kpi?.totalAssets?.value ?? '-'}`, sub: kpi?.totalAssets?.sub || '' },
  ];
  const boxW = 44, boxH = 22, gap = 4;
  kpis.forEach((k, i) => {
    const x = 14 + i * (boxW + gap);
    doc.setFillColor(13, 31, 60);
    doc.setDrawColor(30, 45, 79);
    doc.roundedRect(x, y, boxW, boxH, 2, 2, 'FD');
    doc.setTextColor(...GREY);
    doc.setFontSize(7);
    doc.text(k.label.toUpperCase(), x + 3, y + 6);
    doc.setTextColor(...ORANGE);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(String(k.value), x + 3, y + 15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...GREY);
    doc.text(k.sub, x + 3, y + 19.5);
  });
  y += boxH + 12;

  y = sectionTitle(doc, 'Ringkasan Eksekutif', y);
  doc.setTextColor(...DARK);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);

  const blocks = [
    ['Kondisi Saat Ini', reportSummary?.executiveSummary],
    ['Prioritas Utama', reportSummary?.topPriority],
    ['Rekomendasi', reportSummary?.recommendation],
  ];
  for (const [label, text] of blocks) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...ORANGE);
    doc.text(label, 14, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK);
    const lines = doc.splitTextToSize(text || '-', 182);
    doc.text(lines, 14, y);
    y += lines.length * 4.6 + 5;
  }

  // ===== Tindakan yang Perlu Dilakukan Segera =====
  y += 2;
  y = sectionTitle(doc, 'Tindakan yang Perlu Dilakukan Segera (Priority P0 / P1)', y);

  const urgent = urgentActions.filter(a => a.priority === 'P0' || a.priority === 'P1');
  if (urgent.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(...GREY);
    doc.text('Tidak ada tindakan dengan prioritas P0/P1 saat ini — seluruh aset dalam kondisi terkendali.', 14, y);
    y += 8;
  } else {
    autoTable(doc, {
      startY: y,
      head: [['Asset ID', 'Strategi', 'Tindakan Direkomendasikan', 'Prioritas', 'Due Date', 'Risk Level']],
      body: urgent.map(a => [a.id, a.strategy, a.action, a.priority, a.due_date ? String(a.due_date).slice(0, 10) : '-', a.risk_level]),
      theme: 'grid',
      headStyles: { fillColor: [13, 31, 60], textColor: [249, 115, 22], fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: { 2: { cellWidth: 60 } },
      margin: { left: 14, right: 14 },
      didParseCell: (data) => {
        if (data.column.index === 5 && data.section === 'body') {
          const color = RISK_COLOR[data.cell.raw] || [100, 116, 139];
          data.cell.styles.textColor = color;
          data.cell.styles.fontStyle = 'bold';
        }
        if (data.column.index === 3 && data.section === 'body') {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = data.cell.raw === 'P0' ? [239, 68, 68] : [249, 115, 22];
        }
      },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  // ===== Detail Aset yang Memerlukan Tindakan =====
  if (y > 240) { doc.addPage(); addHeader(doc, 'LAPORAN TINDAKAN & STRATEGI RISIKO'); y = 34; }
  y = sectionTitle(doc, 'Detail Aset yang Memerlukan Tindakan', y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...GREY);
  doc.text('Aset dengan prioritas P0-P2 (di luar Monitoring Rutin P3) — diurutkan dari prioritas & risiko tertinggi.', 14, y);
  y += 5;

  // Hanya aset yang benar-benar memerlukan tindakan (bukan Monitoring Rutin P3)
  const actionableAssets = urgentActions.filter(a => a.priority !== 'P3').slice(0, 40);

  const detailRows = actionableAssets.map(a => [
    a.id, a.location || '-', a.ahi ?? '-', a.condition || '-',
    a.risk_score ?? '-', a.risk_level || '-', a.remaining_life != null ? Number(a.remaining_life).toFixed(1) : '-',
    a.action,
  ]);

  if (detailRows.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(...GREY);
    doc.text('Tidak ada aset dengan prioritas P0-P2 saat ini.', 14, y);
  } else {
    autoTable(doc, {
      startY: y,
      head: [['Asset ID', 'Lokasi', 'AHI', 'Kondisi', 'Risk Score', 'Risk Level', 'Remaining Life (y)', 'Tindakan']],
      body: detailRows,
      theme: 'grid',
      headStyles: { fillColor: [13, 31, 60], textColor: [249, 115, 22], fontSize: 7.5, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: { 7: { cellWidth: 48 } },
      margin: { left: 14, right: 14 },
      didParseCell: (data) => {
        if (data.column.index === 5 && data.section === 'body') {
          data.cell.styles.textColor = RISK_COLOR[data.cell.raw] || [100, 116, 139];
          data.cell.styles.fontStyle = 'bold';
        }
      },
    });
  }

  addFooter(doc);

  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`AIRDE_Laporan_Tindakan_${dateStr}.pdf`);
}
