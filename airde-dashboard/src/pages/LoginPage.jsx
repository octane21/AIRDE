import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onClose }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#0a1628] border border-[#1e2d4f] rounded-xl p-8 w-full max-w-sm shadow-2xl">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <img src="/logo_airde.png" className="w-10 h-10" />
          <div>
            <div className="text-white font-bold text-lg leading-tight">AIRDE</div>
            <div className="text-[10px] text-slate-400">PIPELINE INTEGRITY MANAGEMENT</div>
          </div>
        </div>

        <h2 className="text-slate-200 font-semibold text-base mb-1">Login</h2>
        <p className="text-slate-500 text-xs mb-5">Access admin & operator features</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="w-full bg-[#0d1f3c] border border-[#1e2d4f] rounded px-3 py-2 text-sm text-slate-200 outline-none focus:border-orange-500/60 transition-colors"
              placeholder="Enter username"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full bg-[#0d1f3c] border border-[#1e2d4f] rounded px-3 py-2 text-sm text-slate-200 outline-none focus:border-orange-500/60 transition-colors"
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium py-2 rounded transition-colors"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 bg-[#0d1f3c] border border-[#1e2d4f] hover:border-slate-500 text-slate-400 hover:text-slate-200 text-sm rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="mt-5 pt-4 border-t border-[#1e2d4f] text-[10px] text-slate-600">
          Default: admin / admin123 &nbsp;|&nbsp; operator1 / admin123
        </div>
      </div>
    </div>
  );
}
