import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { Button } from './button'
import { ChevronDown } from 'lucide-react'

interface ISelectProps {
  values: {
    key: string
    value: string
  }[]
  label: string
  onChange: (value: string[]) => void
  defaultSelectedItems: string[]
}
export const MultiSelect = ({
  values,
  label,
  onChange,
  defaultSelectedItems,
}: ISelectProps) => {
  const [selectedItems, setSelectedItems] =
    useState<string[]>(defaultSelectedItems)

  const handleSelectChange = (value: string) => {
    if (!selectedItems.includes(value)) {
      const newSelectedItems = [...selectedItems, value]
      onChange(newSelectedItems)
      setSelectedItems(newSelectedItems)
    } else {
      const referencedArray = [...selectedItems]
      const indexOfItemToBeRemoved = referencedArray.indexOf(value)
      referencedArray.splice(indexOfItemToBeRemoved, 1)
      onChange(referencedArray)
      setSelectedItems(referencedArray)
    }
  }

  const isOptionSelected = (value: string): boolean => {
    return selectedItems.includes(value) ? true : false
  }
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex gap-2 w-full justify-between p-3 border border-orange-950"
          >
            <span className="font-normal justify-self-start text-left">
              {label}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 max-h-[300px] overflow-auto"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuSeparator />
          {values.map((value: ISelectProps[`values`][0], index: number) => {
            return (
              <DropdownMenuCheckboxItem
                onSelect={(e) => e.preventDefault()}
                key={index}
                checked={isOptionSelected(value.key)}
                onCheckedChange={() => handleSelectChange(value.key)}
              >
                {value.value}
              </DropdownMenuCheckboxItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
