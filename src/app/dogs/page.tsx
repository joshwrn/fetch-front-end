'use client'
import { PiDogLight } from 'react-icons/pi'

import { fetchUrl, useHandleFetchStatus } from '@/lib/fetch-url'
import { appendQueryParams, useQueryParams } from '@/lib/query-params'
import {
  DogResponseSchema,
  DogsSearchSchema,
} from '@/lib/schemas/fetch-schemas'
import { useHasBeenInViewport } from '@/lib/use-in-viewport'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useContext } from 'react'
import { DogsContext } from '@/state/dogs-context'
import { Button } from '@/components/ui/button'
import { Filters } from './components/filters'
import { DogCard, DogCardSkeleton } from './components/dog-card'

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

  const handleFetchStatus = useHandleFetchStatus()

  const pageSize = parseInt(queryParams.params.size)

  const { favorites, setFavorites } = useContext(DogsContext)

  const { ref: lastDogRef } = useHasBeenInViewport({
    onVisible: () => dogsSearchQuery.fetchNextPage(),
  })

  const dogsSearchQuery = useInfiniteQuery({
    queryKey: [`dogs`, queryParams.params],
    queryFn: async ({ pageParam = 0 }) => {
      const url = appendQueryParams(fetchUrl(`/dogs/search`), {
        ...queryParams.params,
        from: `${pageParam * pageSize}`,
      })
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
      <header className="grid grid-cols-3 gap-4 items-center px-5 py-4 bg-orange-100 bg-opacity-90 border-orange-200 border fixed top-0 left-0 right-0 z-10 backdrop-blur-lg">
        <div className="flex gap-2 items-center">
          <PiDogLight size={24} />
          <h1>Dog Match</h1>
        </div>
        <Button className="bg-orange-50 flex gap-4 items-center justify-self-center hover:bg-orange-200 w-[200px]">
          <p>Find Your Match</p>
          <p>{favorites.length}</p>
        </Button>
        <div className="flex gap-4 items-center justify-self-end">
          <Filters />
        </div>
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
              <DogCard
                key={dog.id}
                {...{
                  dog,
                  isLastPage,
                  isLastDog,
                  lastDogRef,
                  isFavorite,
                  setFavorites,
                }}
              />
            )
          })
        )}
        {dogsSearchQuery.isFetchingNextPage ||
        dogsSearchQuery.isFetching ||
        dogsSearchQuery.isLoading ? (
          <>
            {Array.from({ length: pageSize }).map((_, i) => (
              <DogCardSkeleton key={i} />
            ))}
          </>
        ) : null}
      </main>
    </div>
  )
}

export default Dogs
