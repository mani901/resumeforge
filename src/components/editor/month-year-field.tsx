"use client";

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function MonthYearField({
  label,
  value,
  onChange,
  disabled,
  placeholder = "Select…",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const parsed = /^([A-Za-z]{3}) (\d{4})$/.exec(value.trim());
  const [year, setYear] = useState(() =>
    parsed ? Number(parsed[2]) : new Date().getFullYear()
  );
  const selectedMonth = parsed?.[1];
  const selectedYear = parsed ? Number(parsed[2]) : null;

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={disabled}
          render={
            <button
              type="button"
              className={cn(
                "flex h-8 w-full items-center gap-1.5 rounded-lg border border-input bg-transparent px-2.5 text-left text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
                !value && "text-muted-foreground"
              )}
            />
          }
        >
          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{value || placeholder}</span>
        </PopoverTrigger>
        <PopoverContent className="w-60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <Button variant="ghost" size="icon-sm" onClick={() => setYear(year - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold tabular-nums">{year}</span>
            <Button variant="ghost" size="icon-sm" onClick={() => setYear(year + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {MONTHS.map((month) => (
              <button
                key={month}
                type="button"
                onClick={() => {
                  onChange(`${month} ${year}`);
                  setOpen(false);
                }}
                className={cn(
                  "rounded-md px-1 py-1.5 text-xs font-medium transition-colors hover:bg-muted",
                  selectedMonth === month && selectedYear === year && "bg-primary text-primary-foreground hover:bg-primary"
                )}
              >
                {month}
              </button>
            ))}
          </div>
          {value && (
            <Button
              variant="ghost"
              size="xs"
              className="mt-2 w-full text-muted-foreground"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Clear
            </Button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
