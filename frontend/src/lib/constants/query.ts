import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
      placeholderData: (previousData: unknown) => previousData,
    },
    mutations: {
      retry: 0,
    },
  },
})
