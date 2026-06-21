export const kpiData = {
  ahi: { value: 86, label: 'GOOD', change: '+3', trend: 'up' },
  riskScore: { value: '0.36', label: 'LOW', change: '+0.35', trend: 'up' },
  remainingLife: { value: '305.2', label: 'YEARS', change: '+1.8', trend: 'up' },
  inspectionCoverage: { value: '62%', label: '', change: '+5%', trend: 'up' },
  totalAssets: { value: 125, label: 'ASSETS', sub: 'Active Assets' },
};

export const healthDistribution = [
  { label: 'Excellent', range: '≥90', count: 55, color: '#22c55e', pct: 44 },
  { label: 'Good', range: '75-89', count: 56, color: '#84cc16', pct: 45 },
  { label: 'Fair', range: '60-74', count: 12, color: '#eab308', pct: 10 },
  { label: 'Poor', range: '<60', count: 2, color: '#ef4444', pct: 1 },
];

export const riskMatrixData = [
  { pof: 1, cof: 1, count: 1 }, { pof: 1, cof: 2, count: 2 }, { pof: 1, cof: 3, count: 3 }, { pof: 1, cof: 4, count: 2 }, { pof: 1, cof: 5, count: 0 },
  { pof: 2, cof: 1, count: 2 }, { pof: 2, cof: 2, count: 4 }, { pof: 2, cof: 3, count: 6 }, { pof: 2, cof: 4, count: 4 }, { pof: 2, cof: 5, count: 0 },
  { pof: 3, cof: 1, count: 1 }, { pof: 3, cof: 2, count: 6 }, { pof: 3, cof: 3, count: 9 }, { pof: 3, cof: 4, count: 12 }, { pof: 3, cof: 5, count: 0 },
  { pof: 4, cof: 1, count: 4 }, { pof: 4, cof: 2, count: 8 }, { pof: 4, cof: 3, count: 12 }, { pof: 4, cof: 4, count: 16 }, { pof: 4, cof: 5, count: 0 },
  { pof: 5, cof: 1, count: 5 }, { pof: 5, cof: 2, count: 10 }, { pof: 5, cof: 3, count: 15 }, { pof: 5, cof: 4, count: 20 }, { pof: 5, cof: 5, count: 25 },
];

export const top5Critical = [
  { rank: 1, id: 'PL-045', location: 'Jetty 2', riskScore: 2.33, riskLevel: 'HIGH', ahi: 38 },
  { rank: 2, id: 'PL-078', location: 'Jetty 1', riskScore: 1.30, riskLevel: 'MEDIUM', ahi: 54 },
  { rank: 3, id: 'PL-001', location: 'Jetty 2', riskScore: 0.78, riskLevel: 'MEDIUM', ahi: 76 },
  { rank: 4, id: 'PL-085', location: 'Jetty 2', riskScore: 0.74, riskLevel: 'MEDIUM', ahi: 74 },
  { rank: 5, id: 'PL-037', location: 'Jetty 2', riskScore: 0.73, riskLevel: 'MEDIUM', ahi: 75 },
];

export const maintenanceStrategy = [
  { label: 'Preventive', icon: 'shield', count: 28, pct: 51, color: '#3b82f6' },
  { label: 'Predictive', icon: 'search', count: 15, pct: 27, color: '#8b5cf6' },
  { label: 'Corrective', icon: 'wrench', count: 8, pct: 15, color: '#f59e0b' },
  { label: 'Replacement', icon: 'package', count: 2, pct: 4, color: '#ef4444' },
];

export const inspectionStatus = {
  inspected: { count: 78, pct: 62 },
  pending: { count: 47, pct: 38 },
};

export const trendData = [
  { month: 'Jan 2026', corrosionRate: 0.18, ahi: 72, highExtremeCount: 2 },
  { month: 'Feb 2026', corrosionRate: 0.165, ahi: 73.2, highExtremeCount: 3 },
  { month: 'Mar 2026', corrosionRate: 0.15, ahi: 74.4, highExtremeCount: 4 },
  { month: 'Apr 2026', corrosionRate: 0.135, ahi: 75.6, highExtremeCount: 2 },
  { month: 'May 2026', corrosionRate: 0.12, ahi: 76.8, highExtremeCount: 3 },
  { month: 'Jun 2026', corrosionRate: 0.125, ahi: 78, highExtremeCount: 4 },
];

export const alerts = [
  { level: 'red', date: '15-Jun-2026', asset: 'PL-045', message: 'Risk Level EXTREME (3.24)\nImmediate Action Required' },
  { level: 'orange', date: '15-Jun-2026', asset: 'PL-001', message: 'Coating Health 68% (FAIR)\nRecoating recommended' },
  { level: 'blue', date: '14-Jun-2026', asset: 'PL-078', message: 'Remaining Life 4.8 Years\nMonitor closely' },
];

export const keyTakeaways = [
  'Asset Health Index rata-rata 78 (GOOD) menunjukkan kondisi aset secara umum baik.',
  'Terdapat 2 aset dengan Risk Level EXTREME yang membutuhkan perhatian segera.',
  'Corrosion rate menurun dan stabil di 0.12 mm/year.',
  '62% aset telah diinspeksi, masih ada 47 aset yang pending.',
  'Rekomendasi Preventive mendominasi dengan 51% dari total strategi.',
];

export const nextActions = [
  { icon: 'target', text: 'Focus on 2 Extreme Risk Assets (PL-045, PL-001)' },
  { icon: 'search', text: 'Lanjutkan program inspeksi untuk 47 aset pending' },
  { icon: 'wrench', text: 'Implementasi strategi Preventive & Predictive' },
  { icon: 'barChart', text: 'Review budget & resource untuk Q3 2026' },
];

export const kpiTable = [
  { kpi: 'Average AHI', actual: '86', target: '≥75', status: 'On Track' },
  { kpi: 'High/Extreme Risk Assets', actual: '1', target: '≤3', status: 'On Track' },
  { kpi: 'Inspection Coverage', actual: '62%', target: '≥80%', status: 'Need Action' },
  { kpi: 'Open P1/P0 Actions', actual: '0', target: '≤5', status: 'On Track' },
];

export const aiSuggestions = [
  'Apa aset paling kritis saat ini?',
  'Aset mana yang perlu recoating?',
  'Berapa remaining life asset PL-001?',
  'Apa prioritas maintenance tahun ini?',
  'Tampilkan tren corrosion rate.',
];

export const aiResponses = {
  'Apa aset paling kritis saat ini?': 'Berdasarkan data terkini, aset paling kritis adalah **PL-045** (Jetty 2) dengan Risk Score 2.33 (HIGH) dan AHI hanya 38 (POOR). Disusul **PL-078** (Jetty 1) dengan Risk Score 1.30 (MEDIUM) dan AHI 54. Kedua aset ini memerlukan perhatian segera.',
  'Aset mana yang perlu recoating?': 'Aset yang memerlukan recoating segera berdasarkan Coating Health <60%:\n• **PL-045** – Coating Health 58.67% (Kritis)\n• **PL-037** – Coating Health 42%\n• **PL-041** – Coating Health 36.67%\n• **PL-042** – Coating Health 36%\nRekomendasi: Jadwalkan recoating untuk PL-041 dan PL-042 dalam waktu dekat.',
  'Berapa remaining life asset PL-001?': '**PL-001** (Jetty 2, Pipeline Block A) memiliki Remaining Life **78.2 tahun** berdasarkan perhitungan corrosion rate saat ini (0.05 mm/year). AHI = 76 (GOOD), Risk Score = 0.78 (MEDIUM). Rekomendasi: UT Monitoring + Visual Inspection dengan prioritas P2.',
  'Apa prioritas maintenance tahun ini?': 'Prioritas maintenance 2026:\n1. Immediate – PL-045 (Risk EXTREME, AHI 38)\n2. High – UT Monitoring 18 aset MEDIUM risk\n3. Medium – Recoating 8 aset dengan Coating Health <60%\n4. Routine – Monitoring 47 aset pending inspeksi\nTotal budget rekomendasi: Review Q3 2026.',
  'Tampilkan tren corrosion rate.': 'Tren Corrosion Rate (Jan–Jun 2026):\n• Jan: 0.180 mm/yr\n• Feb: 0.165 mm/yr ↓\n• Mar: 0.150 mm/yr ↓\n• Apr: 0.135 mm/yr ↓\n• May: 0.120 mm/yr ↓ (terendah)\n• Jun: 0.125 mm/yr ↑ (slight increase)\nOverall trend: Menurun positif. Namun peningkatan kecil di Jun 2026 perlu dipantau.',
};
