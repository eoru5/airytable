"use client";

import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Button,
} from "@headlessui/react";
import type { OnChangeFn } from "@tanstack/react-table";
import {
  NumberFilters,
  TextFilters,
  type ColumnFiltersState,
  type TableField,
  type TableFields,
} from "./table";
import FilterOption from "./filter-option";

export default function ViewNavbarFilter({
  fields,
  columnFilters,
  setColumnFilters,
}: {
  fields: TableFields;
  columnFilters: ColumnFiltersState;
  setColumnFilters: OnChangeFn<ColumnFiltersState>;
}) {
  // prob a better way tro do this but
  const fieldsById: Record<string, TableField> = {};
  fields.forEach((f) => (fieldsById[f.id.toString()] = f));

  const addFilter = () => {
    // no primary fields so possible to have 0 fields
    if (fields.length === 0) return;

    // just use the first col
    const field = fields[0];
    const filter = {
      id: field!.id.toString(),
      type:
        field!.Type === "Number"
          ? NumberFilters.LessThan
          : TextFilters.Contains,
      value: undefined,
    };

    setColumnFilters([...columnFilters, filter]);
  };

  return (
    <Menu>
      <MenuButton>
        <div
          className={`flex cursor-pointer items-center gap-1 rounded-sm px-3 py-1 transition duration-150 ${columnFilters.filter((f) => f.value).length > 0 ? "bg-emerald-100" : "hover:bg-neutral-200"}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="size-4 text-neutral-600"
          >
            <path d="M6.5 2.25a.75.75 0 0 0-1.5 0v3a.75.75 0 0 0 1.5 0V4.5h6.75a.75.75 0 0 0 0-1.5H6.5v-.75ZM11 6.5a.75.75 0 0 0-1.5 0v3a.75.75 0 0 0 1.5 0v-.75h2.25a.75.75 0 0 0 0-1.5H11V6.5ZM5.75 10a.75.75 0 0 1 .75.75v.75h6.75a.75.75 0 0 1 0 1.5H6.5v.75a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75ZM2.75 7.25H8.5v1.5H2.75a.75.75 0 0 1 0-1.5ZM4 3H2.75a.75.75 0 0 0 0 1.5H4V3ZM2.75 11.5H4V13H2.75a.75.75 0 0 1 0-1.5Z" />
          </svg>
          Filter
        </div>
      </MenuButton>

      <MenuItems
        anchor="bottom start"
        transition
        className="z-20 w-[600px] origin-top-right rounded-sm bg-white p-2 text-sm shadow-sm transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
      >
        <MenuItem>
          <div
            className="flex flex-col gap-2 px-2 py-1 font-light"
            onClick={(e) => e.preventDefault()}
          >
            {columnFilters.length === 0 ? (
              <div>No filer conditions are applied</div>
            ) : (
              <div>In this view, show records</div>
            )}

            {/* multiple fields can have a sort, so instead change arr by idx not field id */}
            {columnFilters.map((f, idx) => (
              <FilterOption
                key={`${f.id}_${idx}`}
                selectedFilter={f}
                fieldIdx={idx}
                fields={fields}
                columnFilters={columnFilters}
                setColumnFilters={setColumnFilters}
              />
            ))}

            <Button
              className="flex cursor-pointer items-center gap-1 rounded-sm text-neutral-600 transition duration-200 hover:text-neutral-900"
              onClick={addFilter}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-5"
              >
                <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
              </svg>
              Add condition
            </Button>
          </div>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
