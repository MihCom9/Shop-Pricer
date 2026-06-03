
export default function StoreResultsSummary({ results }) {
  const getStoreItemCount = (s) => s.products.filter(p => p.product !== null).length;
  const maxItems = Math.max(...results.map(getStoreItemCount));
  const fullResults = results.filter(s => getStoreItemCount(s) === maxItems);
  const minPrice = Math.min(...fullResults.map(s => s.totalPrice));
  const maxPrice = Math.max(...results.map(s => s.totalPrice));
  const best = fullResults.find(s => s.totalPrice === minPrice);
  const saving = (maxPrice - minPrice).toFixed(2);

  return (
    <div className="pt-5 pb-0">
      {/* Hero card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-2.5">
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] font-semibold tracking-widest uppercase text-stone-400 mb-1">
              Best deal
            </p>
            <p className="text-2xl font-semibold text-stone-900 leading-tight">{best?.storeName}</p>
            <p className="text-xs text-stone-400 mt-1">
              {getStoreItemCount(best)} of {maxItems} items found
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-semibold text-stone-900 leading-none">
              {best?.totalPrice.toFixed(2)}
              <span className="text-base font-normal text-stone-400"> €</span>
            </p>
            {+saving > 0 && (
              <span className="inline-block mt-1.5 bg-green-50 text-green-800 text-[11px] font-medium px-2.5 py-1 rounded-full">
                saves {saving} € vs most expensive
              </span>
            )}
          </div>
        </div>

        {/* Bars */}
        <div className="flex flex-col gap-1.5">
          {results.map(store => {
            const isWinner = store.totalPrice === minPrice && getStoreItemCount(store) === maxItems;
            const pct = maxPrice > 0 ? (store.totalPrice / maxPrice) * 100 : 100;
            return (
              <div key={store.storeName + store.locations[0]} className="flex items-center gap-2.5">
                <span className="text-xs text-stone-400 w-[70px] truncate shrink-0">{store.storeName}</span>
                <div className="flex-1 bg-stone-100 rounded-full h-[5px] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${isWinner ? "bg-stone-800" : "bg-stone-300"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className={`text-xs w-[52px] text-right shrink-0 ${isWinner ? "text-stone-900 font-medium" : "text-stone-400"}`}>
                  {store.totalPrice.toFixed(2)} €
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-stone-300 text-center pb-3">tap a store for details</p>
    </div>
  );
}