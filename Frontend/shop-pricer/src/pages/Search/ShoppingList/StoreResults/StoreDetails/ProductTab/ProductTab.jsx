import { useEffect, useRef, useState } from "react";
import MiniHistoryBar from "../HistoryTab/MiniHistoryBar";
import { ChevronDown, Tag } from "lucide-react";
import { fmt } from "../utils/util";

const API_BASE_URL = 'http://localhost:8080/api';

// ─── AltRow ───────────────────────────────────────────────────────────────────
function AltRow({ alt, selected, onSelect }) {
  const hasPromo = alt.pricePromotion && 
    alt.pricePromotion < alt.price && 
    alt.pricePromotion > 0;
  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all ${
        selected
          ? "border-stone-800 bg-stone-50"
          : "border-stone-200 bg-white hover:border-stone-300"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
          selected ? "bg-stone-800 border-stone-800" : "border-stone-300"
        }`}>
          {selected && (
            <svg width="8" height="8" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-stone-700 truncate">{alt.name}</p>
          <span className="text-xs text-stone-400">{alt.size ?? "—"}</span>
        </div>
      </div>
      <div className="text-right ml-3 flex-shrink-0">
        {hasPromo ? (
          <>
            <p className="text-xs text-stone-300 line-through">{fmt(alt.price)} €</p>
            <p className="text-xs font-semibold text-red-500">{fmt(alt.pricePromotion)} €</p>
          </>
        ) : (
          <span className="text-xs font-semibold text-stone-800">{fmt(alt.effPrice)} €</span>
        )}
      </div>
    </button>
  );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────
function ProductCard({ product, missing, selectedAlt, onSelectAlt, storeName, storeLocation, isProductEdited }) {
  const [open, setOpen] = useState(false);
  const [alts, setAlts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const isEdited = isProductEdited(storeName?? "" + storeLocation, product.productid);
  const altRef = useRef(null);
  const LIMIT = 5;

  const displayProduct = missing ? selectedAlt : (selectedAlt ?? {
    id: product.productId,
    name: product.matched,
    size: product.measurements ?? "—",
    effPrice: product.promo && product.promo < product.price && product.promo > 0 ? product.promo : product.price,
    price: product.price,
    pricePromotion: product.promo
  });

  const hasPromo = displayProduct?.pricePromotion &&
    displayProduct.pricePromotion < displayProduct.price &&
    displayProduct.pricePromotion > 0;


  const fetchAlts = (currentOffset) => {
    setLoading(true);
    const qs = new URLSearchParams({
      city: "68134",
      name: product.cartItem.name,
      category: product.cartItem.category,
      store: storeName,
      location: storeLocation,
      limit: LIMIT,
      offset: currentOffset,
      isFound: !missing
    });
    fetch(`${API_BASE_URL}/alts?${qs}`)
      .then(r => r.json())
      .then(data => {
        const results = Array.isArray(data) ? data : [];
        console.log(results);
        setAlts(prev => currentOffset === 0 ? results : [...prev, ...results]);
        setHasMore(results.length === LIMIT); // if less than limit came back, no more pages
          if (currentOffset > 0) {
            setTimeout(() => {
              altRef.current?.scrollTo({ top: altRef.current.scrollHeight, behavior: "auto" });
            }, 50);
          }
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    if (!open || alts.length > 0) return;
    fetchAlts(0);
  }, [open]);

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      open ? "border-stone-300 shadow-sm"
        : selectedAlt || isEdited ? "border-blue-200 shadow-sm"
        : missing ? "border-red-200"
        : "border-stone-200"
    }`}>
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white text-left hover:bg-stone-50 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <Tag size={13} className={`flex-shrink-0 ${
            missing && !selectedAlt ? "text-red-300"
              : hasPromo ? "text-red-400"
              : "text-stone-300"
          }`} />
          <div className="min-w-0">
            {/* Badges */}
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="text-xs px-1.5 py-0.5 rounded border bg-stone-50 border-stone-200 text-stone-400">
                Category: <span className="text-stone-500 font-medium">{product.cartItem.category || "—"}</span>
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded border bg-stone-50 border-stone-200 text-stone-400">
                Searched: <span className="text-stone-500 font-medium">{product.cartItem.name || "—"}</span>
              </span>
            </div>
            {/* Name or missing badge */}
            {displayProduct ? (
              <p className="text-sm text-stone-800 font-medium truncate">{displayProduct.name}</p>
            ) : (
              <span className="text-xs px-1.5 py-0.5 rounded border bg-red-50 border-red-200 text-red-400 font-medium">
                Not found in this store
              </span>
            )}
            {/* Size badge — only for found products */}
            {!missing && (
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-xs px-1.5 py-0.5 rounded border ${
                  product.mismatch ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-stone-50 border-stone-200 text-stone-400"
                }`}>
                  {product.mismatch ? "~" : ""}{displayProduct?.size}
                </span>
              </div>
            )}
          </div>
        </div>
        {/* Price */}
        <div className="flex items-center gap-2.5 ml-3 flex-shrink-0">
          {displayProduct && (
            <div className="text-right">
              {hasPromo ? (
                <>
                  <p className="text-xs text-stone-300 line-through">{fmt(displayProduct.price)} €</p>
                  <p className="text-sm font-semibold text-red-500">{fmt(displayProduct.pricePromotion)} €</p>
                </>
              ) : (
                <p className="text-sm font-semibold text-stone-800">{fmt(displayProduct.effPrice)} €</p>
              )}
            </div>
          )}
          <ChevronDown size={14} className={`text-stone-300 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="bg-stone-50 border-t border-stone-200 px-4 py-4">
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">
            {missing ? "Suggestions from this store" : "Switch product"}
          </p>
          {loading ? (
            <p className="text-xs text-stone-400 py-2">Loading…</p>
          ) : alts.length === 0 ? (
            <p className="text-xs text-stone-400 py-2">No alternatives found</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto" ref={altRef}>
                {alts.map((a, ai) => {
                  const isSelected = selectedAlt ? selectedAlt.id === a.id : (!missing && product.productId === a.id);
                  return (
                    <AltRow key={ai}
                      alt={{ name: a.productName, size: a.measurements ?? "—", effPrice: a.priceInfo.effectivePrice, price: a.priceInfo.price, pricePromotion: a.priceInfo.pricePromotion }}
                      selected={isSelected}
                      onSelect={() => onSelectAlt({ id: a.id, name: a.productName, 
                                size: a.measurements ?? "—", effPrice: a.priceInfo.effectivePrice, 
                                price: a.priceInfo.price, pricePromotion: a.priceInfo.pricePromotion,
                                matchTier: a.matchTier })}
                    />
                  );
                })}
              </div>
              {hasMore && (
                <button
                  onClick={() => {
                    const next = offset + LIMIT;
                    setOffset(next);
                    fetchAlts(next);
                  }}
                  disabled={loading}
                  className="mt-2 text-xs text-stone-400 hover:text-stone-600 transition-colors disabled:opacity-50"
                >
                  {loading ? "Loading…" : "Show more"}
                </button>
              )}
            </div>
          )}
          {/* Price history — only for found products */}
          {!missing && (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">Price — last 8 weeks</p>
              <MiniHistoryBar history={product.history} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── ProductsTab ──────────────────────────────────────────────────────────────
export default function ProductsTab({ products, altState, setAltState, storeName, storeLocation, isProductEdited }) {
  return (
    <div className="flex flex-col gap-2">
      {products.map((p, pi) => (
        <ProductCard
          key={pi}
          product={p}
          missing={p.missing}
          selectedAlt={altState[pi]}
          onSelectAlt={(alt) => setAltState(prev => prev.map((v, i) => i === pi ? alt : v))}
          storeName={storeName}
          storeLocation={storeLocation}
          isProductEdited={isProductEdited}
        />
      ))}
    </div>
  );
}