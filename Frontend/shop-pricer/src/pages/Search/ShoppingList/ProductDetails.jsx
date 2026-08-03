import { Check, ChevronDown, Info, MessageSquareText, Ruler, Tag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const BRANDS = [
  { id: 1, name: "Данон", state: "neutral" },
  { id: 2, name: "Верея", state: "neutral" },
  { id: 3, name: "Пещерско", state: "neutral" },
  { id: 4, name: "Елит", state: "neutral" },
  { id: 5, name: "Родопея", state: "neutral" },
  { id: 6, name: "Победа", state: "neutral" },
  { id: 7, name: "Мазних", state: "neutral" },
  { id: 8, name: "Млечна", state: "neutral" },
];

const brandStyles = {
  neutral:   "bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200",
  preferred: "bg-green-100 text-green-800 border-green-400 hover:bg-green-200",
  excluded:  "bg-red-100 text-red-800 border-red-400 hover:bg-red-200",
};

const measurementStyles = {
  neutral:   "bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200",
  preferred: "bg-green-100 text-green-800 border-green-400 hover:bg-green-200",

}

export default function ProductDetails({
  details, setDetails,
  measurements,
  tag, setTag,
  brands, setBrands
}) {
  const [error, setError] = useState(null);
  const errorTimer = useRef(null);
  const [open, setOpen] = useState({ brands: true, characteristics: false, notes: false });

  const toggleSection = (key) => setOpen(prev => ({ ...prev, [key]: !prev[key] }));

  const isValidTag = (value) => {
    const normalized = value.trim().toLowerCase();
    return /^\d+([.,]\d+)?\s*(гр|г|кг|мл|л|бр)$/i.test(normalized)
      || /^\d+([.,]\d+)?%$/.test(normalized);
  };

  const changeBrandState = (brandId) => {
    setBrands(prev => prev.map(b =>
      b.id === brandId
        ? { ...b, state: b.state === "neutral" ? "preferred" : b.state === "preferred" ? "excluded" : "neutral" }
        : b
    ));
  };

  const changeTagState = (measurement) => {
    if(tag === measurement) setTag("");
    else setTag(measurement);
    console.log(measurement);
  };

  const preferredBrands = brands ? brands.filter(b => b.state === "preferred") : [];
  const excludedBrandsCount = brands ? brands.filter(b => b.state === "excluded").length : 0;

  return (
    <div className="divide-y divide-stone-200">

      {/* Марка */}
      <div className="py-4">
        <button
          type="button"
          onClick={() => toggleSection('brands')}
          className="w-full flex items-center gap-2 text-left"
        >
          <Tag size={14} className="text-violet-500" />
          <span className="text-stone-700 font-medium text-sm">Марка</span>
          {preferredBrands.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {preferredBrands.map(b => (
                <span key={b.id} className="text-[11px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                  {b.name}
                </span>
              ))}
            </div>
          ) : excludedBrandsCount > 0 ? (
            <span className="text-stone-400 text-xs">{excludedBrandsCount} изключени</span>
          ) : (
            <span className="text-stone-400 text-xs">по избор</span>
          )}
          <span className="flex-1" />
          <Info size={14} className="text-violet-300" title="Едно натискане — предпочитана · Две натискания — изключена · Три — нулиране" />
          <ChevronDown size={16} className={`text-stone-400 transition-transform ${open.brands ? 'rotate-180' : ''}`} />
        </button>

        {open.brands && (
          <div className="mt-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-stone-400 text-xs leading-relaxed">
                Едно натискане — предпочитана · Две натискания — изключена · Три — нулиране
              </p>
              {brands && brands.some(b => b.state !== "neutral") && (
                <button
                  className="shrink-0 text-xs flex flex-row gap-1 items-center
                  rounded-lg border px-1.5 py-1 text-stone-400 hover:text-stone-600 hover:border-stone-600 transition-colors"
                  onClick={() => setBrands(prev => prev.map(b => ({...b, state: "neutral"})))}
                >
                  Clear <X size={11}/>
                </button>
              )}
            </div>
            <div className="flex flex-row flex-wrap gap-2">
              {brands && brands.map(brand => (
                <button
                  key={brand.id}
                  className={`flex items-center gap-1 border rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${brandStyles[brand.state]}`}
                  onClick={() => changeBrandState(brand.id)}
                >
                  {brand.state === "preferred" && <Check size={12} />}
                  {brand.state === "excluded" && <X size={12} />}
                  {brand.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Характеристики */}
      <div className="py-4">
        <button
          type="button"
          onClick={() => toggleSection('characteristics')}
          className="w-full flex items-center gap-2 text-left"
        >
          <Ruler size={14} className="text-amber-500" />
          <span className="text-stone-700 font-medium text-sm">Стойности</span>
          {tag ? (
            <span className="text-stone-500 text-xs truncate max-w-[160px]">{tag}</span>
          ) : (
            <span className="text-stone-400 text-xs">по избор</span>
          )}
          <span className="flex-1" />
          <ChevronDown size={16} className={`text-stone-400 transition-transform ${open.characteristics ? 'rotate-180' : ''}`} />
        </button>

        {open.characteristics && (
          <div className="mt-3">
            <p className="text-stone-400 text-xs leading-relaxed mb-2.5">
              Напиши конкретни стойности — тегло, обем, процент масленост и др.
            </p>
            <p className={`text-red-500 text-xs mt-2 transition-all duration-300 overflow-hidden
              ${error ? 'opacity-100 max-h-10 translate-y-0' : 'opacity-0 max-h-0 -translate-y-1'}`}>
              {error}
            </p>
            {measurements.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {measurements.map(m => (
                  <button
                    key={m}
                    onClick={() => changeTagState(m)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium border rounded-full ${m === tag? measurementStyles["preferred"] : measurementStyles["neutral"]} `}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Бележки */}
      <div className="py-4">
        <button
          type="button"
          onClick={() => toggleSection('notes')}
          className="w-full flex items-center gap-2 text-left"
        >
          <MessageSquareText size={14} className="text-emerald-500" />
          <span className="text-stone-700 font-medium text-sm">Допълнителни</span>
          {details.trim() ? (
            <span className="text-stone-500 text-xs truncate max-w-[160px]">{details}</span>
          ) : (
            <span className="text-stone-400 text-xs">по избор</span>
          )}
          <span className="flex-1" />
          <ChevronDown size={16} className={`text-stone-400 transition-transform ${open.notes ? 'rotate-180' : ''}`} />
        </button>

        {open.notes && (
          <div className="mt-3">
            <p className="text-stone-400 text-xs leading-relaxed mb-2.5">
              Всичко друго — "без лактоза", "голяма опаковка"
            </p>
            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder={`напр. "без лактоза", "голяма опаковка"`}
              rows={1}
              className="w-full text-sm px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 focus:outline-none focus:bg-white focus:border-stone-400 text-stone-700 placeholder:text-stone-400 resize-none transition-colors"
            />
          </div>
        )}
      </div>

    </div>
  );
}
