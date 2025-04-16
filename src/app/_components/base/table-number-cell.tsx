"use client";

import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { api } from "~/trpc/react";

export default function TableNumberCell({ index, recordId }: { index: number, recordId: number }) {
  const utils = api.useUtils();

  const deleteRecord = api.record.delete.useMutation({
    onSuccess: async () => {
      await utils.table.getRecords.invalidate();
    },
  });

  return (
    <div className="flex h-full w-full items-center justify-between gap-2">
      <div className="overflow-hidden px-4 py-1">{index}</div>
      <div>
        <Menu>
          <MenuButton>
            <div className="cursor-pointer px-4 py-1 text-neutral-600">
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
          </MenuButton>

          <MenuItems
            anchor="bottom start"
            transition
            onClick={(e) => e.preventDefault()}
            className="origin-top-right rounded-sm bg-white px-3 py-2 text-sm font-light shadow-sm transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            <MenuItem>
              <div
                className="flex cursor-pointer items-center gap-1.5 rounded-sm p-2 text-left hover:bg-neutral-100"
                role="button"
                onClick={() => deleteRecord.mutate({ id: recordId })}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
                Delete record
              </div>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </div>
  );
}
