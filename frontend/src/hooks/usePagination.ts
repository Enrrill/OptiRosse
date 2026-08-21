import { useMemo, useState } from 'react'
import { useDebounce } from './useDebounce'

interface UsePaginationOptions {
  pageSize?: number
  debounceMs?: number
}

export interface PaginationMeta {
  count: number
  next: string | null
  previous: string | null
  total_pages: number
  page: number
  page_range: number[]
}

export function usePagination({
  pageSize = 15,
  debounceMs = 300,
}: UsePaginationOptions = {}) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, debounceMs)

  const resetPage = () => setPage(1)

  const params = useMemo(
    () => ({
      page,
      page_size: pageSize,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [page, pageSize, debouncedSearch],
  )

  const paginationMeta = useMemo<PaginationMeta>(() => ({
    count: 0,
    next: null,
    previous: null,
    total_pages: 1,
    page: 1,
    page_range: [1],
  }), [])

  return {
    page,
    setPage,
    search,
    setSearch,
    resetPage,
    pageSize,
    params,
    paginationMeta,
  }
}
