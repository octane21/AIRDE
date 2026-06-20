const getRiskColor = (pof, cof) => {
  const score = pof * cof;
  if (score >= 15) return '#7f1d1d';
  if (score >= 9) return '#991b1b';
  if (score >= 5) return '#b45309';
  if (score >= 3) return '#ca8a04';
  return '#166534';
};

const getRiskLabel = (pof, cof) => {
  const score = pof * cof;
  if (score >= 15) return 'EXTREME';
  if (score >= 9) return 'HIGH';
  if (score >= 5) return 'MEDIUM';
  if (score >= 3) return 'LOW-M';
  return 'LOW';
};

const DEFAULT_CELLS = {
  '5-4': 1,
  '2-5': 1,
  '1-4': 1,
  '1-3': 5,
  '1-2': 2,
  '1-1': 55,
};

export default function RiskMatrix({ cellCounts, onCellClick }) {
  const pofLabels = ['1', '2', '3', '4', '5'];
  const cofLabels = ['1', '2', '3', '4', '5'];

  const assetsByCell = cellCounts || DEFAULT_CELLS;

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[260px]">
        <div className="text-[10px] text-slate-500 text-center mb-1">Consequence of Failure (CoF)</div>
        <div className="flex gap-1">
          <div className="flex flex-col items-center justify-center w-6 flex-shrink-0">
            <div className="text-[10px] text-slate-500 -rotate-90 whitespace-nowrap">PoF</div>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-5 gap-0.5 mb-0.5">
              {cofLabels.map(c => (
                <div key={c} className="text-[10px] text-slate-500 text-center">{c}</div>
              ))}
            </div>
            <div className="space-y-0.5">
              {[5, 4, 3, 2, 1].map((pof) => (
                <div key={pof} className="flex gap-0.5 items-center">
                  <div className="text-[10px] text-slate-500 w-3 text-right mr-1 flex-shrink-0">{pof}</div>
                  {cofLabels.map((cof) => {
                    const cofNum = parseInt(cof);
                    const bg = getRiskColor(pof, cofNum);
                    const key = `${pof}-${cofNum}`;
                    const count = assetsByCell[key] || 0;
                    return (
                      <div
                        key={cof}
                        onClick={() => onCellClick?.(pof, cofNum)}
                        className={`flex-1 aspect-square rounded flex items-center justify-center text-[10px] font-bold text-white/80 transition-opacity ${onCellClick ? 'cursor-pointer hover:opacity-90' : ''}`}
                        style={{ backgroundColor: bg, minHeight: 28 }}
                        title={`PoF:${pof} CoF:${cof} = ${getRiskLabel(pof, cofNum)}`}
                      >
                        {count > 0 ? count : (cellCounts ? '' : pof * cofNum)}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-2 flex-wrap">
          {[
            { label: 'LOW', color: '#166534' },
            { label: 'MEDIUM', color: '#b45309' },
            { label: 'HIGH', color: '#991b1b' },
            { label: 'EXTREME', color: '#7f1d1d' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
