import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, X, Trash2, DollarSign } from 'lucide-react';

const ProductCart = () => {
  const [cart, setCart] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [productTypes, setProductTypes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState('');

  // Replace with your actual backend URL
  const API_BASE_URL = 'http://localhost:8080/api';

  // Fetch product types when modal opens
  useEffect(() => {
    if (showModal && step === 1) {
      fetchProductTypes();
    }
  }, [showModal, step]);

  // Fetch brands when product is selected
  useEffect(() => {
    if (selectedProduct && step === 2) {
      fetchBrands(selectedProduct);
    }
  }, [selectedProduct, step]);

  // Clear search when modal closes
  useEffect(() => {
    if (!showModal) {
      setSearch('');
    }
  }, [showModal]);

  const fetchProductTypes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/product-types`);
      const data = await response.json();
      setProductTypes(data);
    } catch (error) {
      console.error('Error fetching product types:', error);
      // Fallback data for demo
      setProductTypes(['Milk', 'Bread', 'Eggs', 'Cheese', 'Butter']);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async (productName) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/product-type/brands?productName=${encodeURIComponent(productName)}`
      );
      const data = await response.json();
      setBrands(data);
    } catch (error) {
      console.error('Error fetching brands:', error);
      // Fallback data for demo
      setBrands(['Brand A', 'Brand B', 'Brand C']);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSearch(''); // Clear search when moving to next step
    setStep(2);
  };

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
  };

  const addToCart = () => {
    if (selectedProduct && selectedBrand) {
      const newItem = {
        id: Date.now(),
        product: selectedProduct,
        brand: selectedBrand,
        // You can add price calculation here later
        estimatedPrice: (Math.random() * 10 + 2).toFixed(2)
      };
      setCart([...cart, newItem]);
      closeModal();
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct('');
    setSelectedBrand('');
    setBrands([]);
    setStep(1);
    setSearch('');
  };

  const getTotalEstimate = () => {
    return cart.reduce((sum, item) => sum + parseFloat(item.estimatedPrice), 0).toFixed(2);
  };

  // Filter function for search
  const getFilteredItems = (items) => {
    if (!search.trim()) return items;
    return items.filter(item =>
      item.toLowerCase().includes(search.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-3 rounded-xl">
                <ShoppingCart className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Smart Shopping Cart</h1>
                <p className="text-gray-500">Find the cheapest store for your products</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg"
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>

          {/* Cart Summary */}
          {cart.length > 0 && (
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border-2 border-indigo-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="text-indigo-600" size={24} />
                  <span className="text-lg font-semibold text-gray-700">Estimated Total:</span>
                </div>
                <span className="text-3xl font-bold text-indigo-600">${getTotalEstimate()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="space-y-4">
          {cart.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <ShoppingCart className="mx-auto text-gray-300 mb-4" size={64} />
              <h2 className="text-2xl font-semibold text-gray-400 mb-2">Your cart is empty</h2>
              <p className="text-gray-400">Add products to find the best deals!</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between hover:shadow-xl transition-shadow"
              >
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">{item.product}</h3>
                  <p className="text-gray-500">Brand: {item.brand}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Est. Price</p>
                    <p className="text-2xl font-bold text-indigo-600">${item.estimatedPrice}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="bg-red-100 hover:bg-red-200 text-red-600 p-3 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Product Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {step === 1 ? 'Select Product' : 'Select Brand'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="mb-4">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={step === 1 ? 'Search products...' : 'Search brands...'}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-indigo-600 transition-all"
                />
              </div>

              {/* Step Indicator */}
              <div className="flex items-center gap-2 mb-6">
                <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
                <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <>
                  {/* Step 1: Product Selection */}
                  {step === 1 && (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {getFilteredItems(productTypes).length > 0 ? (
                        getFilteredItems(productTypes).map((product, index) => (
                          <button
                            key={index}
                            onClick={() => handleProductSelect(product)}
                            className="w-full text-left px-4 py-3 rounded-lg border-2 border-gray-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all"
                          >
                            <span className="font-medium text-gray-700">{product}</span>
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          No products found matching "{search}"
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2: Brand Selection */}
                  {step === 2 && (
                    <>
                      <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-600">Selected Product:</p>
                        <p className="text-lg font-semibold text-indigo-600">{selectedProduct}</p>
                      </div>
                      <div className="space-y-3 max-h-64 overflow-y-auto mb-6">
                        {getFilteredItems(brands).length > 0 ? (
                          getFilteredItems(brands).map((brand, index) => (
                            <button
                              key={index}
                              onClick={() => handleBrandSelect(brand)}
                              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                                selectedBrand === brand
                                  ? 'border-indigo-600 bg-indigo-50'
                                  : 'border-gray-200 hover:border-indigo-600 hover:bg-indigo-50'
                              }`}
                            >
                              <span className="font-medium text-gray-700">{brand}</span>
                            </button>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-400">
                            No brands found matching "{search}"
                          </div>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setStep(1);
                            setSearch('');
                            setSelectedBrand('');
                            setBrands([]);
                          }}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg transition-colors"
                        >
                          Back
                        </button>
                        <button
                          onClick={addToCart}
                          disabled={!selectedBrand}
                          className={`flex-1 px-6 py-3 rounded-lg transition-all transform ${
                            selectedBrand
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Add to Cart
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
    </div>
  );
};

export default ProductCart;