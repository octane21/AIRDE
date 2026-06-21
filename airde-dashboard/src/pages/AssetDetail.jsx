import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZoomIn } from 'lucide-react';
import Badge from '../components/ui/Badge';
import SectionHeader from '../components/ui/SectionHeader';
import PhotoLightbox from '../components/ui/PhotoLightbox';
import { assetsApi, API_ORIGIN } from '../services/api';

const UPLOAD_BASE = `${API_ORIGIN}/uploads`;

function ahiColor(v) {
  if (v >= 90) return '#22c55e';
  if (v >= 70) return '#84cc16';
  if (v >= 50) return '#eab308';
  return '#ef4444';
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="text-xs text-slate-200 font-medium mt-0.5">{value ?? '-'}</div>
    </div>
  );
}

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    assetsApi.getFull(id)
      .then(d => { if (!cancelled) setData(d); })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">Memuat data aset...</div>;
  }
  if (error || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500 text-sm">
        <div>{error || 'Asset tidak ditemukan'}</div>
        <button onClick={() => navigate('/asset')} className="text-orange-400 hover:text-orange-300 text-xs">← Kembali ke Asset Register</button>
      </div>
    );
  }

  const { asset, criticality, risk, action, plans, workOrders, photos, inspections, dftHistory, utHistory, visualHistory, findings } = data;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-[#1e2d4f] flex-shrink-0 flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="text-orange-500 font-bold text-sm">{asset.id} — ASSET 360°</div>
          <div className="text-[11px] text-slate-400">{asset.line} · {asset.location} · {asset.service}</div>
        </div>
        <div className="flex gap-2">
          {criticality?.criticality && <Badge value={criticality.criticality} />}
          <Badge value={asset.status} />
        </div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-3 md:p-4 space-y-4">
        {/* Specs */}
        <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-4">
          <SectionHeader title="Asset Specification" subtitle="03_Asset_Register" />
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <Field label="NPS (inch)" value={asset.nps} />
            <Field label="OD (mm)" value={asset.od} />
            <Field label="Material" value={asset.material} />
            <Field label="Install Year" value={asset.install_year} />
            <Field label="Op. Pressure (bar)" value={asset.op_pressure} />
            <Field label="Des. Pressure (bar)" value={asset.des_pressure} />
            <Field label="CA (mm)" value={asset.ca} />
            <Field label="Segment" value={asset.segment} />
          </div>
          {criticality && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-[#1e2d4f]">
              <Field label="Safety" value={criticality.safety} />
              <Field label="Environment" value={criticality.environment} />
              <Field label="Operation" value={criticality.operation} />
              <Field label="Financial" value={criticality.financial} />
              <Field label="Criticality Score" value={criticality.criticality_score} />
            </div>
          )}
        </div>

        {/* Health & Risk */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-4">
            <SectionHeader title="Asset Health Index" subtitle="11_Asset_Intelligence" />
            {risk ? (
              <>
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-4xl font-bold" style={{ color: ahiColor(risk.ahi) }}>{risk.ahi}</div>
                  <Badge value={risk.condition} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Coating Health" value={`${Number(risk.coating_health).toFixed(1)}%`} />
                  <Field label="Thickness Health" value={`${Number(risk.thickness_health).toFixed(1)}%`} />
                  <Field label="Corrosion Rate" value={`${Number(risk.corrosion_rate).toFixed(3)} mm/y`} />
                  <Field label="Remaining Life" value={`${Number(risk.remaining_life).toFixed(1)} y`} />
                  <Field label="Visual Score" value={risk.visual_score} />
                  <Field label="Tmin" value={`${Number(risk.tmin).toFixed(2)} mm`} />
                </div>
              </>
            ) : <div className="text-xs text-slate-500">Belum ada data engine untuk asset ini.</div>}
          </div>

          <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-4">
            <SectionHeader title="Risk Intelligence" subtitle="13_Risk_Intelligence" />
            {risk ? (
              <>
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-4xl font-bold" style={{ color: risk.risk_score >= 2 ? '#ef4444' : risk.risk_score >= 0.7 ? '#eab308' : '#22c55e' }}>
                    {Number(risk.risk_score).toFixed(2)}
                  </div>
                  <Badge value={risk.risk_level} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="PoF" value={Number(risk.pof).toFixed(2)} />
                  <Field label="CoF" value={Number(risk.cof).toFixed(0)} />
                  <Field label="Location" value={risk.location} />
                </div>
              </>
            ) : <div className="text-xs text-slate-500">Belum ada data risk untuk asset ini.</div>}
          </div>
        </div>

        {/* Action / Plan / Work Order */}
        <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-4">
          <SectionHeader title="Action Register, Maintenance Plan & Work Order" subtitle="14 / 19 / 20" />
          {action ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              <Field label="Strategy" value={action.strategy} />
              <Field label="Recommended Action" value={action.action} />
              <Field label="Priority" value={action.priority} />
              <Field label="Due Date" value={action.due_date ? String(action.due_date).slice(0, 10) : '-'} />
            </div>
          ) : <div className="text-xs text-slate-500 mb-3">Belum ada action register.</div>}
          {plans.length > 0 && (
            <div className="text-[11px] text-slate-400 mb-1">Maintenance Plan: {plans[0].status} — Owner: {plans[0].owner}</div>
          )}
          {workOrders.length > 0 && (
            <div className="text-[11px] text-slate-400">Work Order {workOrders[0].wo_no}: {workOrders[0].status}</div>
          )}
        </div>

        {/* Findings */}
        {findings.length > 0 && (
          <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg overflow-hidden">
            <div className="px-4 pt-4"><SectionHeader title="Open Findings" subtitle="12_Findings" /></div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] min-w-[600px]">
                <thead className="bg-[#111d35]">
                  <tr>
                    {['Finding ID', 'Date', 'Finding', 'Severity', 'Status'].map(h => (
                      <th key={h} className="text-left py-2 px-3 text-slate-500 font-medium text-[10px] uppercase border-b border-[#1e2d4f]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {findings.map(f => (
                    <tr key={f.finding_code} className="border-b border-[#1e2d4f]/50">
                      <td className="py-2 px-3 text-orange-400">{f.finding_code}</td>
                      <td className="py-2 px-3 text-slate-400">{f.finding_date ? String(f.finding_date).slice(0, 10) : '-'}</td>
                      <td className="py-2 px-3 text-slate-300">{f.finding}</td>
                      <td className="py-2 px-3 text-slate-400">{f.severity}</td>
                      <td className="py-2 px-3"><Badge value={f.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* History tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <HistoryTable title="Inspection History" subtitle="06_Inspection" rows={inspections} columns={[
            { key: 'inspection_date', label: 'Date', render: r => r.inspection_date ? String(r.inspection_date).slice(0, 10) : '-' },
            { key: 'inspector', label: 'Inspector' },
            { key: 'method', label: 'Method' },
            { key: 'status', label: 'Status' },
          ]} />
          <HistoryTable title="DFT History" subtitle="07_DFT" rows={dftHistory} columns={[
            { key: 'reading_date', label: 'Date', render: r => r.reading_date ? String(r.reading_date).slice(0, 10) : '-' },
            { key: 'dft_actual', label: 'DFT Actual' },
            { key: 'coating_health', label: 'Health %', render: r => Number(r.coating_health).toFixed(1) + '%' },
            { key: 'coating_status', label: 'Status' },
          ]} />
          <HistoryTable title="UT History" subtitle="08_UT" rows={utHistory} columns={[
            { key: 'reading_date', label: 'Date', render: r => r.reading_date ? String(r.reading_date).slice(0, 10) : '-' },
            { key: 'thickness_health', label: 'Health %', render: r => Number(r.thickness_health).toFixed(1) + '%' },
            { key: 'corrosion_rate', label: 'CR (mm/y)', render: r => Number(r.corrosion_rate).toFixed(3) },
            { key: 'ut_status', label: 'Status' },
          ]} />
          <HistoryTable title="Visual Inspection History" subtitle="09_Visual" rows={visualHistory} columns={[
            { key: 'inspection_date', label: 'Date', render: r => r.inspection_date ? String(r.inspection_date).slice(0, 10) : '-' },
            { key: 'finding', label: 'Finding' },
            { key: 'severity', label: 'Severity' },
            { key: 'visual_score', label: 'Score' },
          ]} />
        </div>

        {/* Photos */}
        {photos.length > 0 && (
          <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-4">
            <SectionHeader title="Photos" subtitle="10_Photo" />
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {photos.map(p => (
                <div
                  key={p.id}
                  className={`group relative bg-[#070e1a] rounded overflow-hidden h-20 ${p.photo_file ? 'cursor-pointer' : ''}`}
                  onClick={() => p.photo_file && setLightboxPhoto(p)}
                >
                  {p.photo_file && (
                    <>
                      <img src={`${UPLOAD_BASE}/${p.photo_file}`} alt={p.finding} className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none'; }} />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                        <ZoomIn size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {lightboxPhoto && (
        <PhotoLightbox
          src={`${UPLOAD_BASE}/${lightboxPhoto.photo_file}`}
          alt={lightboxPhoto.finding}
          caption={lightboxPhoto.finding}
          onClose={() => setLightboxPhoto(null)}
        />
      )}
    </div>
  );
}

function HistoryTable({ title, subtitle, rows, columns }) {
  return (
    <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg overflow-hidden">
      <div className="px-4 pt-4"><SectionHeader title={title} subtitle={subtitle} /></div>
      {rows.length === 0 ? (
        <div className="text-center text-slate-600 text-xs py-6">Tidak ada data</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] min-w-[400px]">
            <thead className="bg-[#111d35]">
              <tr>
                {columns.map(c => (
                  <th key={c.key} className="text-left py-2 px-3 text-slate-500 font-medium text-[10px] uppercase border-b border-[#1e2d4f]">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-[#1e2d4f]/50">
                  {columns.map(c => (
                    <td key={c.key} className="py-2 px-3 text-slate-300">{c.render ? c.render(r) : String(r[c.key] ?? '-')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
