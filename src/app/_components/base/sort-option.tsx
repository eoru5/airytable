import {
  Button,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import type { SortingState } from "@tanstack/react-table";
import { useState, type Dispatch, type SetStateAction } from "react";
import type { TableField, TableFields } from "./table";

export default function SortOption({
  selectedField,
  sorting,
  setSorting,
  fields,
}: {
  selectedField: TableField | null;
  sorting: SortingState;
  setSorting: Dispatch<SetStateAction<SortingState>>;
  fields: TableFields;
}) {
  const [selected, setSelected] = useState(selectedField);
  const selectedSort = sorting.find(
    (s) => s.id === selectedField!.id.toString(),
  );

  const filteredFields = fields.filter(
    (f) => sorting.findIndex((s) => s.id === f.id.toString()) === -1,
  );

  return (
    <div className="flex gap-1 text-sm font-light">
      <Listbox
        value={selected}
        onChange={(value) => {
          // swap old val with new val
          const newSorting = [
            ...sorting,
            { id: value!.id.toString(), desc: false },
          ];
          const index = sorting.findIndex(
            (s) => s.id === selected!.id.toString(),
          );
          if (index > -1) {
            newSorting.splice(index, 1);
          }
          setSorting(newSorting);
          setSelected(value);
        }}
      >
        <ListboxButton
          className={
            "flex w-full cursor-pointer justify-between rounded-sm border-1 border-neutral-300 px-2 py-1 text-left focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
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
          {filteredFields.map((f) => (
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
        value={selectedSort?.desc}
        onChange={(value) => {
          // swap old val with new val
          const newSorting = [...sorting];
          const sort = newSorting.find((s) => s.id === selected!.id.toString());
          sort!.desc = value;
          setSorting(newSorting);
        }}
      >
        <ListboxButton
          className={
            "flex w-full cursor-pointer justify-between rounded-sm border-1 border-neutral-300 px-2 py-1 text-left focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
          }
        >
          {/* should abstract this logic somewhere */}
          {selected!.Type === "Text" &&
            (selectedSort!.desc ? "Z → A" : "A → Z")}
          {selected!.Type === "Number" &&
            (selectedSort!.desc ? "9 → 1" : "1 → 9")}

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
          <ListboxOption
            value={false} // desc false
            className="group flex cursor-pointer items-center gap-2 rounded-sm px-3 py-1.5 text-sm font-light transition duration-150 select-none data-[focus]:bg-neutral-200"
          >
            {selected!.Type === "Text" && "A → Z"}
            {selected!.Type === "Number" && "1 → 9"}
          </ListboxOption>

          <ListboxOption
            value={true} // desc true
            className="group flex cursor-pointer items-center gap-2 rounded-sm px-3 py-1.5 text-sm font-light transition duration-150 select-none data-[focus]:bg-neutral-200"
          >
            {selected!.Type === "Text" && "Z → A"}
            {selected!.Type === "Number" && "9 → 1"}
          </ListboxOption>
        </ListboxOptions>
      </Listbox>

      <Button
        className="cursor-pointer rounded-sm p-1 text-neutral-600 transition duration-200 hover:bg-neutral-200"
        onClick={() => {
          const newSorting = [...sorting];
          const index = sorting.findIndex(
            (s) => s.id === selected!.id.toString(),
          );
          newSorting.splice(index, 1);
          setSorting(newSorting);
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
