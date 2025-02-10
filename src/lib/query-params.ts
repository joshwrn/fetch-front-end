import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

export const useQueryParams = (props?: {
  defaultParams?: Record<string, string>
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const create = React.useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) params.set(name, value)
      else params.delete(name)

      return params.toString()
    },
    [searchParams]
  )

  const push = React.useCallback(
    (name: string, value: string | null) => {
      router.push(`?${create(name, value)}`, {
        scroll: false,
      })
    },
    [router, create]
  )

  return {
    create,
    push,
    params: {
      ...props?.defaultParams,
      ...Object.fromEntries(searchParams.entries()),
    },
  }
}

export const appendQueryParams = (url: URL, params: Record<string, string>) => {
  for (const [key, value] of Object.entries(params)) {
    if (value.split(`,`).length > 1) {
      for (const valueItem of value.split(`,`)) {
        url.searchParams.append(key, valueItem)
      }
      continue
    }
    if (value) {
      url.searchParams.append(key, `${value}`)
    }
  }
  return url
}
