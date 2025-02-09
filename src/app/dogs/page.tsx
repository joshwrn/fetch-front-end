'use client'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FETCH_URL } from '@/constants/fetch-url'
import { AuthenticationError } from '@/lib/errors'
import { fetchUrl } from '@/lib/fetch-url'
import { useQueryParams } from '@/lib/query-params'
import {
  DogResponseSchema,
  DogsSearchSchema,
} from '@/lib/schemas/fetch-schemas'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import Image from 'next/image'

const PAGE_SIZE = 25

const Dogs = () => {
  const queryParams = useQueryParams()

  const params = {
    breeds: queryParams.searchParams.get(`breeds`),
    zipCodes: queryParams.searchParams.get(`zipCodes`),
    ageMin: queryParams.searchParams.get(`ageMin`),
    ageMax: queryParams.searchParams.get(`ageMax`),
    sort: queryParams.searchParams.get(`sort`),
    size: Number(queryParams.searchParams.get(`size`) ?? PAGE_SIZE),
    from: 0,
  }

  const dogsSearchQuery = useInfiniteQuery({
    queryKey: [`dogs`, params],
    queryFn: async ({ pageParam = 0 }) => {
      const url = fetchUrl(`/dogs/search`)
      params.from = params.size * pageParam
      for (const [key, value] of Object.entries(params)) {
        if (value) url.searchParams.append(key, `${value}`)
      }
      // url.searchParams.append(`sort`, `breed:asc`)
      const dogIdsResponse = await fetch(url, {
        credentials: `include`,
        headers: {
          'Content-Type': `application/json`,
        },
        method: `GET`,
      })
      if (dogIdsResponse.status === 401) {
        throw new AuthenticationError(`Not authenticated`)
      }
      if (dogIdsResponse.status !== 200) {
        throw new Error(`Failed to fetch dogs`)
      }
      const dogsIds = DogsSearchSchema.parse(await dogIdsResponse.json())
      const dogsResponse = await fetch(fetchUrl(`/dogs`), {
        credentials: `include`,
        headers: {
          'Content-Type': `application/json`,
        },
        method: `POST`,
        body: JSON.stringify(dogsIds.resultIds),
      })
      if (dogsResponse.status !== 200) {
        throw new Error(`Failed to fetch dogs`)
      }
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
    <div>
      <h1>Dogs</h1>
      <BreedSelection />
      {dogsSearchQuery.data?.pages.map((page) =>
        page.data.map((dog) => (
          <div key={dog.id}>
            <p>{dog.name}</p>
            <Image src={dog.img} alt={dog.name} width={200} height={200} />
            <p>{dog.age}</p>
            <p>{dog.breed}</p>
            <p>{dog.zip_code}</p>
          </div>
        ))
      )}
    </div>
  )
}

export default Dogs

const BreedSelection = () => {
  const queryParams = useQueryParams()
  const breedsQuery = useQuery<string[]>({
    queryKey: [`breeds`],
    queryFn: async () => {
      const res = await fetch(FETCH_URL + `/dogs/breeds`, {
        credentials: `include`,
        headers: {
          'Content-Type': `application/json`,
        },
        method: `GET`,
      })
      if (res.status === 200) {
        return await res.json()
      }
      throw new Error(`Failed to fetch breeds`)
    },
  })
  return (
    <Select onValueChange={(value) => queryParams.push(`breeds`, value)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Breed" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Breeds</SelectLabel>
          {breedsQuery.data?.map((breed) => (
            <SelectItem key={breed} value={breed}>
              {breed}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
