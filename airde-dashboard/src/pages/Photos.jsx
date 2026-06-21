import { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import Modal from '../components/ui/Modal';
import SectionHeader from '../components/ui/SectionHeader';
import { photosApi, API_ORIGIN } from '../services/api';
import { useAuth } from '../context/AuthContext';

const UPLOAD_BASE = `${API_ORIGIN}/uploads`;
const PHOTO_TYPES = ['Close Up', 'Overview', 'Defect', 'Coating', 'Other'];

const EMPTY_FORM = { asset_id: '', kp_location: '', photo_type: 'Close Up', geo_tagged: false, finding: '' };

export default function Photos() {
  const { isAdmin, isOperator } = useAuth();
  const canWrite = isAdmin || isOperator;

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setApiError('');
      try {
        const data = await photosApi.list();
        if (!cancelled) setPhotos(data);
      } catch (err) {
        if (!cancelled) { setApiError(err.message); setPhotos([]); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const filtered = photos.filter(p => !search || p.asset_id.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => {
    setEditingPhoto(null);
    setForm(EMPTY_FORM);
    setFile(null);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingPhoto(p);
    setForm({ asset_id: p.asset_id, kp_location: p.kp_location || '', photo_type: p.photo_type || 'Close Up', geo_tagged: !!p.geo_tagged, finding: p.finding || '' });
    setFile(null);
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('asset_id', form.asset_id);
      fd.append('kp_location', form.kp_location);
      fd.append('photo_type', form.photo_type);
      fd.append('geo_tagged', form.geo_tagged);
      fd.append('finding', form.finding);
      if (file) fd.append('photo', file);

      if (editingPhoto) {
        await photosApi.update(editingPhoto.id, fd);
      } else {
        await photosApi.create(fd);
      }
      setModalOpen(false);
      setRefreshKey(k => k + 1);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Hapus foto untuk asset "${p.asset_id}"?`)) return;
    try {
      await photosApi.remove(p.id);
      setRefreshKey(k => k + 1);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-[#1e2d4f] flex-shrink-0 flex items-center justify-between">
        <div>
          <div className="text-orange-500 font-bold text-sm">PHOTO RECORDS</div>
          <div className="text-[11px] text-slate-400">Geo-tagged inspection photos (10_Photo)</div>
        </div>
        {canWrite && (
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors"
          >
            <span>+</span> Upload Foto
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-3 md:p-4 space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeader title="Photo Gallery" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari Asset ID..."
            className="bg-[#111d35] border border-[#1e2d4f] rounded px-2 py-1 text-[11px] text-slate-300 placeholder-slate-600 outline-none focus:border-orange-500/50 w-40"
          />
        </div>

        {apiError && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded px-3 py-2 text-xs text-yellow-400">{apiError}</div>
        )}

        {loading ? (
          <div className="text-center text-slate-500 text-sm py-8">Memuat foto...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered.map(p => (
              <div key={p.id} className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg overflow-hidden">
                <div className="w-full h-28 bg-[#070e1a] flex items-center justify-center overflow-hidden">
                  {p.photo_file ? (
                    <img
                      src={`${UPLOAD_BASE}/${p.photo_file}`}
                      alt={p.finding}
                      className="w-full h-full object-cover"
                      onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                    />
                  ) : null}
                  <Camera className="text-slate-600" size={26} style={{ display: p.photo_file ? 'none' : 'flex' }} strokeWidth={1.5} />
                </div>
                <div className="p-2">
                  <div className="text-orange-400 text-xs font-medium">{p.asset_id}</div>
                  <div className="text-[10px] text-slate-500">{p.kp_location}</div>
                  <div className="text-[10px] text-slate-400 truncate">{p.finding}</div>
                  {canWrite && (
                    <div className="flex gap-1 mt-2">
                      <button onClick={() => openEdit(p)} className="px-2 py-0.5 text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded text-[10px]">Edit</button>
                      {isAdmin && (
                        <button onClick={() => handleDelete(p)} className="px-2 py-0.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded text-[10px]">Delete</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center text-slate-600 py-8">Tidak ada foto</div>
            )}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingPhoto ? `Edit Foto: ${editingPhoto.asset_id}` : 'Upload Foto'} maxWidth="max-w-lg">
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Asset ID *</label>
            <input value={form.asset_id} onChange={e => setForm(f => ({ ...f, asset_id: e.target.value }))} required
              className="w-full bg-[#070e1a] border border-[#1e2d4f] rounded px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-orange-500/60" />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">KP / Location</label>
            <input value={form.kp_location} onChange={e => setForm(f => ({ ...f, kp_location: e.target.value }))}
              className="w-full bg-[#070e1a] border border-[#1e2d4f] rounded px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-orange-500/60" />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Photo Type</label>
            <select value={form.photo_type} onChange={e => setForm(f => ({ ...f, photo_type: e.target.value }))}
              className="w-full bg-[#070e1a] border border-[#1e2d4f] rounded px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-orange-500/60">
              {PHOTO_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Finding</label>
            <input value={form.finding} onChange={e => setForm(f => ({ ...f, finding: e.target.value }))}
              className="w-full bg-[#070e1a] border border-[#1e2d4f] rounded px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-orange-500/60" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.geo_tagged} onChange={e => setForm(f => ({ ...f, geo_tagged: e.target.checked }))} id="geo_tagged" />
            <label htmlFor="geo_tagged" className="text-[11px] text-slate-400">Geo-tagged</label>
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">File Foto {editingPhoto ? '(kosongkan jika tidak diganti)' : '*'}</label>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} required={!editingPhoto}
              className="w-full text-xs text-slate-300" />
          </div>

          {formError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded px-3 py-2 text-xs text-red-400">{formError}</div>
          )}

          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={saving} className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-medium py-2 rounded transition-colors">
              {saving ? 'Mengunggah...' : (editingPhoto ? 'Update Foto' : 'Upload Foto')}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 bg-[#0d1f3c] border border-[#1e2d4f] hover:border-slate-500 text-slate-400 text-xs rounded transition-colors">
              Batal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
