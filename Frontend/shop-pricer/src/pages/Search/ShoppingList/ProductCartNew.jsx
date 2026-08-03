import React, { useState, useEffect, useRef } from 'react';
import {X, Check} from 'lucide-react';
import ProductDetails from './ProductDetails';
const API_BASE_URL = 'http://localhost:8080/api';

const WEIGHT_UNITS = ['гр', 'кг', 'мл', 'л'];
const RECENT_CATEGORIES_KEY = 'recentCategories';
const MAX_RECENT_CATEGORIES = 6;

const loadRecentCategories = () => {
  try {
    const raw = localStorage.getItem(RECENT_CATEGORIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveRecentCategory = (category) => {
  const recent = loadRecentCategories().filter(c => c.name !== category.name);
  recent.unshift({ name: category.name, unitType: category.unitType });
  localStorage.setItem(RECENT_CATEGORIES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT_CATEGORIES)));
};

const ProductCartNew = ({setCart, showModal, setShowModal}) => {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [details, setDetails] = useState('');
  const [pieces, setPieces] = useState(1);
  const [weightUnit, setWeightUnit] = useState(WEIGHT_UNITS[0]);  // null = no weight selected
  const [weightAmount, setWeightAmount] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [tags, setTags] = useState([]);
  const [brands, setBrands] = useState([]);
  const [recentCategories, setRecentCategories] = useState([]);
  const [addedMessage, setAddedMessage] = useState(null);
  const addedTimerRef = useRef(null);

  useEffect(() => {
    if (showModal && step === 1) fetchCategories();
  }, [showModal]);

  useEffect(() => {
    setRecentCategories(loadRecentCategories());
    return () => clearTimeout(addedTimerRef.current);
  }, []);

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

    const savedPieces = selectedCategory.unitType === 'quantity' ? pieces : 1;
    const savedWeightAmount = selectedCategory.unitType === 'quantity' ? null : (weightAmount ? parseFloat(weightAmount) : null);
    const savedWeightUnit = selectedCategory.unitType === 'quantity' ? null : weightUnit;
    const fullDetails = [details, ...tags].filter(Boolean).join(", ");

    const labelParts = [];
    if (selectedCategory.unitType === 'quantity' && savedPieces > 1) labelParts.push(`${savedPieces}бр`);
    if (selectedCategory.unitType !== 'quantity' && savedWeightUnit && parseFloat(savedWeightAmount) > 0)
        labelParts.push(`${savedWeightAmount} ${savedWeightUnit}`);

    const label = fullDetails
        ? `${selectedCategory.name} — ${fullDetails}${labelParts.length ? ' · ' + labelParts.join(' · ') : ''}`
        : `${selectedCategory.name}${labelParts.length ? ' · ' + labelParts.join(' · ') : ''}`;


    setCart(prev => [...prev, {
      id: Date.now(),
      category: selectedCategory.name,
      unitType: selectedCategory.unitType,
      details: details,
      tags: tags,
      pieces,
      weightAmount: weightAmount ? parseFloat(weightAmount) : null,
      weightUnit,
      label,
    }]);

    saveRecentCategory(selectedCategory);
    setRecentCategories(loadRecentCategories());

    clearTimeout(addedTimerRef.current);
    setAddedMessage(label);
    addedTimerRef.current = setTimeout(() => setAddedMessage(null), 2500);

    resetItemFields();
  };

  const resetItemFields = () => {
    setStep(1);
    setSelectedCategory('');
    setDetails('');
    setPieces(1);
    setWeightUnit(WEIGHT_UNITS[0]);
    setWeightAmount('');
    setSearch('');
    setTags([]);
    setBrands([]);
  };

  const closeModal = () => {
    setShowModal(false);
    setAddedMessage(null);
    resetItemFields();
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8">

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
                    {addedMessage && (
                      <div className="flex items-center gap-2 mb-4 px-4 py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
                        <Check size={16} />
                        Added "{addedMessage}" — keep going!
                      </div>
                    )}
                    {recentCategories.length > 0 && !search && (
                      <div className="mb-4">
                        <p className="text-stone-400 text-xs mb-2">Quick add</p>
                        <div className="flex flex-wrap gap-2">
                          {recentCategories.map(cat => (
                            <button
                              key={cat.name}
                              onClick={() => handleCategorySelect(cat)}
                              className="px-3 py-1.5 rounded-full border border-stone-200 bg-stone-50 hover:border-stone-400 hover:bg-stone-100 text-sm text-stone-700 transition-all"
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search categories..."
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 mb-4 text-stone-700"
                    />
                    <div className="space-y-2 max-h-96 overflow-y-auto">
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
                              className="w-8 h-8 rounded-lg border border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center transition-colors"
                            >
                              −
                            </button>
                            <span className="w-7 text-center text-stone-800 font-semibold text-sm">{pieces}</span>
                            <button
                              type="button"
                              onClick={() => setPieces(p => p + 1)}
                              className="w-8 h-8 rounded-lg border border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center transition-colors"
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
                                    : 'bg-stone-100 border-stone-300 text-stone-600 hover:bg-stone-200 hover:text-stone-800'
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
                                className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-stone-300 focus:outline-none focus:border-stone-500 text-stone-700 placeholder:text-stone-400 text-sm"
                              />
                              <span className="text-stone-400 text-sm">{weightUnit}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <ProductDetails details={details} setDetails={setDetails}
                                input={input} setInput={setInput}
                                tags={tags} setTags={setTags}
                                brands={brands} setBrands={setBrands}
                    />
                    <div className="flex gap-3 mt-6">
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

export default ProductCartNew;
