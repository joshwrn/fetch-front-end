import { ProgressiveImage } from '@/components/ui/progressive-image'
import { Skeleton } from '@/components/ui/skeleton'
import { Toggle } from '@/components/ui/toggle'
import { DogSchema } from '@/lib/schemas/fetch-schemas'
import React from 'react'
import { IoIosHeart, IoIosHeartEmpty } from 'react-icons/io'
import { z } from 'zod'

export const DogCard: React.FC<{
  dog: z.infer<typeof DogSchema>
  isLastPage: boolean
  isLastDog: boolean
  lastDogRef: React.RefObject<HTMLDivElement | null>
  isFavorite: boolean
  setFavorites: React.Dispatch<
    React.SetStateAction<z.infer<typeof DogSchema>[]>
  >
}> = ({ dog, isLastPage, isLastDog, lastDogRef, isFavorite, setFavorites }) => {
  return (
    <div
      key={dog.id}
      ref={isLastPage && isLastDog ? lastDogRef : undefined}
      className="flex flex-col w-full items-center relative overflow-hidden rounded-xl gap-2 p-4 shrink-0 bg-orange-50 h-[500px] md:h-[500px] lg:h-[600px]"
    >
      <div className="w-full h-full overflow-hidden relative">
        <Toggle
          pressed={isFavorite}
          onPressedChange={(pressed) => {
            setFavorites((prev) =>
              pressed
                ? prev.concat(dog)
                : prev.filter((favorite) => favorite.id !== dog.id)
            )
          }}
          className="absolute top-2 right-2 bg-white border border-x-stone-200"
        >
          {isFavorite ? (
            <IoIosHeart color="red" />
          ) : (
            <IoIosHeartEmpty color="red" />
          )}
        </Toggle>
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
  )
}

export const DogCardSkeleton = () => {
  return (
    <div className="flex flex-col w-full items-center relative overflow-hidden rounded-xl gap-2 p-4 shrink-0 bg-orange-50 h-[500px] md:h-[500px] lg:h-[600px]">
      <Skeleton className="w-full h-full" />
      <Skeleton className="h-[50px] w-full" />
      <Skeleton className="h-[60px] w-full" />
      <Skeleton className="h-[20px] w-full" />
    </div>
  )
}
