import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { createPortal } from 'react-dom'

/**
 * RadioSelect
 *
 * A dropdown select with radio-style indicators, no search input.
 * Best for short fixed lists where the current selection should be obvious.
 *
 * Supports two option shapes:
 *   - string[]                        e.g. ["Red", "Blue"]
 *   - { label: string, value: any }[] e.g. [{ label: "Biggest discount", value: "discount" }]
 *
 * Props:
 *   options   string[] | { label, value }[]   List of options
 *   value     any                             Currently selected value
 *   onChange  (value) => void                 Called with selected value
 *   label     string                          (optional) Small label above the trigger
 */
export default function RadioSelect({ options = [], value, onChange, label }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos]   = useState({})
  const dropdownRef     = useRef(null)
  const triggerRef      = useRef(null)

  const normalised = options.map(opt =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  )

  const selectedLabel = normalised.find(opt => opt.value === value)?.label || label

  useEffect(() => {
    if (!open) return
    const update = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (rect) setPos({ top: rect.bottom, left: rect.left, width: rect.width })
    }
    update()
    window.addEventListener('scroll', update, true)
    return () => window.removeEventListener('scroll', update, true)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = e => {
      if (
        !dropdownRef.current?.contains(e.target) &&
        !triggerRef.current?.contains(e.target)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen(prev => !prev)}
        className="w-full px-2.5 py-2.5 flex items-center text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 text-left bg-white"
      >
        <span className="flex-1 truncate text-stone-700">{selectedLabel}</span>
        <ChevronDown
          size={14}
          className={`ml-2 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-10 mt-1 bg-white border border-stone-200 rounded-xl shadow-md overflow-hidden"
          style={{ top: pos.top, left: pos.left, width: pos.width }}
        >
          <ul className="max-h-60 overflow-y-auto p-1">
            {normalised.map(opt => {
              const selected = opt.value === value
              return (
                <li
                  key={String(opt.value)}
                  onClick={() => { onChange(opt.value); setOpen(false) }}
                  className="flex items-center gap-2.5 px-2 py-1.5 text-sm rounded-lg cursor-pointer hover:bg-stone-100"
                >
                  {/* Radio indicator */}
                  <span className={`w-4 h-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selected
                      ? 'border-stone-700'
                      : 'border-stone-300'
                  }`}>
                    {selected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-700" />
                    )}
                  </span>
                  <span className={selected ? 'text-stone-800 font-medium' : 'text-stone-600'}>
                    {opt.label}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>,
        document.body
      )}
    </div>
  )
}