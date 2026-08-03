import { Command } from 'cmdk'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { createPortal } from 'react-dom'

/**
 * ComboSelect
 *
 * Supports two option shapes — no configuration needed:
 *   - string[]                        e.g. ["Red", "Blue", "Green"]
 *   - { label: string, value: any }[] e.g. [{ label: "Biggest discount", value: "discount" }]
 *
 * Props:
 *   options      string[] | { label, value }[]   List of options
 *   value        string | any                    Currently selected value
 *   onChange     (value) => void                 Called with the option's value (or string)
 *   placeholder  string                          Shown when nothing is selected
 */
export default function ComboSelect({ options = [], value, onChange, placeholder = 'Select...' }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos]   = useState({})
  const dropdownRef     = useRef(null)
  const triggerRef      = useRef(null)

  // Normalise every option to { label, value } internally
  const normalised = options.map(opt =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  )

  // Resolve display label for the current value
  const selectedLabel =
    normalised.find(opt => opt.value === value)?.label ?? placeholder

  // ── Position the portal dropdown under the trigger ────────────────────────
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

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    const handler = e => {
      if (
        !dropdownRef.current?.contains(e.target) &&
        !triggerRef.current?.contains(e.target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleSelect = val => {
    onChange(val)
    setOpen(false)
  }

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        ref={triggerRef}
        onClick={() => setOpen(prev => !prev)}
        className="w-full px-2.5 py-2.5 flex items-center text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 text-left text-stone-700 bg-white"
      >
        <span className="flex-1 truncate">{selectedLabel}</span>
        <ChevronDown
          size={14}
          className={`ml-2 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Portal dropdown */}
      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[60] mt-1 bg-white border border-stone-200 rounded-xl shadow-md overflow-hidden"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            <Command>
              <Command.Input
                placeholder="Search..."
                className="w-full px-3 py-2 text-sm border-b border-stone-200 outline-none"
              />
              <Command.List className="max-h-60 overflow-y-auto p-1">
                {/* Clear / placeholder option */}
                <Command.Item
                  onSelect={() => handleSelect('')}
                  className="px-2 py-1.5 text-sm rounded-lg cursor-pointer text-stone-400 hover:bg-stone-100"
                >
                  {placeholder}
                </Command.Item>

                {normalised.map(opt => (
                  <Command.Item
                    key={String(opt.value)}
                    value={opt.label}          // cmdk filters on this field
                    onSelect={() => handleSelect(opt.value)}
                    className="px-2 py-1.5 text-sm rounded-lg cursor-pointer hover:bg-stone-100 data-[selected=true]:bg-stone-100"
                  >
                    {opt.label}
                  </Command.Item>
                ))}

                <Command.Empty className="px-2 py-3 text-xs text-center text-stone-400">
                  No results found.
                </Command.Empty>
              </Command.List>
            </Command>
          </div>,
          document.body
        )}
    </div>
  )
}