import { useEffect, useRef, useState } from "react";
import { ShoppingCart, Plus, Star, Trash2, ChevronRight, ListChecks, SquarePen, Download } from "lucide-react";
import ShoppingList from "./ShoppingList/ShoppingList";
import type { ShoppingListStructure, SearchRequestItem } from "../../types";
import ShoppingListCreateForm from "./ShoppingListCreateForm";
import type { StoreResult } from "./types";

interface SearchPageProps {
    shoppingLists: ShoppingListStructure[];
    setShoppingLists: React.Dispatch<React.SetStateAction<ShoppingListStructure[]>>;
    selectedListId: string | null;
    setSelectedListId: React.Dispatch<React.SetStateAction<string | null>>;
}

function generateId() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function SearchPage({
    shoppingLists,
    setShoppingLists,
    selectedListId,
    setSelectedListId,
}: SearchPageProps) {
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState("");
    const [createListStart, setCreateListStart] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [editList, setEditList] = useState<string | null>(null);

    const selectedList = shoppingLists.find((l) => l.id === selectedListId) ?? null;

    const setCartForSelected = (
        updater: React.SetStateAction<SearchRequestItem[]>
    ) => {
        if (!selectedListId) return;
        setShoppingLists((prev) =>
            prev.map((list) => {
                if (list.id !== selectedListId) return list;
                const newItems =
                    typeof updater === "function" ? updater(list.items) : updater;
                return { ...list, items: newItems };
            })
        );
    };

    const createList = (name: string, starred: boolean, items?: SearchRequestItem[]) => {
        const newList: ShoppingListStructure = {
            id: generateId(),
            name: name.trim()? name :`List ${shoppingLists.length + 1}`,
            items: items?? [],
            starred: starred,
            createdAt: new Date().toISOString(),
            lastResults: null,
            lastOriginalResults: null,
            lastResultsAt: null
        };
        setShoppingLists((prev) => [newList, ...prev]);
        selectList(newList.id);
    };

    const onEditList = (name: string, starred: boolean) => {
        if(!editList) return;
        setShoppingLists((prev) => prev.map((list) => editList === list.id? {...list, name: name.trim() || list.name, starred: starred}: list ));
        setEditList(null);
    } 

    const deleteList = (id: string) => {
        setShoppingLists((prev) => prev.filter((l) => l.id !== id));
        if (selectedListId === id) selectList(null);
        setDeleteConfirmId(null);
    };

    const toggleStar = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setShoppingLists((prev) =>
            prev.map((l) => (l.id === id ? { ...l, starred: !l.starred } : l))
        );
    };

    const startRename = (list: ShoppingListStructure, e: React.MouseEvent) => {
        e.stopPropagation();
        setRenamingId(list.id);
        setRenameValue(list.name);
    };

    const commitRename = (id: string) => {
        const trimmed = renameValue.trim();
        if (trimmed) {
            setShoppingLists((prev) =>
                prev.map((l) => (l.id === id ? { ...l, name: trimmed } : l))
            );
        }
        setRenamingId(null);
    };

    const selectList = (id: string | null) => {
        setSelectedListId(id);
        const url = new URL(window.location.href);
        if (id) {
            url.searchParams.set("list", id);
        } else {
            url.searchParams.delete("list");
        }
        window.history.pushState({}, "", url);
    };

    const exportListAsFile = (list: ShoppingListStructure): void => {
        if(!list) return;
        const fileName = list.name.replace(/[/\\?%*:|"<>]/g, "-");
        const { lastResults, lastOriginalResults, lastResultsAt, ...sendList } = list;
        const json =  JSON.stringify(sendList, null, 2);
        const blob=new Blob([json],{type:'application/json'});
        const href = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = href;
        link.download = fileName + ".json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    }

    const sorted = [...shoppingLists].sort((a, b) => {
        if (a.starred !== b.starred) return a.starred ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const setResultsForSelected = (results: StoreResult[] | null, original: StoreResult[] | null) => {
        if (!selectedListId) return;
        setShoppingLists(prev => prev.map(list =>
            list.id !== selectedListId ? list : {
                ...list,
                lastResults: results,
                lastOriginalResults: original,
                lastResultsAt: new Date().toISOString()
            }
        ));
    };


    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("list");
        if (id && shoppingLists.some(l => l.id === id)) {
            setSelectedListId(id);
        }
    }, []);

    useEffect(() => {
        const onPop = () => {
            const params = new URLSearchParams(window.location.search);
            const id = params.get("list");
            setSelectedListId(id ?? null);
        };
        window.addEventListener("popstate", onPop);
        return () => window.removeEventListener("popstate", onPop);
    }, []);

    if (selectedList) {
        return (
            <div>
                {/* Back bar */}
                <div
                    className="bg-white border-b border-stone-200 sticky top-0 z-20"
                    style={{ fontFamily: "Georgia, serif" }}
                >
                    <div className="max-w-2xl mx-auto px-8 py-3 flex items-center gap-3">
                        <button
                            onClick={() => selectList(null)}
                            className="text-stone-500 hover:text-stone-800 text-sm flex items-center gap-1 transition-colors"
                        >
                            <ChevronRight size={14} className="rotate-180" />
                            My Lists
                        </button>
                        <span className="text-stone-300">/</span>
                        <span className="text-stone-700 text-sm font-medium">
                            {selectedList.name}
                        </span>

                        <div className="ml-auto">
                            <button
                                onClick={() => exportListAsFile(selectedList)}
                                className=" border rounded-lg text-stone-400 hover:text-stone-600 hover:border-stone-500 text-sm flex 
                                    px-2 py-1 items-center gap-1.5 transition-colors"
                            >
                                <Download size={14} /> Export
                            </button>
                        </div>
                    </div>
                </div>
                <ShoppingList
                    cart={selectedList.items}
                    setCart={setCartForSelected}
                    lastResults={selectedList.lastResults}
                    originalResults={selectedList.lastOriginalResults}
                    lastResultsAt={selectedList.lastResultsAt}
                    setLastResults={setResultsForSelected}
                />
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-stone-50 p-8 relative"
            style={{ fontFamily: "Georgia, serif" }}
        >
            {createListStart === true &&
                    <ShoppingListCreateForm 
                        onConfirm={createList} 
                        onClose={()=>{setCreateListStart(false)}}
                    />
            }

            {editList && (
                <ShoppingListCreateForm 
                    onConfirm={onEditList} 
                    onClose={() => setEditList(null)}
                    initialName={shoppingLists.find(l => l.id === editList)?.name ?? ""}
                    initialStarred={shoppingLists.find(l => l.id === editList)?.starred ?? false}
                />
            )}

            {deleteConfirmId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                    onClick={() => setDeleteConfirmId(null)}>
                    <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full"
                        onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-stone-800 mb-1">Delete List?</h2>
                        <p className="text-stone-400 text-sm mb-6">
                            This will permanently delete "
                            {shoppingLists.find(l => l.id === deleteConfirmId)?.name}". 
                            This cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setDeleteConfirmId(null)}
                                className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-500 hover:border-stone-400 text-sm font-medium transition-all">
                                Cancel
                            </button>
                            <button onClick={() => deleteList(deleteConfirmId)}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="bg-white border border-stone-200 rounded-2xl shadow-sm p-8 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-stone-800">
                                My Shopping Lists
                            </h1>
                            <p className="text-stone-400 mt-1">
                                {shoppingLists.length === 0
                                    ? "Create a list to get started"
                                    : `${shoppingLists.length} list${shoppingLists.length !== 1 ? "s" : ""}`}
                            </p>
                        </div>
                        <button
                            onClick={() => setCreateListStart(true)}
                            className="bg-stone-800 hover:bg-stone-700 text-white px-5 py-3 rounded-xl flex items-center gap-2 transition-all text-sm font-medium"
                        >
                            <Plus size={18} /> New List
                        </button>
                    </div>
                </div>

                {/* Lists */}
                {shoppingLists.length === 0 ? (
                    <div className="bg-white border border-stone-200 rounded-2xl p-16 text-center">
                        <ListChecks className="mx-auto text-stone-200 mb-4" size={56} />
                        <p className="text-stone-400 text-lg">No lists yet</p>
                        <p className="text-stone-300 text-sm mt-1 mb-6">
                            Create your first shopping list to compare store prices
                        </p>
                        <button
                            onClick={() => setCreateListStart(true)}
                            className="bg-stone-800 hover:bg-stone-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all text-sm font-medium mx-auto"
                        >
                            <Plus size={16} /> Create a List
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sorted.map((list) => (
                            <div
                                key={list.id}
                                onClick={() => selectList(list.id)}
                                className="bg-white border border-stone-200 rounded-2xl px-6 py-5 flex items-center gap-4 cursor-pointer hover:border-stone-400 hover:shadow-sm transition-all group"
                            >
                                {/* Icon */}
                                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
                                    <ShoppingCart size={18} className="text-stone-500" />
                                </div>

                                {/* Name + meta */}
                                <div className="flex-1 min-w-0">
                                    {renamingId === list.id ? (
                                        <input
                                            autoFocus
                                            value={renameValue}
                                            onChange={(e) => setRenameValue(e.target.value)}
                                            onBlur={() => commitRename(list.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") commitRename(list.id);
                                                if (e.key === "Escape") setRenamingId(null);
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="border border-stone-300 rounded-lg px-3 py-1 text-stone-800 text-sm focus:outline-none focus:border-stone-500 w-full max-w-xs"
                                        />
                                    ) : (
                                        <p
                                            className="font-semibold text-stone-800 truncate"
                                            onDoubleClick={(e) => startRename(list, e)}
                                            title="Double-click to rename"
                                        >
                                            {list.name}
                                        </p>
                                    )}
                                    <p className="text-stone-400 text-sm mt-0.5">
                                        {list.items.length === 0
                                            ? "Empty"
                                            : `${list.items.length} item${list.items.length !== 1 ? "s" : ""}`}
                                        {" · "}
                                        {new Date(list.createdAt).toLocaleDateString("en-GB", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex">
                                    <button
                                        onClick={(e) => toggleStar(list.id, e)}
                                        className={`p-2 rounded-lg transition-colors ${
                                            list.starred
                                                ? "text-amber-500 hover:text-amber-600"
                                                : "text-stone-300 hover:text-stone-500"
                                        }`}
                                        title={list.starred ? "Unstar" : "Star"}
                                    >
                                        <Star
                                            size={16}
                                            fill={list.starred ? "currentColor" : "none"}
                                        />
                                    </button>
                                    <button
                                        onClick={(e) => {e.stopPropagation(); setDeleteConfirmId(list.id);}}
                                        className="p-2 rounded-lg text-stone-300 hover:text-red-500 transition-colors"
                                        title="Delete list"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {setEditList(list.id); e.stopPropagation();}}
                                        className="p-2 rounded-lg text-stone-300 transition-colors hover:text-blue-400"
                                        title="Edit list"
                                    >
                                        <SquarePen size={16} />
                                    </button>
                                </div>

                                <ChevronRight
                                    size={16}
                                    className="text-stone-300 group-hover:text-stone-500 transition-colors flex-shrink-0"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}