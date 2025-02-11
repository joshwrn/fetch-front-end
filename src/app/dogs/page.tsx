'use client'
import { dogUrl, useHandleDogStatus } from '@/lib/dog-url'
import { appendQueryParams, useQueryParams } from '@/lib/query-params'
import { DogResponseSchema, DogsSearchSchema } from '@/lib/schemas/dog-schemas'
import { useHasBeenInViewport } from '@/lib/use-in-viewport'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useContext } from 'react'
import { DogsContext } from '@/state/dogs-context'
import { DogCard, DogCardSkeleton } from './components/dog-card'
import { Header } from './components/header'

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

  const handleFetchStatus = useHandleDogStatus()

  const pageSize = parseInt(queryParams.params.size)

  const { favorites, setFavorites } = useContext(DogsContext)

  const { ref: lastDogRef } = useHasBeenInViewport({
    onVisible: () => dogsSearchQuery.fetchNextPage(),
  })

  const dogsSearchQuery = useInfiniteQuery({
    queryKey: [`dogs`, queryParams.params],
    queryFn: async ({ pageParam = 0 }) => {
      const url = appendQueryParams(dogUrl(`/dogs/search`), {
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
      const dogsResponse = await fetch(dogUrl(`/dogs`), {
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
      <Header />
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
