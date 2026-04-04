import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Tag, SlidersHorizontal, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PromotionCard from './PromotionCard/PromotionCard';
import { supabase } from '../../lib/supabase';

const API_BASE_URL = 'http://localhost:8080/api';
const PAGE_SIZE = 40;

export default function PromotionsPage({ setCart }) {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [minDiscount, setMinDiscount] = useState(0);

  const [promotions, setPromotions] = useState([]);
  const offsetRef = useRef(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);

  const searchDebounceRef = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const sentinelRef = useRef(null);
  const loadingMoreRef = useRef(false);

  const [history] = useState(() => {
    const raw = localStorage.getItem('shopHistory');
    return raw ? JSON.parse(raw) : { stores: [], categories: [] };
  });
  const [preferredLocations, setPreferredLocations] = useState(new Set());
  const [preferredPromos, setPreferredPromos] = useState([]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) return;
      const { data: rows } = await supabase.from("profile_stores")
        .select("store_id").eq("profile_id", data.user.id);
      if (!rows?.length) return;
      const { data: storeRows } = await supabase.from("stores")
        .select("location").in("id", rows.map(r => r.store_id));
      if (storeRows) {
        setPreferredLocations(new Set(storeRows.map(s => s.location).filter(Boolean)));
      }
    });
  }, []);

  // Fetch preferred store promotions separately (independent of discount ranking)
  useEffect(() => {
    if (preferredLocations.size === 0) {
      setPreferredPromos([]);
      return;
    }
    if (storeFilter && !preferredLocations.has(storeFilter)) {
      setPreferredPromos([]);
      return;
    }

    let isCancelled = false;

    const fetchPreferred = async () => {
      const storesToFetch = storeFilter && preferredLocations.has(storeFilter)
        ? [storeFilter]
        : [...preferredLocations];

      const results = await Promise.all(
        storesToFetch.map(loc => {
          const qs = new URLSearchParams({ city: '68134', limit: 20, offset: 0, minDiscount });
          if (debouncedSearch) qs.set('search', debouncedSearch);
          if (categoryFilter) qs.set('category', categoryFilter);
          qs.set('store', loc);
          return fetch(`${API_BASE_URL}/promotions?${qs}`).then(r => r.json()).catch(() => []);
        })
      );

      if (isCancelled) return;

      const interleaved = [];
      const maxLen = Math.max(...results.map(r => r.length));
      for (let i = 0; i < maxLen; i++) {
        for (const arr of results) {
          if (arr[i]) interleaved.push(arr[i]);
        }
      }

      const seen = new Set();
      const unique = interleaved.filter(p => {
        const k = `${p.productName}|${p.storeName}`;
        return seen.has(k) ? false : seen.add(k);
      });
      
      setPreferredPromos(unique);
    };
    fetchPreferred();

    return () => { isCancelled = true; };
  }, [preferredLocations, debouncedSearch, categoryFilter, minDiscount, storeFilter]);

  // Load dropdowns once
  useEffect(() => {
    fetch(`${API_BASE_URL}/stores?city=68134`)
      .then(r => r.json()).then(setStores).catch(() => {});
    fetch(`${API_BASE_URL}/product-types`)
      .then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  // Debounce search
  useEffect(() => {
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(searchDebounceRef.current);
  }, [search]);

  const buildParams = useCallback((extraOffset) => {
    const qs = new URLSearchParams({
      city: '68134',
      limit: PAGE_SIZE,
      offset: extraOffset,
      minDiscount,
    });
    if (debouncedSearch) qs.set('search', debouncedSearch);
    if (storeFilter) qs.set('store', storeFilter);
    if (categoryFilter) qs.set('category', categoryFilter);
    return qs;
  }, [debouncedSearch, storeFilter, categoryFilter, minDiscount]);

  // First page whenever filters change
  useEffect(() => {
    const fetchFirst = async () => {
      setLoading(true);
      setError(null);
      setPromotions([]);
      offsetRef.current = 0;
      setHasMore(true);
      try {
        const res = await fetch(`${API_BASE_URL}/promotions?${buildParams(0)}`);
        if (!res.ok) throw new Error('Failed to load promotions');
        const data = await res.json();
        setPromotions(data);
        offsetRef.current = PAGE_SIZE;
        setHasMore(data.length === PAGE_SIZE);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFirst();
  }, [debouncedSearch, storeFilter, categoryFilter, minDiscount, buildParams]);

  // Load next page
  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const res = await fetch(`${API_BASE_URL}/promotions?${buildParams(offsetRef.current)}`);
      if (!res.ok) throw new Error('Failed to load more');
      const data = await res.json();
      setPromotions(prev => [...prev, ...data]);
      offsetRef.current += PAGE_SIZE;
      setHasMore(data.length === PAGE_SIZE);
    } catch (e) {
      setError(e.message);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [buildParams]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  const clearFilters = () => {
    setSearch(''); setStoreFilter(''); setCategoryFilter(''); setMinDiscount(0);
  };
  const hasActiveFilters = search || storeFilter || categoryFilter || minDiscount > 0;

  const handleAddToCart = (promotion) => {
    setCart(prev => [...prev, {
      id: Date.now(),
      category: promotion.categoryName,
      details: promotion.productName,
      label: promotion.productName,
    }]);
    navigate('/search');
  };

  const historyRec = preferredLocations.size === 0
    ? promotions.filter(p =>
        history.stores.some(s => p.storeName?.includes(s)) ||
        history.categories.includes(p.categoryName)
      )
    : [];
  const displayRecommended = preferredLocations.size > 0
    ? (!storeFilter || preferredLocations.has(storeFilter) ? preferredPromos : [])
    : historyRec;
  const recSet = new Set(displayRecommended.map(p => p.productName));
  const other = promotions.filter(p => !recSet.has(p.productName));

  return (
    <div className="min-h-screen bg-stone-50 p-8" style={{ fontFamily: 'Georgia, serif' }}>
      <div className="max-w-5xl mx-auto">

        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-8 mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Tag size={22} className="text-red-400" />
            <h1 className="text-3xl font-bold text-stone-800">Promotions</h1>
          </div>
          <p className="text-stone-400">Active deals across all stores — sorted by biggest discount</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal size={15} className="text-stone-400" />
            <span className="text-sm font-medium text-stone-600">Filters</span>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="ml-auto text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1">
                <X size={12} /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-8 pr-3 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 text-stone-700"
              />
            </div>
            <select
              value={storeFilter}
              onChange={e => setStoreFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 text-stone-700 bg-white"
            >
              <option value="">All stores</option>
              {stores.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 text-stone-700 bg-white"
            >
              <option value="">All categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400 whitespace-nowrap">Min {minDiscount}% off</span>
              <input
                type="range" min={0} max={80} step={5}
                value={minDiscount}
                onChange={e => setMinDiscount(Number(e.target.value))}
                className="w-full accent-stone-800"
              />
            </div>
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-2xl p-5 animate-pulse">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-3 bg-stone-100 rounded w-2/3" />
                  <div className="h-5 bg-stone-100 rounded-full w-12" />
                </div>
                <div className="h-3 bg-stone-100 rounded w-1/2 mb-4" />
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-stone-100 rounded w-1/3" />
                  <div className="h-6 bg-stone-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}
        {error && (
          <div className="bg-white border border-red-200 rounded-2xl p-8 text-center text-red-400">{error}</div>
        )}

        {!loading && !error && (
          <>
            {displayRecommended.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-widest mb-3">
                  {preferredLocations.size > 0 ? "Preferred stores" : "Recommended for you"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayRecommended.map((p, i) => (
                    <PromotionCard key={`rec-${i}`} promotion={p} onAddToCart={handleAddToCart} />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-widest mb-3">
                {displayRecommended.length > 0 ? 'All promotions' : `${promotions.length}${hasMore ? '+' : ''} promotions`}
              </h2>
              {promotions.length === 0 ? (
                <div className="bg-white border border-stone-200 rounded-2xl p-16 text-center">
                  <Tag className="mx-auto text-stone-200 mb-4" size={48} />
                  <p className="text-stone-400">No promotions match your filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(displayRecommended.length > 0 ? other : promotions).map((p, i) => (
                    <PromotionCard key={`promo-${i}`} promotion={p} onAddToCart={handleAddToCart} />
                  ))}
                </div>
              )}
            </div>

            {/* Sentinel for infinite scroll */}
            <div ref={sentinelRef} className="h-16 flex items-center justify-center">
              {loadingMore && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-stone-400" />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
