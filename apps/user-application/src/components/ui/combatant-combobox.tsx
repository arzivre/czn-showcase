"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Updater } from "@tanstack/react-form"
import { COMBATANS } from "@/constants/combatants"


export function CombatanCombobox({ value = '', handleChange }: { value: string, handleChange: (value: Updater<string>) => void }) {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen} >
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {value
                        ? COMBATANS.find((combatant) => combatant.value === value)?.label
                        : "Select combatant..."}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                <Command>
                    <CommandInput placeholder="Search combatant..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>No combatant found.</CommandEmpty>
                        <CommandGroup>
                            {COMBATANS.map((combatant) => (
                                <CommandItem
                                    key={combatant.value}
                                    value={combatant.value}
                                    onSelect={(currentValue) => {
                                        handleChange(currentValue === value ? "" : currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    {combatant.label}
                                    <Check
                                        className={cn(
                                            "ml-auto",
                                            value === combatant.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
