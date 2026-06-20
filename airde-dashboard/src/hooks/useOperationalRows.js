import { useState, useEffect, useMemo } from 'react';
import { risksApi, actionsApi, maintenancePlanApi } from '../services/api';
import { useFilters } from '../context/FilterContext';

// Combines Risk Intelligence + Action Register + Maintenance Plan (owner/notes) into the
// merged "Asset/Health/Risk/Remaining Life/Strategy/Action/.../Owner/Notes/AI Flag" rows
// shared by 01_Tactical_Dashboard and 02_Operational_Dashboard.
export function useOperationalRows() {
  const { isAssetVisible } = useFilters();
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [risks, actions, plans] = await Promise.all([
          risksApi.list(), actionsApi.list(), maintenancePlanApi.list(),
        ]);
        const actionById = Object.fromEntries(actions.map(a => [a.id, a]));
        const planByAsset = Object.fromEntries(plans.map(p => [p.asset_id, p]));

        const merged = risks.map(r => {
          const action = actionById[r.id] || {};
          const plan = planByAsset[r.id] || {};
          return {
            id: r.id,
            location: r.location,
            health: r.ahi,
            risk: r.risk_level,
            remainingLife: Number(r.remaining_life),
            strategy: action.strategy || '-',
            action: action.action || '-',
            priority: action.priority || '-',
            dueDate: action.due_date,
            status: plan.status || action.status || '-',
            owner: plan.owner || 'Integrity Team',
            notes: plan.notes || 'Generated from V20 engine',
            aiFlag: (r.risk_level === 'HIGH' || r.risk_level === 'EXTREME') ? 'Review' : 'OK',
          };
        });

        if (!cancelled) setAllRows(merged);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const rows = useMemo(() => allRows.filter(r => isAssetVisible(r.id)), [allRows, isAssetVisible]);

  return { rows, loading, error };
}
