import { useQuery, useQueryClient, useMutation, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { ApiResponse } from '@/types/api'
import { ApiError } from '@/lib/api/errors'
import { useToast } from '@/store/useToast'

interface RequestOptions {
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete'
  data?: unknown
  params?: Record<string, unknown>
  responseType?: 'blob'
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const res = await apiClient.request<ApiResponse<T>>({
    url,
    method: options.method ?? 'get',
    data: options.data,
    params: options.params,
    responseType: options.responseType,
  })
  return res.data
}

type QueryOptions<TData> = Omit<UseQueryOptions<ApiResponse<TData>, ApiError>, 'queryKey' | 'queryFn'>

export function useApiQuery<TData>(
  queryKey: unknown[],
  url: string | null,
  options?: QueryOptions<TData> & { params?: Record<string, unknown> },
) {
  const { params, ...queryOptions } = options ?? {}

  return useQuery<ApiResponse<TData>, ApiError>({
    queryKey: [...queryKey, url, params ?? null],
    queryFn: () => request<TData>(url!, { params }),
    enabled: url !== null && (queryOptions.enabled ?? true),
    ...queryOptions,
  })
}

export interface ApiMutationOptions {
  url: string
  method?: 'post' | 'put' | 'patch' | 'delete'
  invalidates?: unknown[][]
  successMessage?: string
}

export function useApiMutation<TData, TVariables = unknown>(
  options: ApiMutationOptions,
  mutationOptions?: Omit<UseMutationOptions<ApiResponse<TData>, ApiError, TVariables>, 'mutationFn'>,
) {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation<ApiResponse<TData>, ApiError, TVariables>({
    mutationFn: (variables) =>
      request<TData>(options.url, {
        method: options.method ?? 'post',
        data: variables as object,
      }),
    onSuccess: (data, variables, context) => {
      options.invalidates?.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key }),
      )
      if (options.successMessage) toast.success(options.successMessage)
      mutationOptions?.onSuccess?.(data, variables, context)
    },
    ...mutationOptions,
  })
}
