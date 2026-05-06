import { useState } from "react";
import { ChevronDown, ShoppingBag, Trophy } from "lucide-react";
import StoreDetailsSheet from "./StoreDetails/StoreDetailsSheet";


const StoreResults = ({ results, onPriceChange ,preferredLocations = new Set() }) => {
  const [openStore, setOpenStore] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const minPrice = Math.min(...results.map((s) => s.totalPrice));

  const handlePriceChange = (updatedStore, product, alt) => {
    setSelectedStore(prev => ({ ...prev, totalPrice: updatedStore.totalPrice }));
    onPriceChange(updatedStore, product, alt);
  };

  return (
    <>
    <div className="flex flex-col gap-2" style={{ fontFamily: "Georgia, serif" }}>
      {results.map((store) => {
        const isOpen = (selectedStore?.storeName + selectedStore?.locations[0]) === (store.storeName+store.locations[0]);
        const isBest = store.totalPrice === minPrice;
        const saving = isBest ? null : (store.totalPrice - minPrice).toFixed(2);
        const isPreferred = store.locations.some(l => preferredLocations.has(l));

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
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {store.products.length} items found
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
                onPriceChange={handlePriceChange}
                onClose={() => setSelectedStore(null)}
              />
      )}
    </>
  );
};

export default StoreResults;