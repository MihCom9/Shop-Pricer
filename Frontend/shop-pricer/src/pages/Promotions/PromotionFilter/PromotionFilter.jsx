import { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8080/api';

const PromotionFilter = ({filters, onClear, onChange}) => {

    const [stores, setStores] = useState([]);
    const [storeLocations, setStoreLocations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isOpen, setIsOpen] = useState(true);
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
    // Load dropdowns once
    useEffect(() => {
    fetch(`${API_BASE_URL}/stores?city=68134`)
        .then(r => r.json()).then(setStores).catch(() => {setStores([]);});
    fetch(`${API_BASE_URL}/product-types`)
        .then(r => r.json()).then(setCategories).catch(() => {setCategories([]);});
    }, []);

    useEffect(() => {
      if(filters.store){
        fetch(`${API_BASE_URL}/stores/locations?city=68134&store=${filters.store}`)
          .then(r=> r.json()).then(setStoreLocations).catch(() => {});
      }else{
        setStoreLocations([]);
      }
    },[filters.store])
    
    // Debounce search
    useEffect(() => {
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = setTimeout(() => onChange("search", filters.search), 400);
        return () => clearTimeout(searchDebounceRef.current);
    }, [filters.search]);

    const hasActiveFilters = filters.search || filters.store || filters.category || filters.minDiscount > 0;
    const activeSort = filters.sort? filters.sort : SORT_OPTIONS[0].value;
    const activeShow = filters.show? filters.show : SHOW_OPTION[0].value;

    return(
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm mb-6">
          <div 
            className={`flex items-center px-5 py-4 gap-2 cursor-pointer`}
            onClick={() => {setIsOpen(prev => !prev);}}
            >
            <SlidersHorizontal size={15} className="text-stone-400" />
            <span className="text-sm font-medium text-stone-600">Filters</span>
            {/* {!isOpen && hasActiveFilters && (
              <span className="text-xs font-medium bg-stone-800 text-white px-2 py-0.5 rounded-full ml-1">
                {[filters.search, filters.store, filters.category, filters.minDiscount > 0].filter(Boolean).length}
              </span>
            )} */}
            <div className="ml-auto text-stone-400">
            {isOpen? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </div>
            <div className={`overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
              <div className={`mx-5 py-4 border-t border-stone-100`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={e => onChange("search", e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-8 pr-3 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 text-stone-700"
                  />
                </div>
                <select
                  value={filters.store}
                  onChange={e => onChange("store", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 text-stone-700 bg-white"
                >
                  <option value="">All stores</option>
                  {stores.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {filters.store && (
                  <select
                    value={filters.storeLocation}
                    onChange={e => onChange("storeLocation", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 text-stone-700 bg-white"
                  >
                    <option value="">All stores locations</option>
                    {storeLocations.map(sl => <option key={sl} value={sl}>{sl}</option>)}
                  </select>
                )}
                <select
                  value={filters.category}
                  onChange={e => onChange("category", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 text-stone-700 bg-white"
                >
                  <option value="">All categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400 whitespace-nowrap">Min {filters.minDiscount}% off</span>
                  <input
                    type="range" min={0} max={80} step={5}
                    value={filters.minDiscount}
                    onChange={e => onChange("minDiscount", Number(e.target.value))}
                    className="w-full accent-stone-800"
                  />
                </div>
              </div>
              {hasActiveFilters && (
                  <button onClick={onClear} className="mt-3 text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1">
                    <X size={12} /> Clear all
                  </button>
                )}
              </div>
              <div className="mx-5 py-3 border-t border-stone-100">
                <div className="flex flex-row flex-wrap gap-3 items-center">
                  <span className="text-sm font-medium text-stone-600">Sort</span>
                  {SORT_OPTIONS.map((option) =>(
                    <button
                      key={option.value}
                      onClick={() => {onChange("sort", option.value)}}option
                      className={`text-sm px-3 py-1 rounded-full border transition-all ${
                        activeSort === option.value
                          ? "border-stone-300 bg-stone-50 text-stone-900 font-medium"
                          : "border-transparent text-stone-400 hover:text-stone-600"
                      }
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-row flex-wrap gap-3 items-center mt-0.5">
                  <span className="text-sm font-medium text-stone-600">Show</span>
                  {SHOW_OPTION.map((option) =>(
                    <button
                      key={option.value}
                      onClick={() => {onChange("show", option.value)}}
                      className={`text-sm px-3 py-1 rounded-full border transition-all ${
                        activeShow === option.value
                          ? "border-stone-300 bg-stone-50 text-stone-900 font-medium"
                          : "border-transparent text-stone-400 hover:text-stone-600"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
        </div>
    );
}

export default PromotionFilter;