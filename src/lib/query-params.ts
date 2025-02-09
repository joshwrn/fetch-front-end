import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

export const useQueryParams = () => {
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

  return { create, push, searchParams }
}
