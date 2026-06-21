import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import Modal from '../components/ui/Modal';
import AssetLink from '../components/ui/AssetLink';
import { assetsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useFilters } from '../context/FilterContext';

const EMPTY_FORM = {
  id: '', line: '', location: 'Jetty 1', service: 'Crude Oil',
  nps: '', od: '', material: 'API 5L X52', install_year: '',
  op_pressure: '', des_pressure: '', ca: '',
  status: 'Active',
};

export default function AssetManagement() {
  const { isAdmin, isOperator } = useAuth();
  const { isAssetVisible } = useFilters();
  const canWrite = isAdmin || isOperator;
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [refreshKey, setRefreshKey] = useState(0);
  const fetchAssets = () => setRefreshKey(k => k + 1);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setApiError('');
      try {
        const data = await assetsApi.list();
        if (!cancelled) setAssets(data);
      } catch (err) {
        if (!cancelled) setApiError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const locations = ['All', ...new Set(assets.map(a => a.location))];

  const filtered = assets.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = a.id.toLowerCase().includes(q) ||
      (a.service || '').toLowerCase().includes(q) ||
      (a.line || '').toLowerCase().includes(q);
    const matchLoc = locationFilter === 'All' || a.location === locationFilter;
    return matchSearch && matchLoc && isAssetVisible(a.id);
  });

  const stats = {
    total: assets.length,
    active: assets.filter(a => a.status === 'Active').length,
  };

  const openCreate = () => {
    setEditingAsset(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (asset) => {
    setEditingAsset(asset);
    setForm({
      id: asset.id,
      line: asset.line || '',
      location: asset.location || '',
      service: asset.service || '',
      nps: asset.nps ?? '',
      od: asset.od ?? '',
      material: asset.material || '',
      install_year: asset.install_year ?? '',
      op_pressure: asset.op_pressure ?? '',
      des_pressure: asset.des_pressure ?? '',
      ca: asset.ca ?? '',
      status: asset.status || 'Active',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        nps: form.nps !== '' ? Number(form.nps) : null,
        od: form.od !== '' ? Number(form.od) : null,
        install_year: form.install_year !== '' ? Number(form.install_year) : null,
        op_pressure: form.op_pressure !== '' ? Number(form.op_pressure) : null,
        des_pressure: form.des_pressure !== '' ? Number(form.des_pressure) : null,
        ca: form.ca !== '' ? Number(form.ca) : null,
      };
      if (editingAsset) {
        await assetsApi.update(editingAsset.id, payload);
      } else {
        await assetsApi.create(payload);
      }
      setModalOpen(false);
      fetchAssets();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (asset) => {
    if (!window.confirm(`Delete asset "${asset.id} - ${asset.line}"? This will also delete associated risk and action data.`)) return;
    try {
      await assetsApi.remove(asset.id);
      fetchAssets();
    } catch (err) {
      alert(err.message);
    }
  };

  const field = (label, key, type = 'text', opts = {}) => (
    <div key={key}>
      <label className="block text-[11px] text-slate-400 mb-1">{label}</label>
      {opts.select ? (
        <select
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full bg-[#070e1a] border border-[#1e2d4f] rounded px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-orange-500/60"
          required={opts.required}
        >
          {opts.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full bg-[#070e1a] border border-[#1e2d4f] rounded px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-orange-500/60"
          required={opts.required}
          disabled={opts.disabled}
          step={type === 'number' ? 'any' : undefined}
        />
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-[#1e2d4f] flex-shrink-0 flex items-center justify-between">
        <div>
          <div className="text-orange-500 font-bold text-sm">ASSET MANAGEMENT</div>
          <div className="text-[11px] text-slate-400">Asset Register & Hierarchy</div>
        </div>
        {canWrite && (
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors"
          >
            <span>+</span> Add Asset
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-3 md:p-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-4">
          {[
            { label: 'Total Assets', value: stats.total, color: 'text-slate-200' },
            { label: 'Active', value: stats.active, color: 'text-green-400' },
          ].map(s => (
            <div key={s.label} className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-3">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-3 flex-wrap">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, service, line..."
            className="bg-[#0d1f3c] border border-[#1e2d4f] rounded px-3 py-1.5 text-[11px] text-slate-300 placeholder-slate-600 outline-none focus:border-orange-500/50 w-48"
          />
          <select
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value)}
            className="bg-[#0d1f3c] border border-[#1e2d4f] rounded px-3 py-1.5 text-[11px] text-slate-300 outline-none focus:border-orange-500/50"
          >
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <button
            onClick={fetchAssets}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded transition-colors"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {apiError && (
          <div className="mb-3 bg-red-500/10 border border-red-500/30 rounded px-3 py-2 text-xs text-red-400">
            Backend not connected: {apiError}
          </div>
        )}

        {loading ? (
          <div className="text-center text-slate-500 text-sm py-8">Loading assets...</div>
        ) : (
          <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[1300px]">
                <thead>
                  <tr className="border-b border-[#1e2d4f]">
                    {['ID','Line / Segment','Location','Service','NPS (inch)','OD (mm)','Material','Install Year',
                      'Op. Pressure (bar)','Des. Pressure (bar)','CA (mm)','Status',
                      ...(canWrite ? ['Actions'] : [])
                    ].map(h => (
                      <th key={h} className="text-left px-3 py-2 text-slate-500 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id} className="border-b border-[#1e2d4f]/50 hover:bg-[#162040] transition-colors">
                      <td className="px-3 py-2 font-mono"><AssetLink id={a.id} /></td>
                      <td className="px-3 py-2 text-slate-300 max-w-[160px] truncate">{a.line}</td>
                      <td className="px-3 py-2 text-slate-400">{a.location}</td>
                      <td className="px-3 py-2 text-slate-300">{a.service}</td>
                      <td className="px-3 py-2 text-slate-400">{a.nps}"</td>
                      <td className="px-3 py-2 text-slate-400">{a.od}</td>
                      <td className="px-3 py-2 text-slate-400">{a.material}</td>
                      <td className="px-3 py-2 text-slate-400">{a.install_year}</td>
                      <td className="px-3 py-2 text-slate-400">{a.op_pressure}</td>
                      <td className="px-3 py-2 text-slate-400">{a.des_pressure}</td>
                      <td className="px-3 py-2 text-slate-400">{a.ca}</td>
                      <td className="px-3 py-2">
                        <span className={a.status === 'Active' ? 'text-green-400' : 'text-slate-500'}>
                          {a.status}
                        </span>
                      </td>
                      {canWrite && (
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            <button
                              onClick={() => openEdit(a)}
                              className="px-2 py-1 text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded text-[10px] transition-colors"
                            >
                              Edit
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleDelete(a)}
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
                      <td colSpan={canWrite ? 13 : 12} className="text-center text-slate-600 py-6">
                        No assets found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAsset ? `Edit Asset: ${editingAsset.id}` : 'Add New Asset'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-2 gap-3">
            {field('Asset ID *', 'id', 'text', { required: true, disabled: !!editingAsset })}
            {field('Line Name *', 'line', 'text', { required: true })}
            {field('Location *', 'location', 'text', { required: true, select: true, options: ['Jetty 1','Jetty 2','Jetty 3'] })}
            {field('Service *', 'service', 'text', { required: true, select: true, options: ['Crude Oil','Product','LPG','Gas','Water'] })}
            {field('NPS (inch)', 'nps', 'number')}
            {field('OD (mm)', 'od', 'number')}
            {field('Material', 'material', 'text', { select: true, options: ['API 5L X52','API 5L X65','API 5L X60','API 5L GrB','Stainless Steel 316L'] })}
            {field('Install Year', 'install_year', 'number')}
            {field('Op. Pressure (bar)', 'op_pressure', 'number')}
            {field('Des. Pressure (bar)', 'des_pressure', 'number')}
            {field('CA (mm)', 'ca', 'number')}
            {field('Status', 'status', 'text', { select: true, options: ['Active','Inactive','Decommissioned'] })}
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
              {saving ? 'Saving...' : (editingAsset ? 'Update Asset' : 'Create Asset')}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 bg-[#0d1f3c] border border-[#1e2d4f] hover:border-slate-500 text-slate-400 text-xs rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
