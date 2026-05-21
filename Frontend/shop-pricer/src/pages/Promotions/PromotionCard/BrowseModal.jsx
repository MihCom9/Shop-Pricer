import { X, Tag, MapPin, ShoppingCart, ExternalLink } from 'lucide-react';

export default function BrowseModal({ promotion, onClose, onAddToCart }) {
  if (!promotion) return null;

  const hasPromo = promotion.priceInfo.pricePromotion != null
    && promotion.priceInfo.pricePromotion < promotion.priceInfo.price
    && promotion.priceInfo.pricePromotion > 0;
  const saving = hasPromo
    ? (promotion.price - promotion.priceInfo.pricePromotion).toFixed(2)
    : null;

  return (
    // backdrop
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* modal panel */}
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-4"
        onClick={e => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {hasPromo ? (
              <span className="bg-red-50 text-red-500 text-sm font-bold px-3 py-1 rounded-lg">
                -{promotion.discountPercent.toFixed(0)}%
              </span>
            ) : (
              <span className="bg-stone-50 text-stone-400 text-sm px-3 py-1 rounded-lg">
                No promo
              </span>
            )}
            <span className="text-sm text-stone-400">{promotion.categoryName}</span>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* product name */}
        <div className="flex items-start gap-2">
          <Tag size={15} className="text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-lg font-semibold text-stone-800 leading-snug">
              {promotion.productName}
            </p>
            {promotion.measurements && (
              <p className="text-sm text-stone-400 mt-0.5">{promotion.measurements}</p>
            )}
          </div>
        </div>

        {/* store */}
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(promotion.storeName)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-blue-500 transition-colors w-fit"
        >
          <MapPin size={13} className="flex-shrink-0" />
          {promotion.storeName}
          <ExternalLink size={11} />
        </a>

        {/* divider */}
        <div className="border-t border-stone-100" />

        {/* price block */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-stone-800">
            {hasPromo
              ? promotion.priceInfo.pricePromotion.toFixed(2)
              : promotion.priceInfo.price.toFixed(2)} €
          </span>
          {hasPromo && (
            <div className="flex flex-col">
              <span className="text-sm text-stone-300 line-through">
                {promotion.priceInfo.price.toFixed(2)} €
              </span>
              <span className="text-sm text-red-400 font-medium">
                saves {saving} €
              </span>
            </div>
          )}
        </div>

        {/* extra info you can fill in */}
        {promotion.description && (
          <p className="text-sm text-stone-500 leading-relaxed">{promotion.description}</p>
        )}

        {/* CTA */}
        <button
          onClick={() => { onAddToCart(promotion); onClose(); }}
          className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-sm font-medium flex items-center justify-center gap-2 transition-all"
        >
          <ShoppingCart size={16} /> Add to list
        </button>
      </div>
    </div>
  );
}