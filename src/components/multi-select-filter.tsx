"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

interface MultiSelectFilterProps {
    label: string;
    options: { value: string; label: string }[];
    selected: Set<string>;
    onToggle: (value: string) => void;
}

export function MultiSelectFilter({ label, options, selected, onToggle }: MultiSelectFilterProps) {
    const selectedLabels = options.filter((o) => selected.has(o.value));
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1">
                    {label}
                    {selectedLabels.map((o) => (
                        <Badge key={o.value} variant="secondary" className="rounded-sm px-1.5 py-0 text-xs">
                            {o.label}
                        </Badge>
                    ))}
                    <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                {options.map((opt) => (
                    <DropdownMenuCheckboxItem
                        key={opt.value}
                        checked={selected.has(opt.value)}
                        onCheckedChange={() => onToggle(opt.value)}
                        onSelect={(e) => e.preventDefault()}
                    >
                        {opt.label}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
