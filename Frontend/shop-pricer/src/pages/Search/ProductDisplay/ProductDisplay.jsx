import React, { useEffect, useRef, useState } from "react";
import {Trash2, SquarePen} from 'lucide-react';

const ProductDisplay = ({item, setCart}) => {
    const [showEdit, setShowEdit] = useState(false);
    const [details, setDetails] = useState(item.details);
    const [category, setCategory] = useState(item.category);
    const detailsRef = useRef(null);
    useEffect(() => {
        if (showEdit && detailsRef.current) {
            const el = detailsRef.current;
            const length = el.value.length;
            el.focus();
            el.setSelectionRange(length, length);
        }
    }, [showEdit]);
    const editProduct = () => {
        setShowEdit(!showEdit);
    }
    const saveProduct = () =>{
        setCart(prev => prev.map(i =>
        i.id === item.id
            ? { ...i, details: details, label: details ? `${category} — ${details}` : category }
            : i
        ));
        setShowEdit(false);
    }
    return(<div>
        <div key={item.id} className="bg-white border border-stone-200 rounded-xl p-5 flex items-center justify-between">
            <div>
                <p className="font-semibold text-stone-800">{item.label}</p>
                <p className="text-sm text-stone-400 mt-0.5">{item.category}</p>
            </div>
            <div>
            <button
                onClick={editProduct}
                className="transition-colors hover:text-blue-400 text-stone-300 mr-1"
            >
                <SquarePen size={18}/>
            </button>
            <button
                onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))}
                className="text-stone-300 hover:text-red-400 transition-colors"
            >
                <Trash2 size={20} />
            </button>
            </div>
        </div>
        <div className={`grid relative transition-all duration-300 ease-in-out ${showEdit ? 'grid-rows-[1fr] opacity-100 mt-0.5' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-l border-t border-stone-200 rotate-45 rounded-tl-lg" />
            <div className="overflow-hidden">
                    <div className="rounded-xl bg-white border border-stone-200 p-4 flex flex-col gap-3 shadow-sm">
                        <div className="flex flex-row items-center">
                            <p className="text-stone-400 text-sm w-20 shrink-0">Category</p>
                            <textarea
                                value={category}
                                readOnly
                                disabled
                                rows={1}
                                className="w-full px-3 py-2 rounded-lg border border-stone-100 bg-stone-50 focus:outline-none text-stone-400 resize-none text-sm cursor-not-allowed"
                            />
                        </div>
                        <div className="flex flex-row items-center">
                            <p className="text-stone-400 text-sm w-20 shrink-0">Details</p>
                            <textarea
                                value={details}
                                onChange={e => setDetails(e.target.value)}
                                placeholder={`e.g. "прясно мляко 3%"`}
                                rows={1}
                                className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:border-stone-400 focus:bg-stone-50 text-stone-700 resize-none text-sm transition-colors"
                                ref={detailsRef}
                            />
                        </div>
                        <div className="flex flex-row justify-end gap-2 pt-1 border-t border-stone-100">
                            <button
                                onClick={() => setShowEdit(false)}
                                className="text-stone-400 hover:text-stone-600 rounded-lg border border-stone-200 hover:border-stone-300 py-1.5 px-4 text-sm font-medium transition-all"
                            >
                                Close
                            </button>
                            <button
                                onClick={saveProduct}
                                className="bg-stone-800 hover:bg-stone-700 active:bg-stone-900 text-white rounded-lg px-4 py-1.5 text-sm font-medium transition-all"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDisplay
