import { useState, useEffect } from 'react';
import SectionHeader from '../components/ui/SectionHeader';
import AssetLink from '../components/ui/AssetLink';
import Modal from '../components/ui/Modal';
import { hierarchyApi } from '../services/api';
import { useFilters } from '../context/FilterContext';
import { useAuth } from '../context/AuthContext';

export default function Hierarchy() {
  const { isAssetVisible } = useFilters();
  const { isAdmin, isOperator } = useAuth();
  const canWrite = isAdmin || isOperator;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [segmentValue, setSegmentValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let cancelled = false;
    hierarchyApi.list()
      .then(data => { if (!cancelled) setRows(data); })
      .catch(err => { if (!cancelled) setApiError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [refreshKey]);

  const filtered = rows.filter(r =>
    (!search ||
      r.asset_id.toLowerCase().includes(search.toLowerCase()) ||
      (r.system || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.sub_system || '').toLowerCase().includes(search.toLowerCase())
    ) && isAssetVisible(r.asset_id)
  );

  const openEdit = (row) => {
    setEditingRow(row);
    setSegmentValue(row.segment || '');
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await hierarchyApi.updateSegment(editingRow.asset_id, segmentValue);
      setModalOpen(false);
      setRefreshKey(k => k + 1);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-[#1e2d4f] flex-shrink-0">
        <div className="text-orange-500 font-bold text-sm">HIERARCHY</div>
        <div className="text-[11px] text-slate-400">System / Sub-System / Line / Segment / Asset structure (04_Hierarchy)</div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-3 md:p-4 space-y-4">
        <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg overflow-hidden">
          <div className="px-3 pt-3 flex items-center justify-between flex-wrap gap-2">
            <SectionHeader
              title="Asset Hierarchy"
              subtitle="System / Sub-System / Line / Status diturunkan dari Asset Register (edit di sana). Segment adalah satu-satunya kolom asli sheet ini dan bisa diedit di sini."
            />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari..."
              className="bg-[#111d35] border border-[#1e2d4f] rounded px-2 py-1 mb-2 text-[11px] text-slate-300 placeholder-slate-600 outline-none focus:border-orange-500/50 w-40"
            />
          </div>

          {apiError && (
            <div className="mx-3 mb-2 bg-yellow-500/10 border border-yellow-500/30 rounded px-3 py-1.5 text-[11px] text-yellow-400">{apiError}</div>
          )}

          {loading ? (
            <div className="text-center text-slate-500 text-sm py-8">Memuat data...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] min-w-[700px]">
                <thead className="bg-[#111d35]">
                  <tr>
                    {['System (Location)', 'Sub-System (Service)', 'Line', 'Segment', 'Asset ID', 'Status', ...(canWrite ? ['Actions'] : [])].map(h => (
                      <th key={h} className="text-left py-2.5 px-3 text-slate-500 font-medium text-[10px] uppercase tracking-wider border-b border-[#1e2d4f]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r.asset_id} className={`border-b border-[#1e2d4f]/50 hover:bg-[#162040] transition-colors ${i % 2 !== 0 ? 'bg-[#0a1628]/30' : ''}`}>
                      <td className="py-2 px-3 text-slate-300">{r.system}</td>
                      <td className="py-2 px-3 text-slate-400">{r.sub_system}</td>
                      <td className="py-2 px-3 text-slate-400">{r.line}</td>
                      <td className="py-2 px-3 text-slate-400">{r.segment}</td>
                      <td className="py-2 px-3"><AssetLink id={r.asset_id} /></td>
                      <td className="py-2 px-3 text-slate-400">{r.status}</td>
                      {canWrite && (
                        <td className="py-2 px-3">
                          <button
                            onClick={() => openEdit(r)}
                            className="px-2 py-1 text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded text-[10px] transition-colors"
                          >
                            Edit Segment
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={canWrite ? 7 : 6} className="text-center text-slate-600 py-6">Tidak ada data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRow ? `Edit Segment — ${editingRow.asset_id}` : 'Edit Segment'}
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleSave}>
          <label className="block text-[11px] text-slate-400 mb-1">Segment</label>
          <input
            value={segmentValue}
            onChange={e => setSegmentValue(e.target.value)}
            placeholder="contoh: Segment 1"
            className="w-full bg-[#070e1a] border border-[#1e2d4f] rounded px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-orange-500/60"
          />

          {formError && (
            <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded px-3 py-2 text-xs text-red-400">
              {formError}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-medium py-2 rounded transition-colors"
            >
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 bg-[#0d1f3c] border border-[#1e2d4f] hover:border-slate-500 text-slate-400 text-xs rounded transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
