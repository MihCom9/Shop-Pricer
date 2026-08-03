//@ts-nocheck
import { useState } from "react";
import { Pencil, Plus, Star, Upload } from "lucide-react";
import type { ShoppingListStructure } from "../../types";
import useImportShoppingList from "./useImportShoppingList";

export default function ShoppingListCreateForm({ onConfirm, onClose, initialName = "", initialStarred = false }) {
    const [name, setName] = useState(initialName);
    const [starred, setStarred] = useState(initialStarred);
    const isEditing = initialName !== "";

    const handleSubmit = () => {
        onConfirm(name, starred);
        onClose();
    };

    const handleImport = (list: ShoppingListStructure) => {
        // Add to state, save to DB, etc.
        onConfirm(list.name, list.starred, list.items);
        console.log("Imported list:", list);
        onClose();
    };

    const { fileInputRef, triggerFileInput, handleFileChange } = useImportShoppingList(handleImport);


    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
                style={{ fontFamily: "Georgia, serif" }}
            >
                {/* Header */}
                <div className="mb-5">
                    <h2 className="text-xl font-bold text-stone-800">{isEditing?"Edit Shopping List" : "New Shopping List"}</h2>
                    <p className="text-stone-400 text-sm mt-0.5">
                        {isEditing? "Update the name or starred status." : "Give your list a name and optionally star it."}
                    </p>
                </div>

                {/* Name input */}
                <div className="mb-4">
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-1.5">
                        List Name
                    </label>
                    <input
                        autoFocus
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSubmit();
                            if (e.key === "Escape") onClose();
                        }}
                        placeholder="e.g. Weekly Groceries"
                        className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-stone-800 text-sm focus:outline-none focus:border-stone-400 transition-colors placeholder:text-stone-300"
                    />
                </div>

                {/* Star toggle */}
                <div className="mb-6">
                    <button
                        onClick={() => setStarred((s) => !s)}
                        className="flex items-center gap-3 group"
                    >
                        <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                starred
                                    ? "bg-amber-400 border-amber-400"
                                    : "border-stone-300 group-hover:border-stone-400"
                            }`}
                        >
                            {starred && <Star size={11} fill="white" color="white" />}
                        </div>
                        <div className="text-left">
                            <span className="text-sm font-semibold text-stone-700">
                                Star this list
                            </span>
                            <span className="block text-xs text-stone-400">
                                Starred lists appear at the top
                            </span>
                        </div>
                    </button>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-end gap-2">
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json,application/json"
                            style={{ display: "none" }}
                            onChange={handleFileChange}
                        />
                        <button onClick={triggerFileInput} className=" flex gap-1 items-center px-4 py-2.5 rounded-xl border border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-700 text-sm font-medium transition-all">
                            <Upload size={15} /> Import List
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-700 text-sm font-medium transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="bg-stone-800 hover:bg-stone-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all text-sm font-medium"
                    >
                        {isEditing ? <><Pencil size={15} /> Save</> : <><Plus size={15} /> Create</>}
                    </button>
                </div>
            </div>
        </div>
    );
}