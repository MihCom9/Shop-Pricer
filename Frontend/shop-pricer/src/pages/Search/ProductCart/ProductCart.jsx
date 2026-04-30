import React, { useState, useEffect } from 'react';
import {X} from 'lucide-react';
const API_BASE_URL = 'http://localhost:8080/api';

const WEIGHT_UNITS = ['гр', 'кг', 'мл', 'л'];


const formatLabel = (category, details, pieces, weightAmount, weightUnit) => {
  const base = details ? `${category} — ${details}` : category;
  const parts = [];
  if (pieces > 1) parts.push(`${pieces}бр`);
  if (weightUnit && parseFloat(weightAmount) > 0) parts.push(`${weightAmount} ${weightUnit}`);
  return parts.length ? `${base} · ${parts.join(' · ')}` : base;
};

const ProductCart = ({setCart, showModal, setShowModal}) => {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [details, setDetails] = useState('');
  const [pieces, setPieces] = useState(1);
  const [weightUnit, setWeightUnit] = useState(WEIGHT_UNITS[0]);  // null = no weight selected
  const [weightAmount, setWeightAmount] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showModal && step === 1) fetchCategories();
  }, [showModal]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      const data = await res.json();
      setCategories(data);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
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
      category: selectedCategory.name,
      unitType: selectedCategory.unitType,
      details: details.trim(),
      pieces,
      weightAmount: weightAmount ? parseFloat(weightAmount) : null,
      weightUnit,
      label: formatLabel(selectedCategory.name, details.trim(), pieces, weightAmount, weightUnit),
    }]);
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setStep(1);
    setSelectedCategory('');
    setDetails('');
    setPieces(1);
    setWeightUnit(WEIGHT_UNITS[0]);
    setWeightAmount('');
    setSearch('');
  };

  const toggleWeightUnit = (u) => {
    if (weightUnit === u) {
      setWeightUnit(null);
      setWeightAmount('');
    } else {
      setWeightUnit(u);
      setWeightAmount('');
    }
  };

  return (
    <div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-stone-800">
                {step === 1 ? 'Pick a Category' : `Details for ${selectedCategory.name}`}
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
                          {cat.name}
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
                      Describe what you want — brand, type, anything. Or leave blank to search all.
                    </p>
                    <textarea
                      value={details}
                      onChange={e => setDetails(e.target.value)}
                      placeholder={`e.g. "прясно мляко 3%" or "краве масло"`}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 text-stone-700 resize-none mb-5"
                      autoFocus
                    />

                    {/* Quantity row */}
                    
                    <div className="flex items-center gap-4 mb-4">
                      {/* бр picker */}
                      {selectedCategory?.unitType === 'quantity' ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-stone-400 text-xs">Quantity</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPieces(p => Math.max(1, p - 1))}
                              className="w-8 h-8 rounded-lg border border-stone-200 hover:border-stone-400 text-stone-600 font-bold flex items-center justify-center transition-colors"
                            >
                              −
                            </button>
                            <span className="w-7 text-center text-stone-800 font-medium text-sm">{pieces}</span>
                            <button
                              type="button"
                              onClick={() => setPieces(p => p + 1)}
                              className="w-8 h-8 rounded-lg border border-stone-200 hover:border-stone-400 text-stone-600 font-bold flex items-center justify-center transition-colors"
                            >
                              +
                            </button>
                            <span className="text-stone-400 text-sm">бр</span>
                          </div>
                        </div>) : (
                        <div className="flex flex-col gap-1 flex-1">
                          <span className="text-stone-400 text-xs">Size</span>
                          <div className="flex gap-1">
                            {WEIGHT_UNITS.map(u => (
                              <button
                                key={u}
                                type="button"
                                onClick={() => toggleWeightUnit(u)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                  weightUnit === u
                                    ? 'bg-stone-800 text-white border-stone-800'
                                    : 'border-stone-200 text-stone-500 hover:border-stone-400'
                                }`}
                              >
                                {u}
                              </button>
                            ))}
                          </div>
                          {weightUnit && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <input
                                type="number"
                                min="1"
                                placeholder="e.g. 500"
                                value={weightAmount}
                                onChange={e => setWeightAmount(e.target.value)}
                                className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 focus:outline-none focus:border-stone-400 text-stone-700 text-sm"
                              />
                              <span className="text-stone-400 text-sm">{weightUnit}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => { setStep(1); setDetails(''); setPieces(1); setWeightUnit(WEIGHT_UNITS[0]); setWeightAmount(''); }}
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
