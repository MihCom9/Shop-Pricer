import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ComboSelect from "../../../components/Select/ComboSelect";
import RadioSelect from "../../../components/Select/RadioSelect";

const API_BASE_URL = 'http://localhost:8080/api';
const LABEL = "text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5";

export default function BrowseFilter({filters, onClear, onChange}){
    const [stores, setStores] = useState([]);
    const [storeLocations, setStoreLocations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const searchDebounceRef = useRef(null);

    const SORT_OPTIONS = [
        { label: "Biggest discount", value: "discount" },
        { label: "Lowest price", value: "price_asc" },
        { label: "Highest price", value: "price_desc" },
        { label: "Newest", value: "newest" },
    ];
    const SHOW_OPTION = [
        {label: "All products", value: "all"},
        {label: "Promotions only", value: "promotions" }
    ];

    useEffect(() => {
        fetch(`${API_BASE_URL}/stores?city=68134`)
            .then(r => r.json()).then(setStores).catch(() => { setStores([]); });
        fetch(`${API_BASE_URL}/categories/names`)
            .then(r => r.json()).then(setCategories).catch(() => { setCategories([]); });
    }, []);

    useEffect(() => {
        if (filters.store) {
            fetch(`${API_BASE_URL}/stores/locations?city=68134&store=${filters.store}`)
                .then(r => r.json()).then(setStoreLocations).catch(() => {});
        } else {
            setStoreLocations([]);
        }
    }, [filters.store]);

    useEffect(() => {
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => onChange("search", filters.search), 400);
        return () => clearTimeout(searchDebounceRef.current);
    }, [filters.search]);

    const hasActiveFilters = filters.search || filters.store || filters.category || filters.minDiscount > 0;

    return (
        <div>
            <div className="bg-white border border-stone-200 rounded-2xl shadow-sm mb-6">
                <div className="flex flex-row items-center px-3.5 py-2.5 gap-2">
                    <div className="relative w-full">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" />
                        <input
                            type="text"
                            value={filters.search}
                            onChange={e => onChange("search", e.target.value)}
                            placeholder="Search products..."
                            className="w-full pl-8 pr-3 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 text-stone-700"
                        />
                    </div>
                    <button
                        onClick={() => setIsOpen(prev => !prev)}
                        className={`relative px-4 py-3 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${
                            isOpen || hasActiveFilters
                                ? "bg-stone-800 text-white border-stone-800"
                                : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                        }`}
                    >
                        <SlidersHorizontal size={14} />
                        Filters
                        {hasActiveFilters && (
                            <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? "bg-white/60" : "bg-stone-800"} absolute top-2 right-2`} />
                        )}
                    </button>
                </div>
            </div>
            {isOpen && (
                <div className="bg-white border border-stone-200 rounded-2xl shadow-sm mb-6 px-5 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col">
                            <p className={LABEL}>Category</p>
                            <ComboSelect
                                options={categories}
                                value={filters.category}
                                onChange={val => onChange("category", val)}
                                placeholder="All categories"
                            />
                        </div>
                        <div className="flex flex-col">
                            <p className={LABEL}>Store</p>
                            <ComboSelect
                                options={stores}
                                value={filters.store}
                                onChange={val => onChange("store", val)}
                                placeholder="All stores"
                            />
                        </div>
                        {storeLocations.length > 0 && (
                            <div className="flex flex-col">
                                <p className={LABEL}>Location</p>
                                <ComboSelect
                                    options={storeLocations}
                                    value={filters.storeLocation}
                                    onChange={val => onChange("storeLocation", val)}
                                    placeholder="All locations"
                                />
                            </div>
                        )}
                        <div className="flex flex-col">
                            <p className={LABEL}>Sort By</p>
                            <RadioSelect
                                options={SORT_OPTIONS}
                                value={filters.sort}
                                onChange={val => onChange("sort", val)}
                                label="Biggest discount"
                            />
                        </div>
                        <div className="flex flex-col">
                            <p className={LABEL}>Show</p>
                            <RadioSelect
                                options={SHOW_OPTION}
                                value={filters.show}
                                onChange={val => onChange("show", val)}
                                label="All products"
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-stone-100">
                        <div className="flex items-center gap-4 flex-1">
                            <p className={LABEL + " whitespace-nowrap"}>Min discount</p>
                            <div className="flex items-center gap-3 flex-1">
                                <input
                                    type="range" min={0} max={80} step={5}  
                                    value={filters.minDiscount}
                                    onChange={e => onChange("minDiscount", Number(e.target.value))}
                                    className="flex-1 accent-stone-800 min-w-8"
                                />
                                <span className="text-xs text-stone-500 w-12 whitespace-nowrap">
                                    {filters.minDiscount > 0 ? `${filters.minDiscount}% off` : "Any"}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onClear}
                            className="text-xs text-stone-500 border border-stone-200 px-3 py-2 rounded-xl hover:border-stone-400 hover:text-stone-700 transition-all whitespace-nowrap"
                        >
                            Clear all
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}