import { useState, useEffect } from 'react';
import SectionHeader from '../components/ui/SectionHeader';
import { configApi, engineApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AHI_WEIGHT_PARAMS = ['Coating Weight', 'Thickness Weight', 'Remaining Life Weight', 'Visual Weight'];
const POF_PARAMS = ['PoF AHI Weight', 'PoF Corrosion Cap', 'PoF Life Penalty Under 5y', 'PoF Life Penalty Under 10y', 'PoF Coverage Weight'];
const COF_PARAMS = ['CoF High', 'CoF Medium', 'CoF Low'];

function groupRows(rows, paramList) {
  const byParam = Object.fromEntries(rows.map(r => [r.param, r]));
  return paramList.map(p => byParam[p]).filter(Boolean);
}

export default function WeightConfig() {
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [savingParam, setSavingParam] = useState('');
  const [recalculating, setRecalculating] = useState(false);
  const [message, setMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setApiError('');
      try {
        const data = await configApi.list();
        if (!cancelled) setRows(data);
      } catch (err) {
        if (!cancelled) setApiError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const ahiWeightRows = groupRows(rows, AHI_WEIGHT_PARAMS);
  const pofRows = groupRows(rows, POF_PARAMS);
  const cofRows = groupRows(rows, COF_PARAMS);
  const knownParams = new Set([...AHI_WEIGHT_PARAMS, ...POF_PARAMS, ...COF_PARAMS]);
  const otherRows = rows.filter(r => !knownParams.has(r.param));

  const ahiWeightTotal = ahiWeightRows.reduce((sum, r) => sum + Number(r.value || 0), 0);

  const handleChange = (param, value) => {
    setRows(prev => prev.map(r => r.param === param ? { ...r, value } : r));
  };

  const handleSave = async (param) => {
    const row = rows.find(r => r.param === param);
    setSavingParam(param);
    setMessage('');
    try {
      await configApi.update(param, { value: Number(row.value), notes: row.notes });
      setMessage(`"${param}" tersimpan.`);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSavingParam('');
    }
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    setMessage('');
    try {
      const result = await engineApi.recalculate();
      setMessage(`Recalculate selesai: ${result.assetsProcessed} asset, Avg AHI ${result.avg_ahi}, High/Extreme Risk ${result.high_extreme_count}.`);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setRecalculating(false);
    }
  };

  const renderParamRow = (r) => (
    <div key={r.param} className="flex items-center gap-3">
      <div className="w-52 text-xs text-slate-300">{r.param}</div>
      <input
        type="number"
        step="0.01"
        value={r.value}
        disabled={!isAdmin}
        onChange={e => handleChange(r.param, e.target.value)}
        className="w-24 bg-[#070e1a] border border-[#1e2d4f] rounded px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-orange-500/60 disabled:opacity-50"
      />
      <div className="text-[10px] text-slate-500 flex-1">{r.notes}</div>
      {isAdmin && (
        <button
          onClick={() => handleSave(r.param)}
          disabled={savingParam === r.param}
          className="px-3 py-1 text-[11px] text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded transition-colors disabled:opacity-50"
        >
          {savingParam === r.param ? 'Menyimpan...' : 'Simpan'}
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-[#1e2d4f] flex-shrink-0">
        <div className="text-orange-500 font-bold text-sm">ENGINE CONFIG</div>
        <div className="text-[11px] text-slate-400">Seluruh parameter numerik mesin kalkulasi (bobot AHI, formula PoF, CoF) & tombol recalculate (99_Config)</div>
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin p-3 md:p-4 space-y-4">
        {!isAdmin && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded px-3 py-2 text-xs text-yellow-400">
            Hanya admin yang dapat mengubah konfigurasi ini.
          </div>
        )}

        <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-4">
          <SectionHeader title="Recalculation Engine" subtitle="Hitung ulang AHI, PoF, CoF, Risk Score & Action Register untuk semua asset" />
          <button
            onClick={handleRecalculate}
            disabled={recalculating || !isAdmin}
            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded transition-colors"
          >
            {recalculating ? 'Menghitung ulang...' : 'Recalculate All'}
          </button>
        </div>

        {apiError && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded px-3 py-2 text-xs text-yellow-400">{apiError}</div>
        )}
        {message && (
          <div className="bg-green-500/10 border border-green-500/30 rounded px-3 py-2 text-xs text-green-400">{message}</div>
        )}

        {loading ? (
          <div className="text-center text-slate-500 text-sm py-6">Memuat...</div>
        ) : (
          <>
            <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-4">
              <SectionHeader title="AHI Weights" subtitle={`Total: ${ahiWeightTotal.toFixed(2)} (idealnya 1.00) — dipakai di rumus AHI`} />
              <div className="space-y-3">{ahiWeightRows.map(renderParamRow)}</div>
            </div>

            <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-4">
              <SectionHeader title="PoF Formula" subtitle="Konstanta rumus Probability of Failure" />
              <div className="space-y-3">{pofRows.map(renderParamRow)}</div>
            </div>

            <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-4">
              <SectionHeader title="CoF Mapping" subtitle="Consequence of Failure berdasarkan Criticality" />
              <div className="space-y-3">{cofRows.map(renderParamRow)}</div>
            </div>

            {otherRows.length > 0 && (
              <div className="bg-[#0d1f3c] border border-[#1e2d4f] rounded-lg p-4">
                <SectionHeader title="Lainnya" />
                <div className="space-y-3">{otherRows.map(renderParamRow)}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
