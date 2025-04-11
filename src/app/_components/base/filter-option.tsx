import {
  Button,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import type { OnChangeFn } from "@tanstack/react-table";
import { useState } from "react";
import {
  NumberFilters,
  numberFilters,
  TextFilters,
  textFilters,
  type ColumnFilter,
  type ColumnFiltersState,
  type TableFields,
} from "./table";

export default function FilterOption({
  selectedFilter,
  fieldIdx,
  fields,
  columnFilters,
  setColumnFilters,
}: {
  selectedFilter: ColumnFilter;
  fieldIdx: number;
  fields: TableFields;
  columnFilters: ColumnFiltersState;
  setColumnFilters: OnChangeFn<ColumnFiltersState>;
}) {
  const selectedField = fields.find(
    (f) => f.id.toString() === selectedFilter.id,
  );
  const [selected, setSelected] = useState(selectedField);
  const [value, setValue] = useState(selectedFilter.value);

  return (
    <div className="flex gap-1 text-sm font-light">
      <Listbox
        value={selected}
        onChange={(value) => {
          if (!value || !columnFilters[fieldIdx]) return;

          const filter = {
            id: value.id.toString(),
            type: value.Type === "Number" ? NumberFilters.LessThan : TextFilters.Contains,
            value: undefined,
          };

          const newFilters = [...columnFilters];
          newFilters[fieldIdx] = filter;

          setColumnFilters(newFilters);
          setSelected(value);
        }}
      >
        <ListboxButton
          className={
            "flex w-full cursor-pointer justify-between truncate rounded-sm border-1 border-neutral-300 px-2 py-1 text-left focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
          }
        >
          {selected!.name}
          <div aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-5"
            >
              <path
                fillRule="evenodd"
                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </ListboxButton>
        <ListboxOptions
          anchor="bottom"
          transition
          className={
            "z-20 w-[var(--button-width)] rounded-sm border border-neutral-300 bg-white p-1 shadow-sm transition duration-100 ease-in [--anchor-gap:var(--spacing-1)] focus:outline-none data-[leave]:data-[closed]:opacity-0"
          }
        >
          {fields.map((f) => (
            <ListboxOption
              key={f.id}
              value={f}
              className="group flex cursor-pointer items-center gap-2 rounded-sm px-3 py-1.5 text-sm font-light transition duration-150 select-none data-[focus]:bg-neutral-200"
            >
              {f.name}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>

      <Listbox
        value={selectedFilter.type}
        onChange={(value) => {
          const newFilters = [...columnFilters];
          newFilters[fieldIdx]!.type = value;
          setColumnFilters(newFilters);
        }}
      >
        <ListboxButton
          className={
            "flex w-full cursor-pointer justify-between truncate rounded-sm border-1 border-neutral-300 px-2 py-1 text-left focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
          }
        >
          {selectedFilter.type}
          <div aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-5"
            >
              <path
                fillRule="evenodd"
                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </ListboxButton>
        <ListboxOptions
          anchor="bottom"
          transition
          className={
            "z-20 w-[var(--button-width)] rounded-sm border border-neutral-300 bg-white p-1 shadow-sm transition duration-100 ease-in [--anchor-gap:var(--spacing-1)] focus:outline-none data-[leave]:data-[closed]:opacity-0"
          }
        >
          {(
            (selected!.Type === "Text" && textFilters) ||
            (selected!.Type === "Number" && numberFilters) ||
            []
          ).map((f, idx) => (
            <ListboxOption
              key={idx}
              value={f}
              className="group flex cursor-pointer items-center gap-2 rounded-sm px-3 py-1.5 text-sm font-light transition duration-150 select-none data-[focus]:bg-neutral-200"
            >
              {f}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>

      <input
        className="rounded-sm border-1 border-neutral-300 p-1"
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={(e) => {
          const newFilters = [...columnFilters];
          newFilters[fieldIdx]!.value = e.target.value;
          setColumnFilters(newFilters);
        }}
        placeholder="Enter a value"
      />

      <Button
        className="cursor-pointer rounded-sm p-1 text-neutral-600 transition duration-200 hover:bg-neutral-200"
        onClick={() => {
          const newFilters = [...columnFilters];
          newFilters.splice(fieldIdx, 1);
          setColumnFilters(newFilters);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="size-5"
        >
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
      </Button>
    </div>
  );
}
