import { Tag, ShoppingCart, Check, MapPin } from 'lucide-react';
import { useState } from 'react';

export default function PromotionCard({ promotion, onAddToCart, onCardClick }) {
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    onAddToCart(promotion);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const hasPromo = promotion.priceInfo.pricePromotion != null && promotion.priceInfo.pricePromotion < promotion.priceInfo.price && promotion.priceInfo.pricePromotion > 0;
  const saving = hasPromo ? (promotion.priceInfo.price - promotion.priceInfo.pricePromotion).toFixed(2) : null;

  return (
    <div 
      onClick={() => {onCardClick?.(promotion)}} 
      className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:border-stone-300 hover:scale-105 transition-all flex flex-col gap-3"
    >
      {/* Discount badge + category */}
      <div className="flex items-start justify-between gap-2">
        {hasPromo ? (
          <span className="bg-red-50 text-red-500 text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0">
            -{promotion.priceInfo.discountPercent.toFixed(0)}%
          </span>
        ) : (
          <span className="bg-stone-50 text-stone-400 text-xs font-medium px-2 py-1 rounded-lg flex-shrink-0">
            No promo
          </span>
        )}
        <span className="text-xs text-stone-400 text-right truncate">{promotion.categoryName}</span>
      </div>

      {/* Product name */}
      <div className="flex items-start gap-2 min-w-0 min-h-[3.5rem]">
        <Tag size={13} className="text-red-400 mt-0.5 flex-shrink-0" />
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-stone-700 leading-snug line-clamp-2">{promotion.productName}</p>
          {promotion.measurements && (
            <p className="text-xs text-stone-400 pt-0.25">{promotion.measurements}</p>
          )}
        </div>
      </div>

      {/* Store */}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(promotion.storeName)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {e.stopPropagation();}}
        className="text-xs text-stone-400 truncate flex items-center gap-1 hover:text-blue-500 transition-colors w-fit max-w-full"
      >
        <MapPin size={11} className="flex-shrink-0" />
        {promotion.storeName}
      </a>

      {/* Price row */}
      <div className="flex items-baseline gap-2 mt-auto">
        <span className="text-lg font-bold text-stone-800">
          {hasPromo ? promotion.priceInfo.pricePromotion.toFixed(2) : promotion.priceInfo.price.toFixed(2)} €
        </span>
        {hasPromo && (
          <>
            <span className="text-sm text-stone-300 line-through">
              {promotion.priceInfo.price.toFixed(2)} €
            </span>
            <span className="text-xs text-red-400 ml-auto">-{saving} €</span>
          </>
        )}
      </div>

      {/* Add to list button */}
      <button
        onClick={handleAdd}
        className={`w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
          added
            ? 'bg-green-50 text-green-600 border border-green-200'
            : 'bg-stone-800 hover:bg-stone-700 text-white'
        }`}
      >
        {added ? (
          <><Check size={15} /> Added to list</>
        ) : (
          <><ShoppingCart size={15} /> Add to list</>
        )}
      </button>
    </div>
  );
}