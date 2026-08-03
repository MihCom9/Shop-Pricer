import { X } from "lucide-react";
import { useState, useEffect } from "react";
import ComboSelect from "../../../components/Select/ComboSelect";

const API_BASE_URL = 'http://localhost:8080/api';

const DISTANCES = [
    { label: "1 km", value: 1 },
    { label: "3 km", value: 3 },
    { label: "5 km", value: 5 },
    { label: "Any", value: null },
];

const STORES = ["Lidl", "Billa", "Kaufland", "Fantastico", "Metro"];

const SORT_OPTIONS = [
    { key: "price", label: "Total price", isDisabled: false },
    { key: "preferred", label: "Preferred first", isDisabled: true },
    { key: "distance", label: "Nearest", isDisabled: true },
    { key: "coverage", label: "Most items found", isDisabled: true },
];

export default function AdvancedSearch({ open, onClose, filters, setFilters }) {
    const [cities, setCities] = useState([]);
    const [citiesLoading, setCitiesLoading] = useState(false);

    useEffect(() => {
        if (!open) return;
        setCitiesLoading(true);
        fetch(`${API_BASE_URL}/cities-full`)
            .then(r => r.json())
            .then(data => { setCities(data); setCitiesLoading(false); })
            .catch(() => { setCities([]); setCitiesLoading(false); });
    }, [open]);

    if (!open) return null;

    const toggleStore = (store) => {
        setFilters(f => ({
            ...f,
            stores: f.stores.includes(store)
                ? f.stores.filter(s => s !== store)
                : [...f.stores, store],
        }));
    };

    const reset = () => {
        setFilters(f => ({
            city: 68134,
            maxDistance: null,
            stores: [],
            sortBy: "price",
        }));
    };

    return (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-5">
                <p className="text-xs font-medium text-stone-400 uppercase tracking-widest">
                    Search options
                </p>
                <button onClick={onClose} className="text-stone-300 hover:text-stone-500 transition-colors">
                    <X size={16} />
                </button>
            </div>

            {/* City + Distance */}
            <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                    <label className="block text-xs text-stone-400 mb-1.5">City</label>
                    {citiesLoading ? (
                        <div className="w-full h-9 bg-stone-100 rounded-xl animate-pulse" />
                    ) : (
                        <ComboSelect 
                            options={cities}
                            value={filters.city}
                            onChange={val => setFilters(f => ({...f, city: val}))}
                            placeholder="Select city"
                        />
                    )}
                </div>

                {/* Disabled — coming soon */}
                <div className="opacity-40">
                    <label className="block text-xs text-stone-400 mb-1.5">
                        Max distance
                        <span className="ml-1.5 text-stone-300 border border-stone-200 rounded px-1 py-px text-[10px] font-normal tracking-normal">soon</span>
                    </label>
                    <select
                        value={filters.maxDistance ?? ""}
                        disabled
                        className="w-full border border-dashed border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-400 bg-stone-50 cursor-not-allowed"
                    >
                        {DISTANCES.map(d => (
                            <option key={d.label} value={d.value ?? ""}>{d.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Store chains — disabled */}
            <div className="mb-5 opacity-40">
                <label className="block text-xs text-stone-400 mb-2">
                    Store chains
                    <span className="ml-1.5 text-stone-300 border border-stone-200 rounded px-1 py-px text-[10px] font-normal tracking-normal">soon</span>
                </label>
                <div className="flex flex-wrap gap-2">
                    {STORES.map(store => (
                        <span
                            key={store}
                            className="px-3.5 py-1.5 rounded-full text-sm border border-dashed border-stone-300 text-stone-400 cursor-not-allowed select-none"
                        >
                            {store}
                        </span>
                    ))}
                </div>
            </div>

            {/* Sort by */}
            <div className="mb-5">
                <label className="block text-xs text-stone-400 mb-2">Sort results by</label>
                <div className="flex flex-wrap gap-2">
                    {SORT_OPTIONS.map(opt => {
                        const active = filters.sortBy === opt.key;
                        if (opt.isDisabled) {
                            return (
                                <span
                                    key={opt.key}
                                    className="px-3.5 py-1.5 rounded-xl text-sm border border-dashed border-stone-200 text-stone-300 cursor-not-allowed select-none opacity-50"
                                >
                                    {opt.label}
                                    <span className="ml-1.5 text-[10px]">soon</span>
                                </span>
                            );
                        }
                        return (
                            <button
                                key={opt.key}
                                onClick={() => setFilters(f => ({ ...f, sortBy: opt.key }))}
                                className={`px-3.5 py-1.5 rounded-xl text-sm border transition-all ${
                                    active
                                        ? "bg-stone-800 text-white border-stone-800"
                                        : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                                }`}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 border-t border-stone-100 pt-4">
                <button
                    onClick={reset}
                    className="text-sm text-stone-400 hover:text-stone-600 px-3 py-1.5 transition-colors"
                >
                    Reset
                </button>
                <button
                    onClick={onClose}
                    className="bg-stone-800 hover:bg-stone-700 text-white text-sm px-5 py-1.5 rounded-xl transition-all"
                >
                    Apply
                </button>
            </div>
        </div>
    );
}