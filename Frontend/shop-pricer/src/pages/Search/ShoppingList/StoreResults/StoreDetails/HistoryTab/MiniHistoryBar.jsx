import { fmt } from "../util";

// ─── MiniHistoryBar ───────────────────────────────────────────────────────────
export default function MiniHistoryBar({ history }) {
  const weeks = ["8w", "7w", "6w", "5w", "4w", "3w", "2w", "now"];
  const max = Math.max(...history);
  const min = Math.min(...history);
  return (
    <div className="flex flex-col gap-1">
      {history.map((v, i) => {
        const pct = max === min ? 55 : 15 + ((v - min) / (max - min)) * 65;
        const isLow = v === min;
        return (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-stone-400 w-7 flex-shrink-0">{weeks[i]}</span>
            <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${isLow ? "bg-green-500" : "bg-stone-700"}`}
                style={{ width: `${pct.toFixed(0)}%` }}
              />
            </div>
            <span className="text-xs text-stone-500 w-10 text-right">{fmt(v)} €</span>
          </div>
        );
      })}
    </div>
  );
}