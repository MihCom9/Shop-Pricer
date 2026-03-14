import React, { useState, useEffect } from 'react';
import {X} from 'lucide-react';
const API_BASE_URL = 'http://localhost:8080/api';

const ProductCart = ({setCart, showModal, setShowModal}) => {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [details, setDetails] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showModal && step === 1) fetchCategories();
  }, [showModal]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/product-types`);
      const data = await res.json();
      setCategories(data);
    } catch {
      setCategories(['Milk', 'Bread', 'Eggs', 'Cheese', 'Butter', 'Juice', 'Cereal', 'Laundry', 'Yogurt', 'Coffee']);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(c =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setStep(2);
    setSearch('');
  };

  const addToCart = () => {
    if (!selectedCategory) return;
    setCart(prev => [...prev, {
      id: Date.now(),
      category: selectedCategory,
      details: details.trim(),
      label: details.trim() ? `${selectedCategory} — ${details.trim()}` : selectedCategory,
    }]);
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setStep(1);
    setSelectedCategory('');
    setDetails('');
    setSearch('');
  };
  return (
    <div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-stone-800">
                {step === 1 ? 'Pick a Category' : `Details for ${selectedCategory}`}
              </h2>
              <button onClick={closeModal} className="text-stone-300 hover:text-stone-500 transition-colors">
                <X size={22} />
              </button>
            </div>

            <div className="flex gap-2 mb-6">
              <div className="flex-1 h-1 rounded-full bg-stone-800" />
              <div className={`flex-1 h-1 rounded-full ${step === 2 ? 'bg-stone-800' : 'bg-stone-200'}`} />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-stone-800" />
              </div>
            ) : (
              <>
                {step === 1 && (
                  <>
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search categories..."
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 mb-4 text-stone-700"
                    />
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {filteredCategories.map((cat, i) => (
                        <button
                          key={i}
                          onClick={() => handleCategorySelect(cat)}
                          className="w-full text-left px-4 py-3 rounded-xl border border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-all text-stone-700 font-medium"
                        >
                          {cat}
                        </button>
                      ))}
                      {filteredCategories.length === 0 && (
                        <p className="text-center text-stone-400 py-8">No categories found</p>
                      )}
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <p className="text-stone-500 text-sm mb-4">
                      Describe what you want — brand, size, type, anything. Or leave blank to search all.
                    </p>
                    <textarea
                      value={details}
                      onChange={e => setDetails(e.target.value)}
                      placeholder={`e.g. "прясно мляко 3%" or "краве масло 200гр"`}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 text-stone-700 resize-none mb-6"
                      autoFocus
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setStep(1); setDetails(''); }}
                        className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 py-3 rounded-xl transition-all"
                      >
                        Back
                      </button>
                      <button
                        onClick={addToCart}
                        className="flex-1 bg-stone-800 hover:bg-stone-700 text-white py-3 rounded-xl transition-all"
                      >
                        Add to List
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCart;