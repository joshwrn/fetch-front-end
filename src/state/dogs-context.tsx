import { DogSchema } from '@/lib/schemas/fetch-schemas'
import React from 'react'
import { z } from 'zod'

type Dog = z.infer<typeof DogSchema>

export const DogsContext = React.createContext<{
  favorites: Dog[]
  setFavorites: React.Dispatch<React.SetStateAction<Dog[]>>
}>({
  favorites: [],
  setFavorites: () => {},
})

export const DogsProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = React.useState<Dog[]>([])

  return (
    <DogsContext.Provider value={{ favorites, setFavorites }}>
      {children}
    </DogsContext.Provider>
  )
}
