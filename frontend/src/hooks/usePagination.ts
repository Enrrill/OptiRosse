import { useMemo, useState, useCallback } from 'react'
import { useDebounce } from './useDebounce'
import { getStoredPageSize, setStoredPageSize } from '@/lib/constants/pagination'

interface UsePaginationOptions {
  pageSize?: number
  storageKey?: string
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
  pageSize: initialPageSize,
  storageKey,
  debounceMs = 300,
}: UsePaginationOptions = {}) {
  const [page, setPage] = useState(1)
  const [pageSizeState, setPageSizeState] = useState(() =>
    getStoredPageSize(storageKey, initialPageSize)
  )
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, debounceMs)

  const resetPage = useCallback(() => setPage(1), [])

  const setPageSize = useCallback(
    (newPageSize: number) => {
      setPageSizeState(newPageSize)
      setPage(1)
      if (storageKey) {
        setStoredPageSize(storageKey, newPageSize)
      }
    },
    [storageKey],
  )

  const params = useMemo(
    () => ({
      page,
      page_size: pageSizeState,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [page, pageSizeState, debouncedSearch],
  )

  const paginationMeta = useMemo<PaginationMeta>(
    () => ({
      count: 0,
      next: null,
      previous: null,
      total_pages: 1,
      page: 1,
      page_range: [1],
    }),
    [],
  )

  return {
    page,
    setPage,
    pageSize: pageSizeState,
    setPageSize,
    search,
    setSearch,
    resetPage,
    params,
    paginationMeta,
  }
}

