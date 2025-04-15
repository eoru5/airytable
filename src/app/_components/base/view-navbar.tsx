"use client";

import type { SortingState } from "@tanstack/react-table";
import type { ColumnFiltersState, TableFields } from "./table";
import ViewNavbarFilter from "./view-navbar-filter";
import ViewNavbarSort from "./view-navbar-sort";
import ViewNavbarHideFields from "./view-navbar-hide-fields";
import type { Dispatch, SetStateAction } from "react";
import ViewNavbarSearch from "./view-navbar-search";

export default function ViewNavbar({
  sorting,
  setSorting,
  fields,
  columnFilters,
  setColumnFilters,
  hiddenFields,
  setHiddenFields,
  searching,
  setSearching
}: {
  sorting: SortingState;
  setSorting: Dispatch<SetStateAction<SortingState>>;
  fields: TableFields;
  columnFilters: ColumnFiltersState;
  setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>>;
  hiddenFields: number[];
  setHiddenFields: Dispatch<SetStateAction<number[]>>;
  searching: boolean;
  setSearching: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="flex justify-between items-center gap-2 border-b-1 border-neutral-300 bg-white px-3 py-2 text-sm font-light">
      <div>
        <ViewNavbarHideFields
          hiddenFields={hiddenFields}
          setHiddenFields={setHiddenFields}
          fields={fields}
        />

        <ViewNavbarFilter
          fields={fields}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
        />

        <ViewNavbarSort
          sorting={sorting}
          setSorting={setSorting}
          fields={fields}
        />
      </div>
      <div>
        <ViewNavbarSearch searching={searching} setSearching={setSearching} />
      </div>
    </div>
  );
}
