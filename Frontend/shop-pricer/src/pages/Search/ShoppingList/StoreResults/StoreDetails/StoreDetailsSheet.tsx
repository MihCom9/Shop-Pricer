import { useEffect, useState } from "react";
import {
  X, Star, ShoppingBag, MapPin, TrendingDown,
  AlertTriangle, CheckCircle,
  RotateCcw,
} from "lucide-react";
import ProductsTab from "./ProductTab";
import StoreInfoTab from "./StoreInfoTab";
import HistoryTab from "./HistoryTab/HistoryTab";
import type { DisplayResultProduct, ShoppingProductResult, StoreResult } from "../../../types";
import type { SelectedStore } from "../types";
import type { StoreDetailsProduct } from "./types";

const fmt = (n: number) => Number(n).toFixed(2);

const isRealPromo = (promo: number | null) => promo != null && Number(promo) > 0;

// ─── SummaryPill ─────────────────────────────────────────────────────────────

interface SummaryPillProps {
  icon: React.ReactNode;
  label: string;
  variant?: "neutral" | "green" | "amber" | "red"; // optional since it has a default
}

function SummaryPill({ icon, label, variant = "neutral" }: SummaryPillProps) {
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



// ─── StoreDetailsSheet ────────────────────────────────────────────────────────

interface StoreDetailsProps {
  store: SelectedStore
  onPriceChange: (store: StoreResult, productId: string, alt: DisplayResultProduct) => void
  onClose: () => void
  onResetStore: (storeKey: string) => void
  isProductEdited: (storeKey: string, productId: number) => boolean
}

export default function StoreDetailsSheet({ store, onPriceChange , onClose, onResetStore, isProductEdited }: StoreDetailsProps) {
  const [tab, setTab] = useState<"products" | "history" | "info">("products");

  const products: StoreDetailsProduct[] = store.products.map((p) => (p.product? {
    id: p.id,
    productId : p.product.id,
    cartItem:     p.cartItem,
    matched:      p.product.productName,
    measurements: p.product.measurements ?? "—",
    history:      p.product.history ?? Array(8).fill(p.product.priceInfo.effectivePrice),
    price:        p.product.priceInfo.price,
    promo:        p.product.priceInfo.pricePromotion ?? null,
    matchTier: p.product.matchTier,
    mismatch:     !!p.sizeMismatch,
    missing: false,
  } : 
  {
    id: p.id,
    cartItem: p.cartItem,
    mismatch: false,
    missing: true,
  }));

  const [altState, setAltState] = useState<(DisplayResultProduct | null)[]>(products.map(() => null));

  const mismatches  = products.filter((p) => p.mismatch).length;
  const totalItems  = products.length;
  const foundItems = store.storeSummary.foundProductCount;

  const TABS = [
    { id: "products", label: "Products" },
    { id: "history",  label: "Price history" },
    { id: "info",     label: "Store info" },
  ]as const;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-6xl mb-2 bg-white rounded-2xl shadow-2xl flex flex-col"
        style={{ height: "92vh" }}
      >
        {/* Drag handle */}
        <div className="pt-3 pb-1 flex justify-center flex-shrink-0">
          <div className="w-9 h-1 rounded-full bg-stone-300" />
        </div>

        {/* Header */}
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
                  <span className="text-xs text-stone-400">{store.locations?.[0]}</span>
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
                  : store.moreVsBest != null && (
                      <p className="text-xs text-red-500 font-medium">+{fmt(store.moreVsBest)} € more</p>
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

          {/* Pills */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <SummaryPill
              icon={<CheckCircle size={12} />}
              label={`${foundItems} of ${totalItems} items found`}
              variant="green"
            />
            {store.storeSummary.savingsVsAvg > 0 && store.storeSummary.foundProductCount === store.storeSummary.totalProductCount && (
              <SummaryPill
                icon={<TrendingDown size={12} />}
                label={`Saves ${fmt(store.storeSummary.savingsVsAvg)} € vs avg`}
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

        {/* Tabs */}
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

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {tab === "products" && (
            <ProductsTab
              products={products}
              altState={altState}
              setAltState={(updater: (prev: (DisplayResultProduct | null)[]) => (DisplayResultProduct | null)[]) => {
                setAltState((prev) => {
                  const next = updater(prev);
                  const changedIndex = next.findIndex((v, i) => v !== prev[i]);
                  const alt = next[changedIndex];
                  const product = products[changedIndex];

                  const newTotal = products.reduce((sum, p, i) => {
                    if (p.missing) return sum;
                    const a = next[i];
                    return sum + (a ? a.effPrice : (p.promo && isRealPromo(p.promo) && p.promo < p.price ?  p.promo : p.price));
                  }, 0);
                  if (!product || !alt) return next;
                  console.log(product.id);
                  onPriceChange({...store, totalPrice: newTotal}, product.id, alt);
                  return next;
                });
              }}
              storeName={store.storeName}
              storeLocation={store.locations?.[0]}
              isProductEdited={isProductEdited}
            />
          )}
          {tab === "history" && <HistoryTab products={products} />}
          {tab === "info"    && <StoreInfoTab store={store} />}
        </div>
          {onResetStore && (
            <div className="flex items-center justify-end px-5 py-3 border-t border-stone-100 flex-shrink-0">
              <button
                onClick={() => {
                  onResetStore(store.storeName + store.locations?.[0]);
                  setAltState(products.map(() => null));
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors text-sm"
              >
                <RotateCcw size={13} />
                Reset changes
              </button>
            </div>
          )}
      </div>
    </div>
  );
}