import ProductCart from "./ProductCart/ProductCart";
import { ShoppingCart, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import "./SearchPage.css";
import ProductDisplay from "./ProductDisplay/ProductDisplay";
import StoreResults from "./StoreResults/StoreResults";

export default function SearchPage({ cart, setCart }) {
    const [searchLoading, setSearchLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const saveHistoryFromResults = (results) => {
        const raw = localStorage.getItem('shopHistory');
        const history = raw ? JSON.parse(raw) : { stores: [], categories: [] };
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

    const findCheapest = async () => {
        if (cart.length === 0) return;
        setSearchLoading(true);
        setResult(null);

        const body = cart.map(item => ({
            name: item.details,
            category: item.category,
            brand: null,
            quantity: 1
        }));

        try {
            const response = await fetch(
            `http://localhost:8080/api/cheapest?city=${encodeURIComponent('68134')}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            }
            );
            const data = await response.json();
            setResult(data);
            if (Array.isArray(data)) saveHistoryFromResults(data);
        } catch (error) {
            console.error("Error finding cheapest store:", error);
            setResult({ error: "Failed to find cheapest store. Please try again." });
        } finally {
            setSearchLoading(false);
        }
    };

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
                        <button
                        onClick={() => setShowModal(true)}
                        className="bg-stone-800 hover:bg-stone-700 text-white px-5 py-3 rounded-xl flex items-center gap-2 transition-all"
                        >
                        <Plus size={18} /> Add Product
                        </button>
                    </div>
                </div>
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
                    {result?.length > 0 ? (
                        <div className="mt-2">
                            <StoreResults results={result} />
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
