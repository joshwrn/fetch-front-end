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
import { Skeleton } from '@/components/ui/skeleton'
import { FETCH_URL } from '@/constants/fetch-url'
import { AuthenticationError } from '@/lib/errors'
import { fetchUrl, handleFetchStatus } from '@/lib/fetch-url'
import { appendQueryParams, useQueryParams } from '@/lib/query-params'
import {
  DogResponseSchema,
  DogsSearchSchema,
} from '@/lib/schemas/fetch-schemas'
import { useHasBeenInViewport } from '@/lib/use-in-viewport'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

const PAGE_SIZE = 25

const Dogs = () => {
  const queryParams = useQueryParams({
    defaultParams: {
      breeds: ``,
      zipCodes: ``,
      ageMin: ``,
      ageMax: ``,
      sort: `breed:asc`,
      size: `${PAGE_SIZE}`,
    },
  })

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
      const isLastPage = lastPage.data.length < PAGE_SIZE
      if (isLastPage) return undefined
      return allPages.length
    },
  })
  console.log(`dogsSearchQuery`, dogsSearchQuery)
  return (
    <div className="flex flex-col w-full border-2 border-red-500 h-screen overflow-hidden">
      <header className="flex gap-4 justify-between px-20 py-4">
        <h1>Dogs</h1>
        <BreedSelection />
        <SortOrderDropdown />
      </header>
      <main className="gap-4 p-4 border-2 border-black flex-wrap h-full w-full overflow-auto grid grid-cols-3">
        {dogsSearchQuery.data?.pages.map((page, pageIndex) =>
          page.data.map((dog, dogIndex) => {
            const isLastPage =
              pageIndex === dogsSearchQuery.data.pages.length - 1
            const isLastDog = dogIndex === page.data.length - 1
            return (
              <div
                key={dog.id}
                ref={isLastPage && isLastDog ? lastDogRef : undefined}
                className="flex flex-col w-full h-96 items-center justify-center border-2 border-black relative overflow-hidden rounded-xl gap-2 p-4"
              >
                <p>{dog.name}</p>
                <ProgressiveImage
                  src={dog.img}
                  alt={dog.name}
                  width={200}
                  height={200}
                  className="rounded-lg object-cover h-60 w-[200px]"
                  loading="lazy"
                />
                <p>{dog.age}</p>
                <p>{dog.breed}</p>
                <p>{dog.zip_code}</p>
              </div>
            )
          })
        )}
        {dogsSearchQuery.isFetchingNextPage ? (
          <>
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col w-full h-96 items-center justify-center border-2 border-black relative overflow-hidden rounded-xl gap-2 p-4"
              >
                <Skeleton className="h-[20px] w-[200px]" />
                <Skeleton className="h-60 w-[200px]" />
                <Skeleton className="h-[20px] w-[200px]" />
                <Skeleton className="h-[20px] w-[200px]" />
                <Skeleton className="h-[20px] w-[200px]" />
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
