import { Command } from 'cmdk'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react';
import { createPortal } from 'react-dom'


export default function SearchSelect({ options, value, onChange, placeholder }) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({});
    const dropdownRef = useRef(null)
    const triggerRef = useRef(null);
    

    useEffect(() => {
        if (!open) return
        const update = () => {
            const rect = triggerRef.current?.getBoundingClientRect()
            if (rect) setPos({ top: rect.bottom , left: rect.left, width: rect.width })
        }
        update()
        window.addEventListener('scroll', update, true)
        return () => window.removeEventListener('scroll', update, true)
    }, [open])

    useEffect(() => {
        if (!open) return
        const handler = (e) => {
            if (!dropdownRef.current?.contains(e.target) && !triggerRef.current?.contains(e.target)) {
            setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                ref={triggerRef}
                className="w-full px-2.5 py-2.5 flex items-center text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 text-left text-stone-700 bg-white"
            >
                {value || placeholder}
                <ChevronDown className={`ml-auto transition-transform duration-200 ${open ? 'rotate-180' : ''}`}  size={14}/>
            </button>

        {open && createPortal(
            <div 
                className="fixed z-10 w-full mt-1 bg-white border border-stone-200 rounded-xl shadow-md overflow-hidden"
                style={{
                    top: pos.top,
                    left: pos.left,
                    width: pos.width
                }}
                ref={dropdownRef}
            >
            <Command>
                <Command.Input
                placeholder="Search..."
                className="w-full px-3 py-2 text-sm border-b border-stone-200 outline-none"
                />
                <Command.List className="max-h-[500px] overflow-y-auto p-1">
                <Command.Item
                    onSelect={() => { onChange(""); setOpen(false) }}
                    className="px-2 py-1.5 text-sm rounded-lg cursor-pointer hover:bg-stone-100"
                >
                    {placeholder}
                </Command.Item>
                {options.map(opt => (
                    <Command.Item
                    key={opt}
                    onSelect={() => { onChange(opt); setOpen(false) }}
                    className="px-2 py-1.5 text-sm rounded-lg cursor-pointer hover:bg-stone-100"
                    >
                    {opt}
                    </Command.Item>
                ))}
                </Command.List>
            </Command>
            </div>,
            document.body
        )}
        </div>
    )
}