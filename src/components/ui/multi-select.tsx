import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { Button } from './button'

interface ISelectProps {
  values: {
    key: string
    value: string
  }[]
  label: string
  onChange: (value: string[]) => void
}
export const MultiSelect = ({ values, label, onChange }: ISelectProps) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
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
          <Button variant="outline" className="flex gap-2">
            <span>Select {label}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 max-h-[300px] overflow-auto"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
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
