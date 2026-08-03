import { Plus } from "lucide-react";

interface SideBarProps {
    tabs: string[];
    selected: string | null;
    onChange: (value: string) => void
    onCreate: (value: string) => void
}

export default function SideBar({tabs, selected, onChange, onCreate}: SideBarProps){
    return (
        <div className="h-full">
            <nav className="w-full h-full flex flex-col gap-2 p-2">
                <div className="flex flex-col gap-1">
                    {tabs.map((t) => (
                        <button
                        key={t}
                        onClick={() => onChange(t)}
                        className={`text-left px-3 py-2 rounded ${
                            selected === t ? "bg-gray-200" : "hover:bg-gray-100"
                        }`}
                        >
                        {t}
                        </button>
                    ))}
                </div>
                <div className="mt-auto mb-4">
                    <button className="flex flex-row items-center gap-1 text-sm rounded-lg border px-3 py-2.5">
                        Create new <Plus size={14}/>
                    </button>
                </div>
            </nav>
        </div>
    );
}