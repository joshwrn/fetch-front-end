'use client'
import { PiDogLight } from 'react-icons/pi'

import { dogUrl, useHandleDogStatus } from '@/lib/dog-url'
import { MatchSchema } from '@/lib/schemas/dog-schemas'
import { useMutation } from '@tanstack/react-query'
import { useContext } from 'react'
import { DogsContext } from '@/state/dogs-context'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Filters } from './filters'

export const Header: React.FC = () => {
  return (
    <header className="grid grid-cols-3 gap-4 items-center px-5 py-4 bg-orange-100 bg-opacity-90 border-orange-200 border fixed top-0 left-0 right-0 z-10 backdrop-blur-lg">
      <div className="flex gap-2 items-center">
        <PiDogLight size={24} />
        <h1>Dog Match</h1>
      </div>
      <MatchButton />
      <div className="flex gap-4 items-center justify-self-end">
        <Filters />
      </div>
    </header>
  )
}

export const MatchButton = () => {
  const { favorites } = useContext(DogsContext)
  const router = useRouter()
  const handleFetchStatus = useHandleDogStatus()

  const matchMutation = useMutation({
    mutationKey: [`match`],
    mutationFn: async () => {
      const matchResponse = await fetch(dogUrl(`/dogs/match`), {
        credentials: `include`,
        headers: {
          'Content-Type': `application/json`,
        },
        method: `POST`,
        body: JSON.stringify(favorites.map((dog) => dog.id)),
      })
      handleFetchStatus(matchResponse)
      const match = MatchSchema.parse(await matchResponse.json())
      router.push(`/dogs/${match.match}`)
    },
  })

  return (
    <Button
      className="bg-orange-50 flex gap-4 items-center justify-self-center hover:bg-orange-200 w-[200px]"
      disabled={favorites.length === 0}
      onClick={() => {
        matchMutation.mutateAsync()
      }}
    >
      {matchMutation.isPending ? (
        <p>Finding your match...</p>
      ) : (
        <>
          <p>Find Your Match</p>
          <p>{favorites.length}</p>
        </>
      )}
    </Button>
  )
}
