
import ProductCart from "./ProductCart/ProductCart";
import { ShoppingCart, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import ProductDisplay from "./ProductDisplay/ProductDisplay";
import StoreResults from "./StoreResults/StoreResults";
import { supabase } from "../../../lib/supabase";
import AdvancedSearch from "./AdvancedSearch/AdvancedSearch";
import type { CartItem, DisplayResultProduct, Filters, ShoppingProduct, ShoppingProductResult, StoreResult } from "../types";
import type { SearchRequestItem } from "../../../types";


export const DEFAULT_FILTERS: Filters = {
    city: "68134",       // Sofia
    maxDistance: null,   // no limit
    stores: [],          // all chains
    sortBy: "price",     // cheapest first
};

interface ShoppingListProps {
    cart: SearchRequestItem[]
    setCart: React.Dispatch<React.SetStateAction<SearchRequestItem[]>>
    lastResults: StoreResult[] | null
    originalResults: StoreResult[] | null
    lastResultsAt: string | null
    setLastResults: (results: StoreResult[] | null, original: StoreResult[] | null) => void
}


export default function ShoppingList({ cart, setCart, lastResults, originalResults, lastResultsAt, setLastResults }: ShoppingListProps) {
    const [searchLoading, setSearchLoading] = useState(false);
    const [result, setResult] = useState<StoreResult[] | null>(lastResults);
    const [error, setError] = useState<string | null>(null)
    const [showModal, setShowModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [preferredLocations, setPreferredLocations] = useState<Set<string>>(new Set());
    const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
    const preferredLocationsRef = useRef<Set<string>>(new Set());

    const activeFilterCount: number = [
        filters.city !== DEFAULT_FILTERS.city,
        filters.maxDistance !== null,
        filters.stores.length > 0,
        filters.sortBy !== "price",
    ].filter(Boolean).length;

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data }) => {
            if (!data?.user) return;
            const { data: rows } = await supabase.from("profile_stores")
                .select("store_id").eq("profile_id", data.user.id);
            if (!rows?.length) return;
            const { data: storeRows } = await supabase.from("stores")
                .select("location").in("id", rows.map(r => r.store_id));
            if (storeRows) {
                const locs = new Set(storeRows.map(s => s.location).filter(Boolean));
                preferredLocationsRef.current = locs;
                setPreferredLocations(locs);
            }
        });
    }, []);

    useEffect(() => {
        if (!result || result.length === 0) return;
        setLastResults(result, originalResults);
    }, [result]);

    const onPriceChange=useCallback((store: StoreResult, productId: string, alt: DisplayResultProduct): void => {
        setResult(prev => prev?.map(s =>
        s.storeName + s.locations[0] === store.storeName + store.locations[0]
            ? { ...s, totalPrice: store.totalPrice,
                 products: s.products.map(p => {
                            console.log(p.product?.id, p.id === productId, alt.id);
                            if(p.id !== productId) return p;
                            if(p.product){
                                return {...p, product: {...p.product, id: alt.id,
                                        price:        alt.price,
                                        productName:  alt.name,
                                        measurements: alt.size,
                                        pricePromotion : alt.pricePromotion}};
                            }else{
                                return {
                                    ...p, product: {
                                        id: alt.id,
                                        productName: alt.name,
                                        priceInfo: {
                                            price: alt.price,
                                            pricePromotion: alt.pricePromotion,
                                            effectivePrice: alt.effPrice,
                                            discountPercent: 0,
                                            pricePerKg: null,
                                            savings: 0
                                        },
                                        measurements: alt.size,
                                        weightBased: false,
                                        history: null
                                    } as ShoppingProduct 
                                }
                            }

                        }
                )}
            : s
        )?? null);
    },[]);

    const isStoreEdited = useCallback((store: StoreResult): boolean => {
        const originalStore = originalResults?.find( s => s.storeName + s.locations[0] === store.storeName + store.locations[0]);
        if(!originalStore) return false;
        return store.products.some((p, i) => p.product?.id !== originalStore.products[i]?.product?.id);
    },[originalResults]);

    const isProductEdited = useCallback((storeKey: string, productId: number): boolean => {
        const originalStore = originalResults?.find( s => s.storeName + s.locations[0] === storeKey);
        if(!originalStore) return false;
        return !originalStore.products.some(p => p.product?.id === productId);
    },[originalResults]);

    const handleReset = useCallback(() => {
        setResult(originalResults);
    },[originalResults]);

    const handleResetStore = useCallback((storeKey: string): void => {
        const originalStore = originalResults?.find( s => s.storeName + s.locations[0] === storeKey);
        if(!originalStore) return;
        setResult(prev => prev?.map(s => s.storeName + s.locations[0] === storeKey? originalStore : s)?? null);
    },[originalResults]);

    const saveHistoryFromResults = (results: StoreResult[]): void => {
        const raw = localStorage.getItem('shopHistory');
        const history: { stores: string[]; categories: string[] } = raw ? JSON.parse(raw) : { stores: [], categories: [] };
        results.forEach(r => {
            if (r.storeName && !history.stores.includes(r.storeName))
                history.stores.push(r.storeName);
        });
        cart.forEach(item => {
            if (item.category && !history.categories.includes(item.category))
                history.categories.push(item.category);
        });
        history.stores = history.stores.slice(-20);
        history.categories = history.categories.slice(-20);
        localStorage.setItem('shopHistory', JSON.stringify(history));
    };

    const toWeightGrams = (weightAmount: string, weightUnit: string | undefined): number | null => {
        if (!weightUnit || !weightAmount) return null;
        const n = parseFloat(weightAmount);
        if (!n || n <= 0) return null;
        return (weightUnit === 'кг' || weightUnit === 'л') ? n * 1000 : n;
    };

    const findCheapest = async (): Promise<void> => {
        if (cart.length === 0) return;
        setSearchLoading(true);
        setResult(null);
        setError(null);

        const body: CartItem[] = cart.map(item => ({
            name: item.details,
            category: item.category,
            brand: null,
            quantity: item.pieces ?? 1,
            weightGrams: toWeightGrams(item.weightAmount ? String(item.weightAmount) : '', item.weightUnit)
        }));

        try {
            const response = await fetch(
            `http://localhost:8080/api/cheapest?city=${encodeURIComponent(filters.city)}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            }
            );
            const data: StoreResult[] = await response.json();
            const preferred = preferredLocationsRef.current;
            if (Array.isArray(data) && preferred.size > 0) {
                data.sort((a, b) => {
                    const aP = a.locations.some(l => preferred.has(l));
                    const bP = b.locations.some(l => preferred.has(l));
                    if (aP !== bP) return aP ? -1 : 1;
                    return 0;
                });
            }
            console.log(data);
            setResult(data);
            setLastResults(data, data);
            if (Array.isArray(data)) saveHistoryFromResults(data);
        } catch (error) {
            console.error("Error finding cheapest store:", error);
            setResult(null);
            setLastResults(null, null);
            setError("Failed to find cheapest store. Please try again.")
        } finally {
            setSearchLoading(false);
        }
    };

    useEffect(() => {
        console.log(originalResults);
    },[originalResults]);

    return(
        <div className="min-h-screen bg-stone-50 p-8" style={{ fontFamily: 'Georgia, serif' }}>
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-8 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                        <h1 className="text-3xl font-bold text-stone-800">Shopping List</h1>
                        <p className="text-stone-400 mt-1">We'll find you the cheapest store</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Filter toggle button */}
                            <button
                                onClick={() => setShowFilters(v => !v)}
                                className={`relative px-4 py-3 rounded-xl border transition-all flex items-center gap-2 text-sm ${
                                    showFilters || activeFilterCount > 0
                                        ? "bg-stone-800 text-white border-stone-800"
                                        : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                                }`}
                            >
                                <SlidersHorizontal size={16} />
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="bg-white text-stone-800 text-xs font-semibold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>
 
                            <button
                                onClick={() => setShowModal(true)}
                                className="bg-stone-800 hover:bg-stone-700 text-white px-5 py-3 rounded-xl flex items-center gap-2 transition-all"
                            >
                                <Plus size={18} /> Add Product
                            </button>
                        </div>
                    </div>
                </div>
                <AdvancedSearch
                    open={showFilters}
                    onClose={() => setShowFilters(false)}
                    filters={filters}
                    setFilters={setFilters}
                />
                <ProductCart setCart={setCart} showModal={showModal} setShowModal={setShowModal} />

                {/* Cart Items */}
                <div className="space-y-3">
                    {cart.length === 0 ? (
                        <div className="bg-white border border-stone-200 rounded-2xl p-16 text-center">
                        <ShoppingCart className="mx-auto text-stone-200 mb-4" size={56} />
                        <p className="text-stone-400 text-lg">Your list is empty</p>
                        <p className="text-stone-300 text-sm mt-1">Add products to compare store prices</p>
                        </div>
                    ) : (
                        <>
                        {cart.map(item => (
                            <ProductDisplay key={item.id} item={item} setCart={setCart} />
                        ))}
                        </>
                    )}
                </div>
                {/* Find Cheapest Button */}
                <button onClick={findCheapest} disabled={searchLoading}
                className="w-full bg-stone-800 hover:bg-stone-700 disabled:bg-stone-300 text-white py-4 rounded-xl mt-4 transition-all flex items-center justify-center gap-2 font-medium"
                >
                    {searchLoading ? (
                        <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        Searching stores...
                        </>
                    ) : (
                        <>
                        <Search size={18} /> Find Cheapest Store
                        </>
                    )}
                </button>

                {/* Result */}
                    {!error && result && (result?.length ?? 0)  > 0 ? (
                        <div className="mt-2">
                            <StoreResults results={result} 
                                onPriceChange={onPriceChange}
                                preferredLocations={preferredLocations} 
                                isStoreEdited={isStoreEdited}
                                onResetStore={handleResetStore}
                                isProductEdited={isProductEdited}
                             />
                        </div>
                    ) : (
                        <div className="bg-white border border-stone-200 rounded-2xl p-16 text-center mt-4">
                            <Search className="mx-auto text-stone-200 mb-4" size={56} />
                            <p className="text-stone-400 text-lg">No stores found</p>
                            <p className="text-stone-300 text-sm mt-1">Try adjusting your search or adding different products</p>
                        </div>
                    )}
            </div>
        </div>
    );
}
