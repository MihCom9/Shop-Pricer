import React, { useEffect, useRef, useState } from "react";
import {Trash2, SquarePen} from 'lucide-react';

const WEIGHT_UNITS = ['гр', 'кг', 'мл', 'л'];


const formatSubtitle = (category, pieces, weightAmount, weightUnit) => {
  const parts = [];
  if (pieces > 1) parts.push(`${pieces}бр`);
  if (weightUnit && parseFloat(weightAmount) > 0) parts.push(`${weightAmount} ${weightUnit}`);
  return parts.length ? `${category} · ${parts.join(' · ')}` : category;
};

const ProductDisplay = ({item, setCart}) => {
    const [showEdit, setShowEdit] = useState(false);
    const [details, setDetails] = useState(item.details);
    const [category] = useState(item.category);
    const [pieces, setPieces] = useState(item.pieces ?? 1);
    const [weightUnit, setWeightUnit] = useState(item.weightUnit ?? null);
    const [weightAmount, setWeightAmount] = useState(item.weightAmount ? String(item.weightAmount) : '');
    const detailsRef = useRef(null);

    useEffect(() => {
        if (showEdit && detailsRef.current) {
            const el = detailsRef.current;
            const length = el.value.length;
            el.focus();
            el.setSelectionRange(length, length);
        }
    }, [showEdit]);

    const saveProduct = () => {
        const labelParts = [];
        if (pieces > 1) labelParts.push(`${pieces}бр`);
        if (weightUnit && parseFloat(weightAmount) > 0) labelParts.push(`${weightAmount} ${weightUnit}`);
        const label = details
            ? `${category} — ${details}${labelParts.length ? ' · ' + labelParts.join(' · ') : ''}`
            : `${category}${labelParts.length ? ' · ' + labelParts.join(' · ') : ''}`;

        setCart(prev => prev.map(i =>
            i.id === item.id
                ? { ...i, details, pieces, weightAmount: weightAmount ? parseFloat(weightAmount) : null, weightUnit, label }
                : i
        ));
        setShowEdit(false);
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

    const subtitle = formatSubtitle(item.category, item.pieces ?? 1, item.weightAmount ? String(item.weightAmount) : '', item.weightUnit ?? null);

    return (
        <div>
            <div className="bg-white border border-stone-200 rounded-xl p-5 flex items-center justify-between">
                <div>
                    <p className="font-semibold text-stone-800">{item.label}</p>
                    <p className="text-sm text-stone-400 mt-0.5">{subtitle}</p>
                </div>
                <div>
                    <button
                        onClick={() => setShowEdit(!showEdit)}
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

                        {/* Quantity + size row */}
                        <div className="flex items-start gap-3">
                            {/* бр */}
                            <div className="flex flex-col gap-1">
                                <p className="text-stone-400 text-xs">Quantity</p>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setPieces(p => Math.max(1, p - 1))}
                                        className="w-7 h-7 rounded-lg border border-stone-200 hover:border-stone-400 text-stone-600 font-bold flex items-center justify-center transition-colors text-sm"
                                    >
                                        −
                                    </button>
                                    <span className="w-6 text-center text-stone-800 font-medium text-sm">{pieces}</span>
                                    <button
                                        type="button"
                                        onClick={() => setPieces(p => p + 1)}
                                        className="w-7 h-7 rounded-lg border border-stone-200 hover:border-stone-400 text-stone-600 font-bold flex items-center justify-center transition-colors text-sm"
                                    >
                                        +
                                    </button>
                                    <span className="text-stone-400 text-xs ml-0.5">бр</span>
                                </div>
                            </div>

                            <span className="text-stone-200 mt-5">×</span>

                            {/* Weight/volume */}
                            <div className="flex flex-col gap-1 flex-1">
                                <p className="text-stone-400 text-xs">Size <span className="text-stone-300">(optional)</span></p>
                                <div className="flex gap-1">
                                    {WEIGHT_UNITS.map(u => (
                                        <button
                                            key={u}
                                            type="button"
                                            onClick={() => toggleWeightUnit(u)}
                                            className={`flex-1 py-1 rounded-lg text-xs font-medium border transition-all ${
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
                                        <span className="text-stone-400 text-xs">{weightUnit}</span>
                                    </div>
                                )}
                            </div>
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

export default ProductDisplay;
