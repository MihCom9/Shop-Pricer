import { useState } from "react";
import { ChevronDown, ShoppingBag, Tag, MapPin, Trophy } from "lucide-react";

const mapsUrl = (query) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

const StoreResults = ({ results }) => {
  const [openStore, setOpenStore] = useState(null);
  const minPrice = Math.min(...results.map((s) => s.totalPrice));

  return (
    <div className="flex flex-col gap-2" style={{ fontFamily: "Georgia, serif" }}>
      {results.map((store) => {
        const isOpen = openStore === (store.storeName+store.locations[0]);
        const isBest = store.totalPrice === minPrice;
        const saving = isBest ? null : (store.totalPrice - minPrice).toFixed(2);

        return (
          <div
            key={store.store}
            onClick={() => setOpenStore(isOpen ? null : (store.storeName+store.locations[0]))}
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
            {isOpen && (
              <div className="px-5 pt-2 pb-4 bg-white border-t border-stone-200">
                <div className="flex flex-col">
                  {store.products.map((product, idx) => {
                    const promoPrice =
                      product.pricePromotion &&
                      product.pricePromotion > 0 &&
                      product.pricePromotion < product.price
                        ? product.pricePromotion
                        : null;

                    return (
                      <div
                        key={product.productName}
                        className={`flex items-center justify-between py-2 ${
                          idx < store.products.length - 1 ? "border-b border-dashed border-stone-100" : ""
                        }`}
                      >
                        {/* Product name */}
                        <div className="flex items-center gap-2 min-w-0">
                          <Tag
                            size={12}
                            className={`flex-shrink-0 ${promoPrice ? "text-red-400" : "text-stone-300"}`}
                          />
                          <p
                            className="text-sm text-stone-500 truncate"
                            title={product.productName}
                          >
                            {product.productName}
                          </p>
                          {product.measurements ? (
                            <span className={`text-xs px-1.5 py-0.5 rounded-md flex-shrink-0 ${
                              product.sizeMismatch
                                ? "bg-amber-50 text-amber-500 border border-amber-200"
                                : product.weightBased
                                  ? "bg-blue-50 text-blue-400 border border-blue-100"
                                  : "bg-stone-50 text-stone-400 border border-stone-100"
                            }`}>
                              {product.sizeMismatch ? "~" : ""}{product.measurements}
                            </span>
                          ) : (
                            <span className="text-xs px-1.5 py-0.5 rounded-md flex-shrink-0 bg-stone-50 text-stone-400 border border-stone-100">
                              1 бр.
                            </span>
                          )}
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-1.5 ml-4 flex-shrink-0">
                          {promoPrice ? (
                            <>
                              <span className="text-xs text-stone-300 line-through">
                                {product.price.toFixed(2)} €
                              </span>
                              <span className="text-sm font-semibold text-red-500">
                                {promoPrice.toFixed(2)} €
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-semibold text-stone-800">
                              {product.price.toFixed(2)} €
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Location footer */}
                    <div className="flex flex-col gap-1.5 pt-3 mt-1 border-t border-stone-100">
                      {store.locations.map((location) => (
                        <div key={location} className="flex flex-row items-center gap-1.5">
                          <MapPin size={13} className="text-stone-300 flex-shrink-0" />
                          <a
                            href={mapsUrl(location)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="text-xs text-stone-400 bg-stone-50 border border-stone-200 rounded-full px-2 py-0.5 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-all"
                          >
                            {location}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StoreResults;