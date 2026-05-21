import { X, ShoppingCart, Star, Plus, ListChecks } from "lucide-react";
import ShoppingListCreateForm from "../../Search/ListCreateForm/ShoppingListCreateForm";
import { useState } from "react";

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function SelectListModal({ promotion, shoppingLists, setShoppingLists, onClose }) {
  const [creatingNew, setCreatingNew] = useState(false);
  const addToList = (listId) => {
    const newItem = {
      id: generateId(),
      details: promotion.productName,
      category: promotion.categoryName ?? "",
      pieces: 1,
      weightAmount: 1,
      weightUnit: "кг",
    };
    setShoppingLists(prev =>
      prev.map(list =>
        list.id === listId
          ? { ...list, items: [...list.items, newItem] }
          : list
      )
    );
    onClose();
  };

  const onCreateList = (name, starred) => {
    const newId = generateId();
    const newItem = {id: generateId(), details: promotion.productName, category: promotion.categoryName ?? "", pieces: 1, weightAmount: 1, weightUnit: "кг"};
    const newList = {id: newId, name: name, items: [newItem], starred: starred, createdAt: new Date().toISOString()};
    setShoppingLists(prev => [newList, ...prev]);
    onClose();
    
  }

  const sorted = [...shoppingLists].sort((a, b) => {
    if (a.starred !== b.starred) return a.starred ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-sm border border-stone-200 w-full max-w-md mx-4 overflow-hidden"
        style={{ fontFamily: "Georgia, serif" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-400 mb-1 font-sans">
              Add to list
            </p>
            <h2 className="text-base font-semibold text-stone-800 leading-snug max-w-xs">
              {promotion.productName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
          >
            <X size={14} className="text-stone-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 pt-3 pb-1">
          <p className="text-xs text-stone-400 mb-2 px-1 font-medium">Choose a list</p>

          {shoppingLists.length === 0 ? (
            <div className="text-center py-10">
              <ListChecks className="mx-auto text-stone-200 mb-3" size={44} />
              <p className="text-stone-400 text-sm font-medium">No lists yet</p>
              <p className="text-stone-300 text-xs mt-1">Create a list first from the Shop tab</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {sorted.map(list => (
                <button
                  key={list.id}
                  onClick={() => addToList(list.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-stone-150 hover:bg-stone-50 hover:border-stone-200 transition-all text-left group"
                >
                  <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
                    <ShoppingCart size={15} className="text-stone-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-stone-800 truncate">{list.name}</p>
                      {list.starred && (
                        <Star size={11} className="text-amber-400 flex-shrink-0" fill="currentColor" />
                      )}
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {list.items.length === 0 ? "Empty" : `${list.items.length} item${list.items.length !== 1 ? "s" : ""}`}
                      {" · "}
                      {new Date(list.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short"
                      })}
                    </p>
                  </div>
                  <div className="w-6 h-6 rounded-full border border-stone-200 group-hover:border-stone-400 flex items-center justify-center flex-shrink-0 transition-all">
                    <Plus size={12} className="text-stone-300 group-hover:text-stone-600 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-4 mt-1 border-t border-stone-100">
          <button
            onClick={() => setCreatingNew(true)} 
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-stone-200 hover:bg-stone-50 hover:border-stone-300 transition-all text-stone-400 hover:text-stone-600 text-sm font-medium"
          >
            <Plus size={14} />
            New list
          </button>
        </div>
        {creatingNew && (
        <ShoppingListCreateForm
          onConfirm={(name, starred) => {
            onCreateList(name, starred); // creates the list in App state
            // then immediately add item to the newly created list
          }}
          onClose={() => setCreatingNew(false)}
        />
      )}
      </div>
    </div>
  );
}