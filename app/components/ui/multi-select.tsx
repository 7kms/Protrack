"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/app/lib/utils";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

export type MultiSelectProps = {
  value: string[];
  onValueChange: (value: string[]) => void;
  children: React.ReactNode;
  placeholder?: string;
  options?: { value: string; label: string; color?: string }[];
};

export const MultiSelect = React.memo(
  ({
    value = [],
    onValueChange,
    children,
    placeholder,
    options = [],
  }: MultiSelectProps) => {
    const handleSelect = (selectedValue: string) => {
      const newValue = value.includes(selectedValue)
        ? value.filter((v) => v !== selectedValue)
        : [...value, selectedValue];
      onValueChange(newValue);
    };

    const handleClear = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onValueChange([]);
    };

    const selectedLabels = value
      .map((v) => options.find((opt) => opt.value === v))
      .filter(Boolean);

    return (
      <div className="relative">
        <Select value={value[0] || ""} onValueChange={handleSelect}>
          <SelectTrigger className="w-full min-h-[40px]">
            <SelectValue placeholder={placeholder}>
              <div
                className="flex items-center gap-1 flex-wrap pr-10 min-h-[32px] max-h-[80px] overflow-y-auto"
                style={{ alignContent: "flex-start" }}
              >
                {selectedLabels.length > 0 ? (
                  <>
                    {selectedLabels.map((option, index) => (
                      <span
                        key={index}
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm",
                          option?.color &&
                            `bg-${option.color}-100 text-${option.color}-800 dark:bg-${option.color}-900 dark:text-${option.color}-200`
                        )}
                      >
                        {option?.label}
                      </span>
                    ))}
                  </>
                ) : (
                  placeholder
                )}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                const isSelected = value.includes(child.props.value);
                return (
                  <div
                    key={child.props.value}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
                      "focus:bg-accent focus:text-accent-foreground",
                      isSelected && "bg-accent/50"
                    )}
                    onClick={() => handleSelect(child.props.value)}
                  >
                    {isSelected && (
                      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                    {child.props.children}
                  </div>
                );
              }
              return child;
            })}
          </SelectContent>
        </Select>
        {selectedLabels.length > 0 && (
          <div
            className="absolute right-8 top-1/2 -translate-y-1/2 cursor-pointer"
            onClick={handleClear}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
    );
  }
);

MultiSelect.displayName = "MultiSelect";
