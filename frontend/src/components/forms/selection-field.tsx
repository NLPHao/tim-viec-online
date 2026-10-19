"use client";

import { useId, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "cn";
import { normalizeSearch } from "@/features/jobs/query";
import { Input } from "@/modules/cores/shadcn/components/ui/input";
import { Checkbox } from "@/modules/cores/shadcn/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/cores/shadcn/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/modules/cores/shadcn/components/ui/popover";

export type SelectionOption = { value: string; label: string };

type CommonProps = {
  label: string;
  placeholder: string;
  name: string;
  options: SelectionOption[];
  className?: string;
};

const ALL_VALUES = "__all_values__";

// Radix traps focus and hides the page from assistive technology. Inert also
// prevents hidden page controls from remaining programmatically focusable.
function isolateSelectionMenu(menu: HTMLDivElement | null) {
  if (!menu) return;
  const outside = Array.from(document.body.children)
    .filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && !element.contains(menu),
    )
    .map((element) => ({ element, inert: element.inert }));
  outside.forEach(({ element }) => {
    element.inert = true;
  });
  return () =>
    outside.forEach(({ element, inert }) => {
      element.inert = inert;
    });
}

export function SelectionField({
  label,
  placeholder,
  name,
  options,
  value,
  onValueChange,
  className,
}: CommonProps & { value: string; onValueChange: (value: string) => void }) {
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <div className={cn("selection-field", className)} data-active={!!value}>
      <input type="hidden" name={name} value={value} />
      <Select
        value={value || ALL_VALUES}
        onValueChange={(next) => onValueChange(next === ALL_VALUES ? "" : next)}
      >
        <SelectTrigger
          ref={trigger}
          className="selection-trigger"
          aria-label={label}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          ref={isolateSelectionMenu}
          className="selection-menu"
          position="popper"
          align="start"
          sideOffset={6}
          collisionPadding={12}
        >
          <SelectItem className="selection-option" value={ALL_VALUES}>
            {placeholder}
          </SelectItem>
          {options.map((option) => (
            <SelectItem
              className="selection-option"
              value={option.value}
              key={option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value && (
        <button
          className="selection-clear"
          type="button"
          aria-label={`Xóa ${label.toLocaleLowerCase("vi")}`}
          onClick={() => {
            onValueChange("");
            trigger.current?.focus();
          }}
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function MultiSelectionField({
  label,
  placeholder,
  name,
  options,
  values,
  onValuesChange,
  searchLabel,
  className,
}: CommonProps & {
  values: string[];
  onValuesChange: (values: string[]) => void;
  searchLabel: string;
}) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = options.filter((option) => values.includes(option.value));
  const visible = options.filter((option) =>
    normalizeSearch(option.label).includes(normalizeSearch(search)),
  );
  return (
    <div
      className={cn("selection-field", className)}
      data-active={values.length > 0}
    >
      {values.map((value) => (
        <input key={value} type="hidden" name={name} value={value} />
      ))}
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setSearch("");
        }}
      >
        <PopoverTrigger asChild>
          <button
            ref={trigger}
            className="selection-trigger"
            type="button"
            aria-label={label}
            aria-describedby={`${id}-selection`}
          >
            <span className="selection-value">
              <span>{selected[0]?.label ?? placeholder}</span>
              {selected.length > 1 && (
                <span className="selection-count">+{selected.length - 1}</span>
              )}
            </span>
            <ChevronDown size={16} aria-hidden="true" />
          </button>
        </PopoverTrigger>
        <span className="sr-only" id={`${id}-selection`}>
          {selected.length > 0
            ? `Đã chọn ${selected.length} ngành nghề: ${selected.map((option) => option.label).join(", ")}`
            : "Chưa chọn ngành nghề"}
        </span>
        <PopoverContent
          className="selection-menu selection-multiple-menu"
          align="start"
          sideOffset={6}
          collisionPadding={12}
          aria-label={label}
        >
          <div className="selection-search">
            <Search size={16} aria-hidden="true" />
            <label className="sr-only" htmlFor={`${id}-search`}>
              {searchLabel}
            </label>
            <Input
              id={`${id}-search`}
              value={search}
              placeholder={`${searchLabel}…`}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <fieldset className="selection-options">
            <legend className="sr-only">
              Chọn nhiều {label.toLocaleLowerCase("vi")}
            </legend>
            {visible.map((option) => {
              const checked = values.includes(option.value);
              return (
                <label
                  className="selection-check-option"
                  key={option.value}
                  data-selected={checked}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(next) =>
                      onValuesChange(
                        next === true
                          ? [...values, option.value]
                          : values.filter((value) => value !== option.value),
                      )
                    }
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
            {visible.length === 0 && (
              <p className="selection-empty" role="status">
                Không tìm thấy lựa chọn phù hợp.
              </p>
            )}
          </fieldset>
        </PopoverContent>
      </Popover>
      {values.length > 0 && (
        <button
          className="selection-clear"
          type="button"
          aria-label={`Xóa ${label.toLocaleLowerCase("vi")}`}
          onClick={() => {
            onValuesChange([]);
            trigger.current?.focus();
          }}
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
