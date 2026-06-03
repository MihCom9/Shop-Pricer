import { Check, MessageSquareText, Ruler, Tag, X } from "lucide-react";
import { useEffect, useState } from "react";

const BRANDS = [
  { name: "Данон", state: "neutral" },
  { name: "Верея", state: "neutral" },
  { name: "Пещерско", state: "neutral" },
  { name: "Елит", state: "neutral" },
  { name: "Родопея", state: "neutral" },
  { name: "Победа", state: "neutral" },
  { name: "Мазних", state: "neutral" },
  { name: "Млечна", state: "neutral" },
];

const brandStyles = {
  neutral:   "bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200",
  preferred: "bg-green-100 text-green-800 border-green-400 hover:bg-green-200",
  excluded:  "bg-red-100 text-red-800 border-red-400 hover:bg-red-200",
};

export default function ProductDetails({
  details, setDetails,
  tags, setTags,
  brands, setBrands
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const value = input.trim();
    if (!value || tags.includes(value)) return;
    setTags([...tags, value]);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      addTag();
    }
  };

  const changeBrandState = (brandName) => {
    setBrands(prev => prev.map(b =>
      b.name === brandName
        ? { ...b, state: b.state === "neutral" ? "preferred" : b.state === "preferred" ? "excluded" : "neutral" }
        : b
    ));
  };

  useEffect(() => {
    setBrands(BRANDS);
  },[])

  return (
    <div className="flex flex-col gap-3">

      <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-stone-800 font-semibold text-sm mb-1">
          <Tag size={14} className="text-violet-500" />
          Марки
        </div>
        <p className="text-stone-400 text-xs leading-relaxed mb-2">
          Едно натискане — предпочитана · Две натискания — изключена · Три — нулиране
        </p>
        <div className="flex flex-row flex-wrap gap-2">
          {brands && brands.map(brand => (
            <button
              key={brand.name}
              className={`flex items-center gap-1 border rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${brandStyles[brand.state]}`}
              onClick={() => changeBrandState(brand.name)}
            >
              {brand.state === "preferred" && <Check size={12} />}
              {brand.state === "excluded" && <X size={12} />}
              {brand.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-stone-800 font-semibold text-sm mb-1">
          <Ruler size={14} className="text-amber-500" />
          Характеристики на продукта
        </div>
        <p className="text-stone-400 text-xs leading-relaxed mb-2.5">
          Напиши конкретни стойности — тегло, обем, процент масленост и др.
        </p>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`напр. "400гр", "3.6%"`}
          className="w-full text-sm px-3 py-2 rounded-lg bg-stone-50 border border-stone-200 focus:outline-none focus:bg-white focus:border-stone-400 text-stone-700 placeholder:text-stone-400 transition-colors"
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-stone-100 text-stone-700 border border-stone-300 rounded-full"
              >
                {tag}
                <button
                  onClick={() => setTags(prev => prev.filter(t => t !== tag))}
                  className="text-stone-400 hover:text-stone-700 transition-colors"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-stone-800 font-semibold text-sm mb-1">
          <MessageSquareText size={14} className="text-emerald-500" />
          Допълнителни бележки
        </div>
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

    </div>
  );
}
