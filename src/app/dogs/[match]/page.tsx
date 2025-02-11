'use client'
import { dogUrl, useHandleDogStatus } from '@/lib/dog-url'
import { DogResponseSchema } from '@/lib/schemas/dog-schemas'
import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import React from 'react'
import Confetti from 'react-confetti'
import { ProgressiveImage } from '@/components/ui/progressive-image'
import { Button } from '@/components/ui/button'

const Match: React.FC = () => {
  const pathname = useParams()
  const matchId = pathname.match
  const router = useRouter()
  const handleFetchStatus = useHandleDogStatus()

  const matchedDogQuery = useQuery({
    queryKey: [`dogs`, matchId],
    queryFn: async () => {
      const dogsResponse = await fetch(dogUrl(`/dogs`), {
        credentials: `include`,
        headers: {
          'Content-Type': `application/json`,
        },
        method: `POST`,
        body: JSON.stringify([matchId]),
      })
      handleFetchStatus(dogsResponse)
      const dogs = DogResponseSchema.parse(await dogsResponse.json())
      return dogs[0]
    },
  })

  if (!matchedDogQuery.data) {
    return (
      <div className="flex flex-col w-full h-screen overflow-hidden bg-orange-100 justify-center items-center">
        <p>Loading Match...</p>
      </div>
    )
  }

  const dog = matchedDogQuery.data

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-orange-100 justify-center items-center">
      <header className="grid grid-cols-3 gap-4 items-center px-5 py-4 bg-orange-100 bg-opacity-90 border-orange-200 border fixed top-0 left-0 right-0 z-10 backdrop-blur-lg">
        <Button
          variant="outline"
          className="w-[100px]"
          onClick={() => router.push(`/dogs`)}
        >
          Go Back
        </Button>
      </header>
      <h1 className="text-xl font-bold text-center text-orange-950 mb-4">
        Your New Best Friend!
      </h1>
      <div
        key={dog.id}
        className="flex flex-col items-center relative overflow-hidden rounded-xl gap-2 p-4 shrink-0 bg-orange-50 h-[500px] md:h-[500px] lg:h-[600px] w-full md:w-1/2"
      >
        <div className="w-full h-full overflow-hidden relative">
          <ProgressiveImage
            src={dog.img}
            alt={dog.name}
            width={200}
            height={200}
            className="rounded-lg object-cover h-full w-full"
            loading="lazy"
          />
        </div>
        <div className="w-full shrink-0 flex flex-col p-4">
          <p className="font-bold text-lg mb-2">{dog.breed}</p>
          <div className="flex gap-2 items-center justify-between mb-4">
            <p>{dog.name}</p>
            <p>{dog.age} years old</p>
          </div>
          <p className="text-xs w-full opacity-65">Located in {dog.zip_code}</p>
        </div>
      </div>
      <Confetti recycle={false} gravity={0.01} />
    </div>
  )
}

export default Match
