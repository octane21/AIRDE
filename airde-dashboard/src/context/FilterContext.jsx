import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { assetsApi } from '../services/api';

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
  const [assets, setAssets] = useState([]);
  const [system, setSystem] = useState('All');
  const [line, setLine] = useState('All');
  const [location, setLocation] = useState('All');

  useEffect(() => {
    assetsApi.list().then(setAssets).catch(() => {});
  }, []);

  const assetById = useMemo(() => Object.fromEntries(assets.map(a => [a.id, a])), [assets]);

  const options = useMemo(() => ({
    systems: [...new Set(assets.map(a => a.location).filter(Boolean))].sort(),
    lines: [...new Set(assets.map(a => a.line).filter(Boolean))].sort(),
    locations: [...new Set(assets.map(a => a.service).filter(Boolean))].sort(),
  }), [assets]);

  const isAssetVisible = useCallback((assetId) => {
    if (system === 'All' && line === 'All' && location === 'All') return true;
    const asset = assetById[assetId];
    if (!asset) return true;
    if (system !== 'All' && asset.location !== system) return false;
    if (line !== 'All' && asset.line !== line) return false;
    if (location !== 'All' && asset.service !== location) return false;
    return true;
  }, [assetById, system, line, location]);

  const resetFilters = useCallback(() => {
    setSystem('All'); setLine('All'); setLocation('All');
  }, []);

  const activeCount = [system, line, location].filter(v => v !== 'All').length;

  return (
    <FilterContext.Provider value={{
      company: 'AIRDE', system, line, location,
      setSystem, setLine, setLocation, resetFilters,
      isAssetVisible, options, activeCount,
    }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used inside FilterProvider');
  return ctx;
}
