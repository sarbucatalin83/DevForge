import { createContext, useContext, useState } from 'react'
import type { ContentFilter } from '@/types/index'

type FilterContextValue = {
  filter: ContentFilter
  setFilter: (filter: ContentFilter) => void
}

const FilterContext = createContext<FilterContextValue | null>(null)

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filter, setFilter] = useState<ContentFilter>({})

  return (
    <FilterContext.Provider value={{ filter, setFilter }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useFilterContext(): FilterContextValue {
  const ctx = useContext(FilterContext)
  if (!ctx) throw new Error('useFilterContext must be used within a FilterProvider')
  return ctx
}
