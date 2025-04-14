"use client";

import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";

import { api } from "~/trpc/react";
import React, { useRef, useState } from "react";
import Link from "next/link";
import RenameButton from "../rename-button";
import DeleteButton from "../delete-button";
import { useRouter } from "next/navigation";

export default function BaseTab({
  name,
  selected,
  link = "",
  hoverColor,
  baseId,
  tableId,
  canDelete,
}: {
  name: string;
  selected: boolean;
  link: string;
  hoverColor: string;
  baseId: string;
  tableId: string;
  canDelete: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tableName, setTableName] = useState(name);

  const utils = api.useUtils();
  const renameTable = api.table.rename.useMutation({
    onSuccess: async () => {
      await utils.base.get.invalidate();
    },
  });

  const router = useRouter();
  const deleteTable = api.table.delete.useMutation({
    onSuccess: async () => {
      await utils.base.get.invalidate();
      router.push(`/${baseId}`);
    },
  });

  const rename = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return selected ? (
    <Menu>
      <MenuButton>
        <div
          className={`flex cursor-pointer items-center justify-between rounded-t-sm bg-white px-5 py-2 text-sm text-nowrap focus:outline-1 focus:outline-white focus:outline-none`}
        >
          {name}
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
        className="z-10 mt-2 w-[250px] origin-top-right rounded-sm bg-white px-1 py-2 text-sm font-light shadow-sm transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
      >
        <MenuItem>
          {({ close }) => (
            <div>
              <Menu>
                <MenuButton className="w-full">
                  <RenameButton text="Rename Table" onClick={() => rename()} />
                </MenuButton>

                <MenuItems
                  anchor="bottom start"
                  transition
                  onClick={(e) => e.preventDefault()}
                  className="z-20 origin-top-right rounded-sm bg-white p-2 text-sm font-light shadow-sm transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
                >
                  <MenuItem>
                    <div
                      className="mr-2 mb-2 text-sm font-light"
                      onClick={(e) => e.preventDefault()}
                    >
                      <input
                        ref={inputRef}
                        value={tableName}
                        onChange={(e) => setTableName(e.target.value)}
                        className="w-full rounded-sm border-2 border-blue-600 px-2 py-1"
                      />
                      <div className="mt-2 flex items-center justify-end gap-3">
                        <div
                          role="button"
                          onClick={close}
                          className="text-md cursor-pointer rounded-sm bg-white px-3 py-1 font-light transition duration-200 ease-in-out hover:bg-neutral-200 hover:active:bg-neutral-300"
                        >
                          Cancel
                        </div>
                        <Button
                          onClick={() => {
                            renameTable.mutate({
                              id: tableId,
                              name: tableName,
                            });
                            close();
                          }}
                          className="text-md cursor-pointer rounded-sm bg-blue-600 px-3 py-1 font-semibold text-white transition duration-200 ease-in-out data-[hover]:bg-blue-700 data-[hover]:data-[active]:bg-blue-800"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>
          )}
        </MenuItem>
        <MenuItem>
          {canDelete ? (
            <DeleteButton
              text="Delete Table"
              description={`Are you sure you want to delete this table?`}
              onClick={() => {
                deleteTable.mutate({ id: tableId });
              }}
            />
          ) : (
            <div className="mx-2 flex items-center gap-1.5 rounded-sm p-2 text-left hover:bg-neutral-100">
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
              Can&apos;t delete last table
            </div>
          )}
        </MenuItem>
      </MenuItems>
    </Menu>
  ) : (
    <Link
      className={`cursor-pointer rounded-t-sm px-5 py-2 text-sm text-nowrap text-white hover:${hoverColor} transition duration-200 focus:outline-1 focus:outline-white focus:outline-none`}
      href={link}
    >
      {name}
    </Link>
  );
}
