import { useState } from "react";
import {
  X, Star, ShoppingBag, MapPin, TrendingDown, TrendingUp,
  AlertTriangle, CheckCircle, ChevronDown, Tag, Clock, Info
} from "lucide-react";

// ─── tiny helpers ────────────────────────────────────────────────────────────
const mapsUrl = (addr) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;

const fmt = (n) => n.toFixed(2);

// ─── sub-components ──────────────────────────────────────────────────────────

function SummaryPill({ icon, label, variant = "neutral" }) {
  const variants = {
    neutral: "bg-stone-100 border-stone-200 text-stone-500",
    green:   "bg-green-50 border-green-200 text-green-700",
    amber:   "bg-amber-50 border-amber-200 text-amber-700",
    red:     "bg-red-50 border-red-200 text-red-600",
  };
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs ${variants[variant]}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

function MiniHistoryBar({ history }) {
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
          <span className="text-xs text-stone-400">{alt.size}</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-stone-800 ml-3 flex-shrink-0">{fmt(alt.price)} €</span>
    </button>
  );
}

function ProductCard({ product, selectedAltIndex, onSelectAlt }) {
  const [open, setOpen] = useState(false);
  const alt = product.alts[selectedAltIndex] ?? product.alts[0];
  const hasPromo = product.promo && product.promo < product.price;

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      open ? "border-stone-300 shadow-sm" : "border-stone-200"
    }`}>
      {/* Header row */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white text-left hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Tag size={13} className={`flex-shrink-0 ${hasPromo ? "text-red-400" : "text-stone-300"}`} />
          <div className="min-w-0">
            <p className="text-xs text-stone-400 mb-0.5">Searched: {product.cartItem}</p>
            <p className="text-sm text-stone-800 font-medium truncate">{alt.name}</p>
            <div className="flex items-center gap-1.5 mt-1">
              {product.mismatch ? (
                <span className="text-xs px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700">
                  ~{alt.size}
                </span>
              ) : (
                <span className="text-xs px-1.5 py-0.5 rounded bg-stone-50 border border-stone-200 text-stone-400">
                  {alt.size}
                </span>
              )}
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
              <p className="text-sm font-semibold text-stone-800">{fmt(alt.price)} €</p>
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
          {/* Swap product */}
          {product.alts.length > 1 && (
            <div className="mb-4">
              <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">Switch product</p>
              <div className="flex flex-col gap-1.5">
                {product.alts.map((a, ai) => (
                  <AltRow
                    key={ai}
                    alt={a}
                    selected={selectedAltIndex === ai}
                    onSelect={() => onSelectAlt(ai)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Mini price history */}
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">Price — last 8 weeks</p>
            <MiniHistoryBar history={product.history} />
          </div>
        </div>
      )}
    </div>
  );
}

function ProductsTab({ products, altState, setAltState }) {
  return (
    <div className="flex flex-col gap-2">
      {products.map((p, pi) => (
        <ProductCard
          key={pi}
          product={p}
          selectedAltIndex={altState[pi]}
          onSelectAlt={(ai) =>
            setAltState((prev) => prev.map((v, i) => (i === pi ? ai : v)))
          }
        />
      ))}
    </div>
  );
}

function HistoryTab({ products }) {
  return (
    <div className="flex flex-col gap-5">
      {products.map((p, pi) => {
        const hist = p.history;
        const minP = Math.min(...hist);
        const maxP = Math.max(...hist);
        return (
          <div key={pi}>
            <div className="flex items-baseline gap-1.5 mb-2">
              <p className="text-sm font-medium text-stone-800">{p.cartItem}</p>
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

function StoreInfoTab({ store }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="border border-stone-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100">
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Location</p>
          <p className="text-sm text-stone-700">{store.address}</p>
        </div>
        <div className="px-4 py-3 border-b border-stone-100">
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Opening hours</p>
          <p className="text-sm text-stone-700">Mon–Sat 08:00–22:00 · Sun 09:00–21:00</p>
        </div>
        <div className="px-4 py-3">
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Chain</p>
          <p className="text-sm text-stone-700">{store.storeName}</p>
        </div>
      </div>
      <a
        href={mapsUrl(store.address)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 py-3 rounded-xl border border-stone-200 text-sm text-stone-500 hover:border-stone-400 hover:text-stone-700 transition-all"
      >
        <MapPin size={14} />
        Open in Google Maps
      </a>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * StoreDetailSheet
 *
 * Props:
 *   store   – one result object from your /api/cheapest response, with an extra
 *             `address` string and optional `isBest` / `savingsVsAvg` fields.
 *             Shape:
 *             {
 *               storeName: string,
 *               totalPrice: number,
 *               address: string,
 *               isBest?: boolean,
 *               savingsVsAvg?: number,   // positive = saves money
 *               products: Array<{
 *                 cartItem: string,      // what the user typed
 *                 matched: string,       // full product name matched
 *                 productName: string,
 *                 size: string,
 *                 mismatch?: boolean,
 *                 price: number,
 *                 pricePromotion?: number,
 *                 history?: number[],    // 8-week price array, newest last
 *                 alts?: Array<{ name, size, price }>,
 *               }>
 *             }
 *   onClose – () => void
 */
export default function StoreDetailSheet({ store, onClose }) {
  const [tab, setTab] = useState("products");

  // Normalise products to include .alts and .history if absent
  const products = store.products.map((p) => ({
    cartItem: p.cartItem ?? p.productName,
    matched:  p.matched  ?? p.productName,
    alts:     p.alts ?? [{ name: p.productName, size: p.measurements ?? "—", price: p.pricePromotion && p.pricePromotion < p.price ? p.pricePromotion : p.price }],
    history:  p.history  ?? Array(8).fill(p.price),
    price:    p.price,
    promo:    p.pricePromotion ?? null,
    mismatch: !!p.sizeMismatch,
  }));

  const [altState, setAltState] = useState(
    products.map((p) => p.alts.findIndex((a) => a.selected) ?? 0)
  );

  const mismatches = products.filter((p) => p.mismatch).length;
  const totalItems = products.length;

  const TABS = [
    { id: "products", label: "Products" },
    { id: "history",  label: "Price history" },
    { id: "info",     label: "Store info" },
  ];

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Sheet */}
      <div
        className="w-full max-w-lg bg-white rounded-t-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: "92vh" }}
      >
        {/* Drag handle */}
        <div className="pt-3 pb-1 flex justify-center flex-shrink-0">
          <div className="w-9 h-1 rounded-full bg-stone-300" />
        </div>

        {/* ── Header ── */}
        <div className="px-5 pt-2 pb-4 border-b border-stone-100 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                store.isBest ? "bg-stone-800" : "bg-stone-100 border border-stone-200"
              }`}>
                {store.isBest
                  ? <Star size={18} className="text-white" fill="white" />
                  : <ShoppingBag size={17} className="text-stone-400" />
                }
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-semibold text-stone-800">{store.storeName}</span>
                  {store.isBest && (
                    <span className="text-xs font-bold uppercase tracking-wider bg-stone-800 text-white px-2 py-0.5 rounded-full">
                      Best deal
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin size={11} className="text-stone-400 flex-shrink-0" />
                  <span className="text-xs text-stone-400">{store.locations[0]}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xl font-semibold text-stone-800">
                  {fmt(store.totalPrice)}
                  <span className="text-sm font-normal text-stone-400 ml-0.5">€</span>
                </p>
                {store.isBest
                  ? <p className="text-xs text-green-600 font-medium">Cheapest</p>
                  : store.savingsVsAvg && (
                      <p className="text-xs text-red-500 font-medium">+{fmt(store.savingsVsAvg)} € more</p>
                    )
                }
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
              >
                <X size={13} className="text-stone-500" />
              </button>
            </div>
          </div>

          {/* Summary pills */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <SummaryPill
              icon={<CheckCircle size={12} />}
              label={`${totalItems} of ${totalItems} items found`}
              variant="green"
            />
            {store.savingsVsAvg > 0 && (
              <SummaryPill
                icon={<TrendingDown size={12} />}
                label={`Saves ${fmt(store.savingsVsAvg)} € vs avg`}
                variant="green"
              />
            )}
            {mismatches > 0 && (
              <SummaryPill
                icon={<AlertTriangle size={12} />}
                label={`${mismatches} size mismatch${mismatches > 1 ? "es" : ""}`}
                variant="amber"
              />
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-stone-100 px-5 flex-shrink-0">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`py-2.5 px-3 text-sm border-b-2 transition-all ${
                tab === t.id
                  ? "border-stone-800 text-stone-800 font-medium"
                  : "border-transparent text-stone-400 hover:text-stone-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1 px-5 py-4" style={{ fontFamily: "Georgia, serif" }}>
          {tab === "products" && (
            <ProductsTab
              products={products}
              altState={altState}
              setAltState={setAltState}
            />
          )}
          {tab === "history" && <HistoryTab products={products} />}
          {tab === "info"    && <StoreInfoTab store={store} />}
        </div>
      </div>
    </div>
  );
}