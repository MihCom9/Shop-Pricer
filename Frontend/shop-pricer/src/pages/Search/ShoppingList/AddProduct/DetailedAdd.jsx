import React, { useState, useEffect, useRef } from 'react';
import ProductDetails from '../ProductDetails';
import ComboSelect from '../../../../components/Select/ComboSelect';
import useFilterOptions from '../useFilterOptions';
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

const DetailsAdd = ({setCart, showModal, setShowModal}) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [details, setDetails] = useState('');
  const [pieces, setPieces] = useState(1);
  const [weightUnit, setWeightUnit] = useState(WEIGHT_UNITS[1]);  // null = no weight selected
  const [weightAmount, setWeightAmount] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [tag, setTag] = useState("");
  const [brands, setBrands] = useState([]);
  const [recentCategories, setRecentCategories] = useState([]);
  const [addedMessage, setAddedMessage] = useState(null);
  const addedTimerRef = useRef(null);
  const measurements = useFilterOptions(selectedCategory?.id, brands);

  useEffect(() => {
    if (showModal) fetchCategories();
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
      console.log(data);
      setCategories(data);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try{
      const res = await fetch(`${API_BASE_URL}/categories/${selectedCategory.name}/brands`);
      const data = await res.json();
      console.log(data);
      setBrands(data.map(b => ({...b, state: "neutral"})));
    } catch{
      setBrands([]);
    }
  };

  useEffect(() => {
    if(!selectedCategory) return;
    fetchBrands();
  }, [selectedCategory]);

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categories.find(c => c.name === categoryName)?? null);
  };

  const addToCart = () => {
    if (!selectedCategory) return;

    const savedPieces = selectedCategory.unitType === 'quantity' ? pieces : 1;
    const savedWeightAmount = selectedCategory.unitType === 'quantity' ? null : (weightAmount ? parseFloat(weightAmount) : 1);
    const savedWeightUnit = selectedCategory.unitType === 'quantity' ? null : weightUnit;
    const fullDetails = [details, tag].filter(Boolean).join(", ");

    const labelParts = [];
    if (selectedCategory.unitType === 'quantity' && savedPieces > 1) labelParts.push(`${savedPieces}бр`);
    if (selectedCategory.unitType !== 'quantity' && savedWeightUnit && parseFloat(savedWeightAmount) > 0)
        labelParts.push(`${savedWeightAmount} ${savedWeightUnit}`);

    const label = fullDetails
        ? `${selectedCategory.name} — ${fullDetails}${labelParts.length ? ' · ' + labelParts.join(' · ') : ''}`
        : `${selectedCategory.name}${labelParts.length ? ' · ' + labelParts.join(' · ') : ''}`;
    
    const brandSelections = brands
    .filter(b => b.state !== 'neutral')
    .map(b => ({ brandId: b.id, state: b.state })); // state: 'preferred' | 'excluded'

    setCart(prev => [...prev, {
      id: Date.now(),
      category: selectedCategory.name,
      categoryId: selectedCategory.id,
      brands,
      brandSelections,
      unitType: selectedCategory.unitType,
      details: details,
      measurements,
      tags: [tag],
      pieces,
      weightAmount: savedWeightAmount,
      weightUnit,
      label,
    }]);

    saveRecentCategory(selectedCategory);
    setRecentCategories(loadRecentCategories());

    clearTimeout(addedTimerRef.current);
    setAddedMessage(label);
    addedTimerRef.current = setTimeout(() => setAddedMessage(null), 2500);

    resetItemFields();
    closeModal();
  };

  const resetItemFields = () => {
    setSelectedCategory(null);
    setDetails('');
    setPieces(1);
    setWeightUnit(WEIGHT_UNITS[0]);
    setWeightAmount('');
    setSearch('');
    setTag("");
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
              <>
                <div className="flex flex-col gap-1 mb-4">
                    <span className="text-stone-400 text-xs">Category</span>
                    <ComboSelect
                        options={categories.map(c => c.name)}
                        value={selectedCategory?.name ?? ''}
                        onChange={(value) => handleCategorySelect(value)}
                    />
                </div>
                {selectedCategory && <div>
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
                            measurements={measurements}
                            tag={tag} setTag={setTag}
                            brands={brands} setBrands={setBrands}
                />
              </div>}
                <div className="flex gap-3 mt-6">
                    <button
                    onClick={() => {setDetails(''); setPieces(1); setWeightUnit(WEIGHT_UNITS[0]); setWeightAmount(''); }}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailsAdd;
