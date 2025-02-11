import React from 'react'

import { RxMixerVertical } from 'react-icons/rx'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { MultiSelect } from '@/components/ui/multi-select'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useQueryParams } from '@/lib/query-params'
import { dogUrl, useHandleDogStatus } from '@/lib/dog-url'
import { useQuery } from '@tanstack/react-query'

export const Filters: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger className="flex gap-2 w-full justify-between p-3 items-center bg-orange-50 rounded-md py-2 px-4">
        <span className="font-normal justify-self-start text-left">
          Filters
        </span>
        <RxMixerVertical className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent className="w-[300px]">
        <DialogHeader>
          <DialogTitle>Filters</DialogTitle>
        </DialogHeader>
        <BreedSelection />
        <SortOrderDropdown />
      </DialogContent>
    </Dialog>
  )
}

const SortOrderDropdown = () => {
  const queryParams = useQueryParams()
  return (
    <Select onValueChange={(value) => queryParams.push(`sort`, value)}>
      <SelectTrigger className="w-full">
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
  const handleFetchStatus = useHandleDogStatus()

  const breedsQuery = useQuery<{ key: string; value: string }[]>({
    queryKey: [`breeds`],
    queryFn: async () => {
      const breedsResponse = await fetch(dogUrl(`/dogs/breeds`), {
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

  const selectedBreeds = queryParams.params.breeds?.split(`,`) ?? []

  return (
    <MultiSelect
      values={breedsQuery.data ?? []}
      label={`Filtered Breeds (${selectedBreeds.length})`}
      onChange={(value) => queryParams.push(`breeds`, value.join(`,`))}
      defaultSelectedItems={selectedBreeds ?? []}
    />
  )
}
