import { MapPin } from "lucide-react";

const mapsUrl = (addr) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;

// ─── StoreInfoTab ─────────────────────────────────────────────────────────────
export default function StoreInfoTab({ store }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="border border-stone-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100">
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Location</p>
          <p className="text-sm text-stone-700">{store.locations?.[0]}</p>
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
        href={mapsUrl(store.locations?.[0] ?? "")}
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