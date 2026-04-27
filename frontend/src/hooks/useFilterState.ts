import { useFilterContext } from '@/context/FilterContext'
import type { ContentFilter } from '@/types/index'

export function useFilterState() {
  const { filter, setFilter } = useFilterContext()

  function updateFilter(next: ContentFilter) {
    setFilter(next)
  }

  return { filter, setFilter: updateFilter }
}
