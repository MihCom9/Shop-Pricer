import React from "react";
import {Trash2, SquarePen} from 'lucide-react';

const ProductDisplay = ({item, setCart}) => {
    const editProduct = () => {
        
    }
    return(
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
    );
};

export default ProductDisplay
