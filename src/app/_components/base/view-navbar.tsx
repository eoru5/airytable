"use client";

import type {
  SortingState,
  OnChangeFn,
} from "@tanstack/react-table";
import type { ColumnFiltersState, TableFields } from "./table";
import ViewNavbarFilter from "./view-navbar-filter";
import ViewNavbarSort from "./view-navbar-sort";

export default function ViewNavbar({
  sorting,
  setSorting,
  fields,
  columnFilters,
  setColumnFilters,
}: {
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
  fields: TableFields;
  columnFilters: ColumnFiltersState;
  setColumnFilters: OnChangeFn<ColumnFiltersState>;
}) {
  return (
    <div className="flex border-b-1 border-neutral-300 bg-white px-3 py-2 text-sm font-light gap-2">
      <ViewNavbarSort
        sorting={sorting}
        setSorting={setSorting}
        fields={fields}
      />

      <ViewNavbarFilter
        fields={fields}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
      />
    </div>
  );
}
