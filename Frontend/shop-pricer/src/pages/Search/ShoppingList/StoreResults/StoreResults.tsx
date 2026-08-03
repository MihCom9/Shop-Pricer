import { useEffect, useState } from "react";
import { ChevronDown, ShoppingBag, Trophy } from "lucide-react";
import StoreDetailsSheet from "./StoreDetails/StoreDetailsSheet";
import type { DisplayResultProduct, StoreResult } from "../../types";
import type { SelectedStore } from "./types";
import StoreResultsSummary from "./StoreResultsSummary";

interface StoreResultProps {
  results: StoreResult[]
  onPriceChange: (store: StoreResult, productId: string, alt: DisplayResultProduct) => void
  preferredLocations: Set<string>
  isStoreEdited: (store: StoreResult) => boolean
  onResetStore: (storeKey: string) => void
  isProductEdited: (storeKey: string, productId: number) => boolean
}


const StoreResults = ({ results, onPriceChange ,preferredLocations = new Set(), isStoreEdited, onResetStore, isProductEdited }: StoreResultProps) => {
  const getStoreItemCount = (s : StoreResult): number => {
    return s.products.filter(p => p.product !== null).length;
  } 
  const [selectedStore, setSelectedStore] = useState<SelectedStore | null>(null);
  const maxItems = Math.max(...results.map(s => getStoreItemCount(s)));
  const fullResults = results.filter(s => getStoreItemCount(s) === maxItems);
  const minPrice = Math.min(...fullResults.map(s => s.totalPrice));
  const sortedResults = [...results].sort((a, b) => {
      const aFull = a.products.filter(p => p.product !== null).length;
      const bFull = b.products.filter(p => p.product !== null).length;
      if (bFull !== aFull) return bFull - aFull;
      return a.totalPrice - b.totalPrice;
  });

  useEffect(() => {
      if (!selectedStore) return;
      const updated = results.find(s => s.storeName + s.locations[0] === selectedStore.storeName + selectedStore.address);
      if (updated) setSelectedStore(prev => prev ? { ...prev, products: updated.products, totalPrice: updated.totalPrice } : null);
  }, [results]);

  return (
    <>
    <div className="flex flex-col gap-2" style={{ fontFamily: "Georgia, serif" }}>

      {/* Summary header + bar strip */}
      <StoreResultsSummary 
        results={sortedResults} 
        />

      {sortedResults.map((store) => {
        const isOpen = (selectedStore?.storeName?? "" + selectedStore?.locations[0]) === (store.storeName+store.locations[0]);
        const isBest = store.totalPrice === minPrice && store.products.length === maxItems;
        const saving = isBest ? null : (store.totalPrice - minPrice).toFixed(2);
        const isPreferred = store.locations.some(l => preferredLocations.has(l));
        const isEdited = isStoreEdited(store);

        return (
          <div
            key={store.storeName + store.locations[0]}
            onClick={() =>{
              setSelectedStore({
              ...store,
              address: store.locations[0],
              isBest: store.totalPrice === minPrice,
              moreVsBest: +(store.totalPrice - minPrice).toFixed(2),
            });
            }}
            className={`
              rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden bg-white
              ${isOpen
                ? "border border-stone-400 shadow-md"
                : isEdited
                  ? "border border-blue-200 shadow-sm hover:border-blue-300"
                  : "border border-stone-200 shadow-sm hover:border-stone-300"
              }
            `}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-5 py-4 ${isOpen ? "bg-stone-50" : "bg-white"}`}>
              {/* Left */}
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl flex-shrink-0 ${
                    isBest
                      ? "bg-stone-800 border border-stone-800 text-white"
                      : "bg-stone-100 border border-stone-200 text-stone-400"
                  }`}
                >
                  {isBest ? <Trophy size={17} /> : <ShoppingBag size={17} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-stone-800">
                      {store.storeName}
                    </p>
                    {isPreferred && (
                      <span className="bg-blue-50 text-blue-500 border border-blue-200 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ fontSize: "9px" }}>
                        Preferred
                      </span>
                    )}
                    {isBest && (
                      <span className="bg-stone-800 text-white font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ fontSize: "9px" }}>
                        Best deal
                      </span>
                    )}
                    {isEdited && (
                      <span className="bg-blue-50 text-blue-500 border border-blue-200 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ fontSize: "9px" }}>
                        Edited
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {getStoreItemCount(store)} items found
                  </p>
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <p className="font-bold text-base text-stone-800">
                    {store.totalPrice.toFixed(2)}
                    <span className="text-sm font-normal text-stone-400 ml-0.5">€</span>
                  </p>
                  {saving && (
                    <p className="text-xs font-medium text-red-400">
                      +{saving} € more
                    </p>
                  )}
                </div>
                <ChevronDown
                  size={16}
                  className={`text-stone-300 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : "rotate-0"}`}
                />
              </div>
            </div>

            {/* Expanded body */}
          </div>
        );
      })}
    </div>
    {selectedStore && (
              <StoreDetailsSheet
                store={selectedStore}
                onPriceChange={onPriceChange}
                onClose={() => setSelectedStore(null)}
                onResetStore={onResetStore}
                isProductEdited={isProductEdited}
              />
      )}
    </>
  );
};

export default StoreResults;