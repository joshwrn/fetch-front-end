'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DogsProvider } from '@/state/dogs-context'

export const Providers = ({ children }: React.PropsWithChildren) => {
  const [queryClient] = React.useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <DogsProvider>{children}</DogsProvider>
    </QueryClientProvider>
  )
}
