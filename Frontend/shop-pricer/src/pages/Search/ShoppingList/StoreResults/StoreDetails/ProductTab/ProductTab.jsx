import { useEffect, useState } from "react";
import MiniHistoryBar from "../HistoryTab/MiniHistoryBar";
import { ChevronDown, Tag } from "lucide-react";
import { fmt } from "../utils/util";

const API_BASE_URL = 'http://localhost:8080/api';

// ─── AltRow ───────────────────────────────────────────────────────────────────
function AltRow({ alt, selected, onSelect }) {
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
      <span className="text-xs font-semibold text-stone-800 ml-3 flex-shrink-0">{fmt(alt.effPrice)} €</span>
    </button>
  );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────
function ProductCard({ product, selectedAlt, onSelectAlt, storeName, storeLocation }) {
  const [open, setOpen]       = useState(false);
  const [alts, setAlts]       = useState([]);
  const [loading, setLoading] = useState(false);

  const displayProduct = selectedAlt ?? {
    id: product.id,
    name:  product.matched,
    size:  product.measurements ?? "—",
    effPrice: product.promo && product.promo < product.price && product.promo > 0.00 ? product.promo : product.price,
    price: product.price,
    pricePromotion: product.promo
  };

  const hasPromo = product.promo && product.promo < product.price && product.promo > 0.00;

  useEffect(() => {
    if (!open || alts.length > 0) return;
    setLoading(true);
    const qs = new URLSearchParams({
      city:     "68134",
      name:     product.cartItem.name,
      category: product.cartItem.category,
      store:    storeName,
      location: storeLocation,
    });
    fetch(`${API_BASE_URL}/alts?${qs}`)
      .then(r => r.json())
      .then(data => {setAlts(Array.isArray(data) ? data : []); console.log(data)})
      .catch(() => setAlts([]))
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      open ? "border-stone-300 shadow-sm" : "border-stone-200"
    }`}>
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white text-left hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Tag size={13} className={`flex-shrink-0 ${hasPromo ? "text-red-400" : "text-stone-300"}`} />
          <div className="min-w-0">
            <p className="text-xs text-stone-400 mb-0.5">Searched: {product.cartItem.name}</p>
            <p className="text-sm text-stone-800 font-medium truncate">{displayProduct.name}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`text-xs px-1.5 py-0.5 rounded border ${
                product.mismatch
                  ? "bg-amber-50 border-amber-200 text-amber-700"
                  : "bg-stone-50 border-stone-200 text-stone-400"
              }`}>
                {product.mismatch ? "~" : ""}{displayProduct.size}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 ml-3 flex-shrink-0">
          <div className="text-right">
            {hasPromo ? (
              <>
                <p className="text-xs text-stone-300 line-through">{fmt(product.price)} €</p>
                <p className="text-sm font-semibold text-red-500">{fmt(product.promo)} €</p>
              </>
            ) : (
              <p className="text-sm font-semibold text-stone-800">{fmt(displayProduct.effPrice)} €</p>
            )}
          </div>
          <ChevronDown
            size={14}
            className={`text-stone-300 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Expanded panel */}
      {open && (
        <div className="bg-stone-50 border-t border-stone-200 px-4 py-4">
          {/* Alts */}
          <div className="mb-4">
            <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">Switch product</p>
            {loading ? (
              <p className="text-xs text-stone-400 py-2">Loading alternatives…</p>
            ) : alts.length === 0 ? (
              <p className="text-xs text-stone-400 py-2">No alternatives found</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {alts.map((a, ai) => {
                  const altPrice = a.pricePromotion && a.pricePromotion < a.price && a.pricePromotion > 0 ? a.pricePromotion :a.price;
                  const isSelected =
                    selectedAlt &&
                    selectedAlt.id === a.id;
                  return (
                    <AltRow
                      key={ai}
                      alt={{ name: a.productName, size: a.measurements ?? "—", effPrice: altPrice }}
                      selected={!!isSelected}
                      onSelect={() =>
                        onSelectAlt({
                          id: a.id,
                          name:  a.productName,
                          size:  a.measurements ?? "—",
                          effPrice: altPrice,
                          price: a.price,
                          pricePromotion: a.pricePromotion
                        })
                      }
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Price history */}
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">Price — last 8 weeks</p>
            <MiniHistoryBar history={product.history} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ProductsTab ──────────────────────────────────────────────────────────────
export default function ProductsTab({ products, altState, setAltState, storeName, storeLocation }) {
  return (
    <div className="flex flex-col gap-2">
      {products.map((p, pi) => (
        <ProductCard
          key={pi}
          product={p}
          selectedAlt={altState[pi]}
          onSelectAlt={(alt) =>
            setAltState((prev) => prev.map((v, i) => (i === pi ? alt : v)))
          }
          storeName={storeName}
          storeLocation={storeLocation}
        />
      ))}
    </div>
  );
}