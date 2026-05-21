import { fmt } from "../utils/util";
import MiniHistoryBar from "./MiniHistoryBar";
import { TrendingDown, TrendingUp } from "lucide-react";


// ─── HistoryTab ───────────────────────────────────────────────────────────────
export default function HistoryTab({ products }) {
  return (
    <div className="flex flex-col gap-5">
      {products.map((p, pi) => {
        if(p.missing) return null;
        const hist = p.history?? [];
        if(hist.lenht === 0) return null;
        const minP = Math.min(...hist);
        const maxP = Math.max(...hist);
        return (
          <div key={pi}>
            <div className="flex items-baseline gap-1.5 mb-2">
              <p className="text-sm font-medium text-stone-800">{p.cartItem.name}</p>
              <p className="text-xs text-stone-400 truncate">{p.matched}</p>
            </div>
            <MiniHistoryBar history={hist} />
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-green-600 flex items-center gap-1">
                <TrendingDown size={11} /> Low: {fmt(minP)} €
              </span>
              <span className="text-xs text-red-500 flex items-center gap-1">
                <TrendingUp size={11} /> High: {fmt(maxP)} €
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
