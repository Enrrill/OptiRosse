import { useState } from 'react'
import { useDebounce } from './useDebounce'

interface UsePaginationOptions {
  pageSize?: number
  debounceMs?: number
}

export function usePagination({ pageSize = 20, debounceMs = 300 }: UsePaginationOptions = {}) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, debounceMs)

  const resetPage = () => setPage(1)

  return {
    page,
    setPage,
    search,
    setSearch,
    resetPage,
    pageSize,
    params: {
      page,
      page_size: pageSize,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    },
  }
}
