import { useState, useEffect, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import SectionHeader from '../ui/SectionHeader';
import AssetLink from '../ui/AssetLink';
import { useAuth } from '../../context/AuthContext';
import { useFilters } from '../../context/FilterContext';

function buildEmptyForm(fields) {
  const form = {};
  for (const f of fields) form[f.key] = f.default ?? '';
  return form;
}

function toPayload(form, fields) {
  const payload = {};
  for (const f of fields) {
    const v = form[f.key];
    if (f.type === 'number') {
      payload[f.key] = v === '' ? null : Number(v);
    } else {
      payload[f.key] = v === '' ? null : v;
    }
  }
  return payload;
}

/**
 * Generic table + modal-form CRUD page driven by a column/field config,
 * matching the look & role-gating already established by AssetManagement/RiskManagement/Maintenance.
 */
export default function CrudPage({
  title,
  subtitle,
  api,
  idField,
  columns,
  fields,
  searchKeys = [],
  filters = [],
  summary,
  defaultSort,
  badgeKeys = [],
  adminOnlyDelete = true,
  adminOnlyWrite = false,
  beforeTable,
  initialFilterValues,
  respectGlobalFilter = true,
  linkKeys = [],
  readOnly = false,
}) {
  const { isAdmin, isOperator } = useAuth();
  const { isAssetVisible } = useFilters();
  const canWrite = readOnly ? false : (adminOnlyWrite ? isAdmin : (isAdmin || isOperator));

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState(initialFilterValues || {});

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [form, setForm] = useState(buildEmptyForm(fields));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setApiError('');
      try {
        const data = await api.list();
        if (!cancelled) setRows(data);
      } catch (err) {
        if (!cancelled) {
          setApiError(err.message);
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const sorted = useMemo(() => {
    const arr = [...rows];
    if (defaultSort) arr.sort(defaultSort);
    return arr;
  }, [rows]);

  const filtered = sorted.filter(r => {
    const matchSearch = !search || searchKeys.some(k =>
      String(r[k] ?? '').toLowerCase().includes(search.toLowerCase())
    );
    const matchFilters = filters.every(f => {
      const fv = filterValues[f.key];
      return !fv || fv === 'All' || String(r[f.key]) === fv;
    });
    const matchGlobal = !respectGlobalFilter || isAssetVisible(r.asset_id ?? r[idField]);
    return matchSearch && matchFilters && matchGlobal;
  });

  const openEdit = (row) => {
    setEditingRow(row);
    const f = {};
    for (const field of fields) f[field.key] = row[field.key] ?? field.default ?? '';
    setForm(f);
    setFormError('');
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditingRow(null);
    setForm(buildEmptyForm(fields));
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const payload = toPayload(form, fields);
      if (editingRow) {
        await api.update(editingRow[idField], payload);
      } else {
        await api.create(payload);
      }
      setModalOpen(false);
      setRefreshKey(k => k + 1);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Hapus data "${row[idField]}"?`)) return;
    try {
      await api.remove(row[idField]);
      setRefreshKey(k => k + 1);
    } catch (err) {
      alert(err.message);
    }
  };

  const renderField = (f) => {
    const value = form[f.key];
    const onChange = (v) => setForm(prev => ({ ...prev, [f.key]: v }));
    const baseCls = 'w-full bg-[#070e1a] border border-[#1e2d4f] rounded px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-orange-500/60 disabled:opacity-50';

    if (f.type === 'select') {
      return (
        <select value={value} onChange={e => onChange(e.target.value)} className={baseCls} disabled={f.disabledOnEdit && !!editingRow}>
          {f.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    }
    if (f.type === 'textarea') {
      return (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={2} className={baseCls} />
      );
    }
    return (
      <input
        type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
        step={f.type === 'number' ? 'any' : undefined}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={f.required}
        disabled={f.disabledOnEdit && !!editingRow}
        className={baseCls}
      />
    );
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-[#1e2d4f] flex-shrink-0 flex items-center justify-between">
        <div>
          <div className="text-orange-500 font-bold text-sm">{title}</div>
          {subtitle && <div className="text-[11px] text-slate-400">{subtitle}</div>}
        </div>
        {canWrite && (
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors"
          >
            <span>+</span> Tambah
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-3 md:p-4 space-y-4">
        {beforeTable && (typeof beforeTable === 'function' ? beforeTable(rows) : beforeTable)}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {summary(rows).map(s => (
              <div key={s.label} className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3">
                <div className={`text-2xl font-bold ${s.color || 'text-slate-200'}`}>{s.value}</div>
                <div className="text-[10px] text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg overflow-hidden">
          <div className="px-3 pt-3 flex items-center justify-between flex-wrap gap-2">
            <SectionHeader title={title} subtitle={subtitle} />
            <div className="flex gap-2 pb-2">
              {searchKeys.length > 0 && (
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Cari..."
                  className="bg-[#111d35] border border-[#1e2d4f] rounded px-2 py-1 text-[11px] text-slate-300 placeholder-slate-600 outline-none focus:border-orange-500/50 w-32"
                />
              )}
              {filters.map(f => (
                <select
                  key={f.key}
                  value={filterValues[f.key] || 'All'}
                  onChange={e => setFilterValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="bg-[#111d35] border border-[#1e2d4f] rounded px-2 py-1 text-[11px] text-slate-300 outline-none focus:border-orange-500/50"
                >
                  {['All', ...f.options].map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ))}
              <button
                onClick={() => setRefreshKey(k => k + 1)}
                className="flex items-center px-2 py-1 text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded transition-colors"
              >
                <RefreshCw size={13} />
              </button>
            </div>
          </div>

          {apiError && (
            <div className="mx-3 mb-2 bg-yellow-500/10 border border-yellow-500/30 rounded px-3 py-1.5 text-[11px] text-yellow-400">
              {apiError}
            </div>
          )}

          {loading ? (
            <div className="text-center text-slate-500 text-sm py-8">Memuat data...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] min-w-[750px]">
                <thead className="bg-[#111d35]">
                  <tr>
                    {[...columns.map(c => c.label), ...(canWrite ? ['Actions'] : [])].map(h => (
                      <th key={h} className="text-left py-2.5 px-3 text-slate-500 font-medium text-[10px] uppercase tracking-wider border-b border-[#1e2d4f]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, i) => (
                    <tr key={row[idField]} className={`border-b border-[#1e2d4f]/50 hover:bg-[#162040] transition-colors ${i % 2 !== 0 ? 'bg-[#0a1628]/30' : ''}`}>
                      {columns.map(c => (
                        <td key={c.key} className="py-2 px-3 text-slate-300">
                          {linkKeys.includes(c.key)
                            ? <AssetLink id={row[c.key]} />
                            : badgeKeys.includes(c.key)
                            ? <Badge value={row[c.key]} />
                            : c.render ? c.render(row) : String(row[c.key] ?? '-')}
                        </td>
                      ))}
                      {canWrite && (
                        <td className="py-2 px-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => openEdit(row)}
                              className="px-2 py-1 text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded text-[10px] transition-colors"
                            >
                              Edit
                            </button>
                            {(!adminOnlyDelete || isAdmin) && (
                              <button
                                onClick={() => handleDelete(row)}
                                className="px-2 py-1 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded text-[10px] transition-colors"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={columns.length + (canWrite ? 1 : 0)} className="text-center text-slate-600 py-6">
                        Tidak ada data
                      </td>
                    </tr>
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
        title={editingRow ? `Edit: ${editingRow[idField]}` : `Tambah ${title}`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-2 gap-3">
            {fields.map(f => (
              <div key={f.key} className={f.fullWidth ? 'col-span-2' : ''}>
                <label className="block text-[11px] text-slate-400 mb-1">{f.label}{f.required ? ' *' : ''}</label>
                {renderField(f)}
              </div>
            ))}
          </div>

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
              {saving ? 'Menyimpan...' : (editingRow ? 'Update' : 'Tambah')}
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
