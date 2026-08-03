import { useState } from "react";
import SideBar from "./SideBar";

//@ts-nocheck
const TABLES: string[] = [
    "products",
    "stores",
    "product"
]
export default function AdminPage ({}){
    const [selected, setSelected] = useState<string | null>(null);
    const [tables, setTables] = useState<string[]>(TABLES);
    return (
        <div className="flex h-full">
            <aside className="h-full w-64 min-w-48 max-w-xs border-r shrink-0">
                <SideBar tabs={tables} 
                    selected={selected} 
                    onChange={(value: string) => setSelected(value)}
                    onCreate={(value: string) => setTables(prev => [...prev, value])}
                />
            </aside>
            <main className="flex-1 overflow-auto"></main>
        </div>
    );
}