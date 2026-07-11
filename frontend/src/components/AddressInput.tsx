import { useState, useRef, useEffect, useCallback } from 'react'
import { Input, cn } from '@/components/ui'
import { MapPin, Loader2 } from 'lucide-react'

const OLA_API_KEY = import.meta.env.VITE_OLA_MAPS_API_KEY as string

interface OlaPrediction {
  description: string
  place_id: string
  structured_formatting?: {
    main_text: string
    secondary_text: string
  }
  geometry?: {
    location: {
      lat: number
      lng: number
    }
  }
  types?: string[]
}

interface Suggestion {
  label: string
  sublabel: string
  lat?: number
  lng?: number
  place_id: string
}

interface AddressInputProps {
  value: string
  onChange: (value: string, lat?: number, lng?: number) => void
  onBlur?: () => void
  placeholder?: string
  className?: string
  id?: string
  /** If true, extracts a short area name instead of the full address */
  shortMode?: boolean
}

export function AddressInput({
  value,
  onChange,
  onBlur,
  placeholder = 'Search your area or locality',
  className,
  id,
  shortMode = true,
}: AddressInputProps) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchDetails = useCallback(async (placeId: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const res = await fetch(
        `https://api.olamaps.io/places/v1/details?place_id=${encodeURIComponent(placeId)}&api_key=${OLA_API_KEY}`,
        { headers: { 'X-Request-Id': crypto.randomUUID() } }
      )
      const data = await res.json()
      const loc = data?.result?.geometry?.location
      if (loc) return { lat: loc.lat, lng: loc.lng }
      return null
    } catch {
      return null
    }
  }, [])

  const fetchSuggestions = useCallback((q: string) => {
    if (q.length < 3) {
      setSuggestions([])
      setOpen(false)
      return
    }
    setLoading(true)

    // Bias towards Pune, India
    const url = `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(q)}&api_key=${OLA_API_KEY}&location=18.5204,73.8567&radius=50000&language=en`

    fetch(url, { headers: { 'X-Request-Id': crypto.randomUUID() } })
      .then((r) => r.json())
      .then((data: { predictions?: OlaPrediction[]; status?: string }) => {
        const preds = data.predictions ?? []
        const mapped: Suggestion[] = preds.map((p) => {
          const main = p.structured_formatting?.main_text ?? p.description.split(',')[0]
          const sub = p.structured_formatting?.secondary_text ??
            p.description.split(',').slice(1).join(',').trim()
          return {
            label: shortMode ? main : p.description,
            sublabel: sub,
            lat: p.geometry?.location?.lat,
            lng: p.geometry?.location?.lng,
            place_id: p.place_id,
          }
        })
        setSuggestions(mapped)
        setOpen(mapped.length > 0)
        setSelectedIndex(-1)
      })
      .catch(() => {
        setSuggestions([])
        setOpen(false)
      })
      .finally(() => setLoading(false))
  }, [shortMode])

  const handleChange = (val: string) => {
    setQuery(val)
    onChange(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => fetchSuggestions(val), 300)
  }

  const select = async (s: Suggestion) => {
    setQuery(s.label)
    setOpen(false)

    let lat = s.lat
    let lng = s.lng

    // If autocomplete didn't include coords, fetch from place details
    if ((!lat || !lng) && s.place_id) {
      const coords = await fetchDetails(s.place_id)
      if (coords) {
        lat = coords.lat
        lng = coords.lng
      }
    }

    onChange(s.label, lat, lng)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      select(suggestions[selectedIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={ref} className="relative">
      <Input
        id={id}
        type="text"
        value={query}
        placeholder={placeholder}
        className={cn(className, open && suggestions.length > 0 && 'rounded-b-none')}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => { if (suggestions.length > 0) setOpen(true) }}
        onBlur={onBlur}
        onKeyDown={handleKey}
        autoComplete="off"
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </div>
      )}
      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 max-h-64 w-full overflow-y-auto rounded-b-lg border border-t-0 border-border bg-card shadow-lg"
        >
          {suggestions.map((s, i) => (
            <li
              key={s.place_id}
              role="option"
              aria-selected={i === selectedIndex}
              className={cn(
                'flex items-start gap-2 px-3 py-2.5 text-sm cursor-pointer transition-colors',
                i === selectedIndex
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50',
              )}
              onMouseDown={() => select(s)}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary/70" aria-hidden />
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{s.label}</p>
                {s.sublabel && (
                  <p className="truncate text-xs text-muted-foreground">{s.sublabel}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
