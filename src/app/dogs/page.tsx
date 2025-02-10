'use client'
import { MultiSelect } from '@/components/ui/multi-select'
import { ProgressiveImage } from '@/components/ui/progressive-image'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { IoIosHeart, IoIosHeartEmpty } from 'react-icons/io'
import { PiDogLight } from 'react-icons/pi'

import { Skeleton } from '@/components/ui/skeleton'
import { Toggle } from '@/components/ui/toggle'
import { fetchUrl, handleFetchStatus } from '@/lib/fetch-url'
import { appendQueryParams, useQueryParams } from '@/lib/query-params'
import {
  DogResponseSchema,
  DogsSearchSchema,
} from '@/lib/schemas/fetch-schemas'
import { useHasBeenInViewport } from '@/lib/use-in-viewport'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useContext } from 'react'
import { DogsContext } from '@/state/dogs-context'
import { Button } from '@/components/ui/button'

const Dogs = () => {
  const queryParams = useQueryParams({
    defaultParams: {
      breeds: ``,
      zipCodes: ``,
      ageMin: ``,
      ageMax: ``,
      sort: `breed:asc`,
      size: `25`,
    },
  })

  const pageSize = parseInt(queryParams.params.size)

  const { favorites, setFavorites } = useContext(DogsContext)

  const { ref: lastDogRef } = useHasBeenInViewport({
    onVisible: () => dogsSearchQuery.fetchNextPage(),
  })

  const dogsSearchQuery = useInfiniteQuery({
    queryKey: [`dogs`, queryParams.params],
    queryFn: async ({ pageParam = 0 }) => {
      const url = appendQueryParams(
        fetchUrl(`/dogs/search`),
        queryParams.params
      )
      const dogIdsResponse = await fetch(url, {
        credentials: `include`,
        headers: {
          'Content-Type': `application/json`,
        },
        method: `GET`,
      })
      handleFetchStatus(dogIdsResponse)
      const dogsIds = DogsSearchSchema.parse(await dogIdsResponse.json())
      const dogsResponse = await fetch(fetchUrl(`/dogs`), {
        credentials: `include`,
        headers: {
          'Content-Type': `application/json`,
        },
        method: `POST`,
        body: JSON.stringify(dogsIds.resultIds),
      })
      handleFetchStatus(dogsResponse)
      const dogs = DogResponseSchema.parse(await dogsResponse.json())
      return {
        data: dogs,
        count: dogsIds.total,
        page: pageParam,
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const isLastPage = lastPage.data.length < pageSize
      if (isLastPage) return undefined
      return allPages.length
    },
  })

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">
      <header className="flex gap-4 justify-between items-center px-5 py-4 bg-orange-100 bg-opacity-75 border-orange-200 border fixed top-0 left-0 right-0 z-10 backdrop-blur-lg">
        <div className="flex gap-2 items-center">
          <PiDogLight size={24} />
          <h1>Dog Match</h1>
        </div>
        <div className="flex gap-4 items-center">
          <BreedSelection />
          <SortOrderDropdown />
        </div>
        <Button className="bg-orange-50 flex gap-4 items-center hover:bg-orange-200">
          <p className="text-orange-950">Start Match</p>
          <p className="text-orange-950">{favorites.length}</p>
        </Button>
      </header>
      <main className="gap-4 p-4 pt-[90px] flex-wrap h-full w-full overflow-auto bg-orange-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {dogsSearchQuery.data?.pages.map((page, pageIndex) =>
          page.data.map((dog, dogIndex) => {
            const isLastPage =
              pageIndex === dogsSearchQuery.data.pages.length - 1
            const isLastDog = dogIndex === page.data.length - 1
            const isFavorite = favorites.some(
              (favoriteDog) => favoriteDog.id === dog.id
            )
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
                      setFavorites(
                        pressed
                          ? favorites.concat(dog)
                          : favorites.filter(
                              (favorite) => favorite.id !== dog.id
                            )
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
                  <p className="text-xs w-full opacity-65">
                    Located in {dog.zip_code}
                  </p>
                </div>
              </div>
            )
          })
        )}
        {dogsSearchQuery.isFetchingNextPage ? (
          <>
            {Array.from({ length: pageSize }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col w-full items-center relative overflow-hidden rounded-xl gap-2 p-4 shrink-0 bg-orange-50 h-[500px] md:h-[500px] lg:h-[600px]"
              >
                <Skeleton className="w-full h-full" />
                <Skeleton className="h-[50px] w-full" />
                <Skeleton className="h-[60px] w-full" />
                <Skeleton className="h-[20px] w-full" />
              </div>
            ))}
          </>
        ) : null}
      </main>
    </div>
  )
}

export default Dogs

const SortOrderDropdown = () => {
  const queryParams = useQueryParams()
  return (
    <Select onValueChange={(value) => queryParams.push(`sort`, value)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort Order" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Sort Order</SelectLabel>
          <SelectItem value="breed:asc">Breed (A-Z)</SelectItem>
          <SelectItem value="breed:desc">Breed (Z-A)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

const BreedSelection = () => {
  const queryParams = useQueryParams()
  const breedsQuery = useQuery<{ key: string; value: string }[]>({
    queryKey: [`breeds`],
    queryFn: async () => {
      const breedsResponse = await fetch(fetchUrl(`/dogs/breeds`), {
        credentials: `include`,
        headers: {
          'Content-Type': `application/json`,
        },
        method: `GET`,
      })
      handleFetchStatus(breedsResponse)
      return (await breedsResponse.json()).map((breed: string) => ({
        key: breed,
        value: breed,
      }))
    },
  })
  return (
    <MultiSelect
      values={breedsQuery.data ?? []}
      label={`Breeds`}
      onChange={(value) => queryParams.push(`breeds`, value.join(`,`))}
    />
  )
}
