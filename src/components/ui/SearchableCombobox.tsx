"use client"

import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CheckIcon, ChevronDownIcon, SearchIcon, Loader2 } from "lucide-react"

interface Option {
  value: string
  label: string
}

interface SearchableComboboxProps {
  value: string
  onValueChange: (value: string) => void
  options: Option[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  triggerClassName?: string
  contentClassName?: string
  align?: "start" | "center" | "end"
  side?: "bottom" | "top"
  disabled?: boolean
  loading?: boolean
}

export function SearchableCombobox({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  className,
  triggerClassName,
  contentClassName,
  align = "start",
  side = "bottom",
  disabled = false,
  loading = false,
}: SearchableComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  const selectedOption = React.useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  )

  const filtered = React.useMemo(() => {
    if (!search) return options
    const q = search.toLowerCase()
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    )
  }, [options, search])

  React.useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) {
      setSearch("")
      setHighlightedIndex(-1)
    }
    setOpen(newOpen)
  }

  function scrollToItem(index: number) {
    if (!listRef.current) return
    const item = listRef.current.children[index] as HTMLElement
    item?.scrollIntoView({ block: "nearest" })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    const key = e.key
    if (key === "ArrowDown") {
      e.preventDefault()
      setHighlightedIndex((prev) => {
        const next = prev < filtered.length - 1 ? prev + 1 : 0
        scrollToItem(next)
        return next
      })
    } else if (key === "ArrowUp") {
      e.preventDefault()
      setHighlightedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : filtered.length - 1
        scrollToItem(next)
        return next
      })
    } else if (key === "Enter" && highlightedIndex >= 0 && highlightedIndex < filtered.length) {
      e.preventDefault()
      const opt = filtered[highlightedIndex]
      onValueChange(opt.value)
      setOpen(false)
    }
  }

  return (
    <div className={cn("relative", className)} onKeyDown={handleKeyDown}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          className={cn(
            "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs whitespace-nowrap transition-colors outline-none select-none",
            "hover:border-slate-300 focus-visible:border-slate-400",
            "dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:focus-visible:border-slate-500",
            "data-disabled:cursor-not-allowed data-disabled:opacity-50",
            !selectedOption && "text-slate-400 dark:text-slate-500",
            triggerClassName
          )}
          aria-label={placeholder}
          disabled={disabled}
        >
          <span className="flex-1 truncate text-left">
            {selectedOption?.label || placeholder}
          </span>
          {loading ? (
            <Loader2 className="size-3.5 shrink-0 text-slate-400 dark:text-slate-500 animate-spin" />
          ) : (
            <ChevronDownIcon className="size-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
          )}
        </PopoverTrigger>
        <PopoverContent
          align={align}
          side={side}
          sideOffset={4}
          className={cn("min-w-[280px] p-0", contentClassName)}
        >
          <div className="flex items-center border-b border-slate-200 px-3 dark:border-slate-700">
            <SearchIcon className="mr-2 size-4 shrink-0 text-slate-400 dark:text-slate-500" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setHighlightedIndex(0)
              }}
              placeholder={searchPlaceholder}
              className="flex h-9 w-full bg-transparent py-2 text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 dark:text-slate-200"
              aria-label={searchPlaceholder}
            />
          </div>
          <div
            ref={listRef}
            className="overflow-y-auto py-1 scrollbar-thin"
            style={{ maxHeight: 300 }}
          >
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                {emptyMessage}
              </div>
            ) : (
              filtered.map((opt, i) => {
                const selected = opt.value === value
                const highlighted = i === highlightedIndex
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={selected}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      onValueChange(opt.value)
                      setOpen(false)
                    }}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    className={cn(
                      "relative flex w-full cursor-default items-center gap-2 px-3 py-2 text-sm outline-hidden select-none transition-colors",
                      highlighted
                        ? "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100"
                        : "text-slate-600 dark:text-slate-300",
                      selected && !highlighted && "text-slate-900 dark:text-slate-100"
                    )}
                  >
                    <span className="flex-1 truncate text-left">{opt.label}</span>
                    {selected && (
                      <CheckIcon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                )
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
