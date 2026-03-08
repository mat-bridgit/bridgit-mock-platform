"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { useState } from "react";

interface DateFilterButtonProps {
    label: string;
    value: Date | undefined;
    onChange: (date: Date | undefined) => void;
}

export function DateFilterButton({ label, value, onChange }: DateFilterButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex items-center gap-0.5">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn("h-9 gap-1", value && "text-foreground")}
                    >
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {value ? format(value, "MMM d, yyyy") : label}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={(date) => {
                            onChange(date);
                            setOpen(false);
                        }}
                    />
                </PopoverContent>
            </Popover>
            {value && (
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={() => onChange(undefined)}>
                    <X className="h-3.5 w-3.5" />
                </Button>
            )}
        </div>
    );
}
