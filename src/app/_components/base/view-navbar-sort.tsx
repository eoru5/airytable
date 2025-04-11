"use client";

import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import type {
  SortingState,
  OnChangeFn,
} from "@tanstack/react-table";
import type { TableFields } from "./table";
import ColumnIcon from "./column-icon";
import SortOption from "./sort-option";

export default function ViewNavbarSort({
  sorting,
  setSorting,
  fields,
}: {
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
  fields: TableFields;
}) {
  return (
    <Menu>
      <MenuButton>
        <div
          className={`flex cursor-pointer items-center gap-1 rounded-sm px-3 py-1 transition duration-150 ${sorting.length > 0 ? "bg-emerald-100 hover:border-1" : "hover:bg-neutral-200"}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4 text-neutral-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
            />
          </svg>
          Sort
        </div>
      </MenuButton>

      <MenuItems
        anchor="bottom start"
        transition
        className="z-20 w-[300px] origin-top-right rounded-sm bg-white p-2 text-sm shadow-sm transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
      >
        <MenuItem>
          <div
            className="flex flex-col gap-2"
            onClick={(e) => e.preventDefault()}
          >
            <div className="px-2 py-1">Sort by</div>
            <hr className="h-0.5 border-neutral-300" />
            {sorting.length > 0 ? (
              <>
                {fields
                  .filter(
                    (f) =>
                      sorting.findIndex((s) => s.id === f.id.toString()) !== -1,
                  )
                  .map((f) => (
                    <SortOption
                      key={f.id}
                      selectedField={f}
                      sorting={sorting}
                      setSorting={setSorting}
                      fields={fields}
                    />
                  ))}
                <Menu>
                  <MenuButton>
                    <div className="mt-1 flex cursor-pointer items-center gap-1 rounded-sm py-1 text-neutral-600 transition duration-200 hover:text-neutral-900">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="size-5"
                      >
                        <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                      </svg>
                      Add another sort
                    </div>
                  </MenuButton>

                  <MenuItems
                    anchor="bottom start"
                    transition
                    className="z-20 origin-top-right rounded-sm bg-white p-2 text-sm shadow-sm transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
                  >
                    <MenuItem>
                      <div className="flex flex-col gap-1 font-light">
                        {fields
                          .filter(
                            (f) =>
                              sorting.findIndex(
                                (s) => s.id === f.id.toString(),
                              ) === -1,
                          )
                          .map((f) => (
                            <div
                              className="flex cursor-pointer items-center gap-1 rounded-sm px-2 py-1 transition duration-150 hover:bg-neutral-200"
                              key={f.id}
                              onClick={() => {
                                // swap old val with new val
                                const newSorting = [
                                  ...sorting,
                                  { id: f.id.toString(), desc: false },
                                ];
                                setSorting(newSorting);
                              }}
                            >
                              <div className="text-neutral-500">
                                <ColumnIcon type={f.Type} />
                              </div>
                              {f.name}
                            </div>
                          ))}
                      </div>
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </>
            ) : (
              <div className="flex flex-col gap-1 font-light">
                {fields.map((f) => (
                  <div
                    className="flex cursor-pointer items-center gap-1 rounded-sm px-2 py-1 transition duration-150 hover:bg-neutral-200"
                    key={f.id}
                    onClick={() =>
                      setSorting([{ id: f.id.toString(), desc: false }])
                    }
                  >
                    <div className="text-neutral-500">
                      <ColumnIcon type={f.Type} />
                    </div>
                    {f.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
