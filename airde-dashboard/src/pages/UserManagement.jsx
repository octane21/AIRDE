import { useState, useEffect, useCallback } from 'react';
import { usersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/ui/Modal';

const EMPTY_FORM = { username: '', email: '', password: '', role: 'operator', is_active: true };

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await usersApi.list();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openCreate = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setForm({ username: u.username, email: u.email, password: '', role: u.role, is_active: u.is_active });
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (editingUser) {
        await usersApi.update(editingUser.id, payload);
      } else {
        await usersApi.create(payload);
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete user "${u.username}"? This cannot be undone.`)) return;
    try {
      await usersApi.remove(u.id);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const roleColor = { admin: 'text-orange-400 bg-orange-500/10 border-orange-500/30', operator: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-[#1e2d4f] flex-shrink-0 flex items-center justify-between">
        <div>
          <div className="text-orange-500 font-bold text-sm">USER MANAGEMENT</div>
          <div className="text-[11px] text-slate-400">Admin &amp; Operator Accounts</div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors"
        >
          <span>+</span> Add User
        </button>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-3 md:p-4">
        {loading ? (
          <div className="text-slate-500 text-sm text-center py-8">Loading users...</div>
        ) : error ? (
          <div className="text-red-400 text-sm text-center py-8">{error}</div>
        ) : (
          <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1e2d4f]">
                  {['ID','Username','Email','Role','Status','Created','Actions'].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-slate-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-[#1e2d4f]/50 hover:bg-[#162040] transition-colors">
                    <td className="px-3 py-2 text-slate-400">{u.id}</td>
                    <td className="px-3 py-2 text-slate-200 font-medium">
                      {u.username}
                      {u.id === currentUser?.id && (
                        <span className="ml-1 text-[10px] text-orange-400">(you)</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-400">{u.email}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block border rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${roleColor[u.role] || ''}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={u.is_active ? 'text-green-400' : 'text-red-400'}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(u)}
                          className="px-2 py-1 text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded text-[10px] transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={u.id === currentUser?.id}
                          className="px-2 py-1 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded text-[10px] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUser ? `Edit User: ${editingUser.username}` : 'Add New User'}
      >
        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Username *</label>
              <input
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="w-full bg-[#070e1a] border border-[#1e2d4f] rounded px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-orange-500/60"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-[#070e1a] border border-[#1e2d4f] rounded px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-orange-500/60"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Password {editingUser ? '(leave blank to keep)' : '*'}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full bg-[#070e1a] border border-[#1e2d4f] rounded px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-orange-500/60"
                required={!editingUser}
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Role *</label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full bg-[#070e1a] border border-[#1e2d4f] rounded px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-orange-500/60"
              >
                <option value="operator">Operator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {editingUser && (
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Status</label>
                <select
                  value={form.is_active ? 'true' : 'false'}
                  onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'true' }))}
                  className="w-full bg-[#070e1a] border border-[#1e2d4f] rounded px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-orange-500/60"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            )}
          </div>

          {formError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded px-3 py-2 text-xs text-red-400">
              {formError}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-medium py-2 rounded transition-colors"
            >
              {saving ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
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
