"use client";

import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { api } from "~/trpc/react";
import Grid from "./grid-icon";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import RenameButton from "../rename-button";

export default function ViewSidebarButton({
  name,
  viewId,
  baseId,
  selected,
  link,
  canDelete,
}: {
  name: string;
  viewId: string;
  baseId: string;
  selected: boolean;
  link: string;
  canDelete: boolean;
}) {
  const [renaming, setRenaming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming && inputRef.current) {
      inputRef.current.focus();
    }
  }, [renaming]);

  const utils = api.useUtils();

  const router = useRouter();
  const deleteView = api.view.delete.useMutation({
    onSuccess: async () => {
      await utils.table.getAllViews.invalidate();
      router.push(`/${baseId}`);
    },
  });

  const renameView = api.view.rename.useMutation({
    onSuccess: async () => {
      await utils.table.getAllViews.invalidate();
    },
  });

  return selected ? (
    <Menu>
      <MenuButton>
        <div className="flex w-full cursor-pointer items-center justify-between rounded-sm bg-blue-100 px-2 py-1 transition duration-150 hover:bg-blue-200">
          <div className="flex items-center gap-2">
            <div className="text-blue-600">
              <Grid />
            </div>
            {renaming ? (
              <div className="mr-2 h-full text-sm font-light" onClick={e => e.stopPropagation()}>
                <input
                  ref={inputRef}
                  defaultValue={name}
                  className="w-full"
                  onBlur={(e) => {
                    renameView.mutate({ id: viewId, name: e.target.value });
                    setRenaming(false);
                  }}
                />
              </div>
            ) : (
              <div>{name}</div>
            )}
          </div>
          <div className="text-black/50">
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
        </div>
      </MenuButton>

      <MenuItems
        anchor="bottom start"
        transition
        className="z-10 mt-2 w-[250px] origin-top-right rounded-sm bg-white px-1 py-2 text-sm font-light shadow-sm transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
      >
        <MenuItem>
          <RenameButton text="Rename View" onClick={() => setRenaming(true)} />
        </MenuItem>
        <MenuItem>
          {canDelete ? (
            <div
              className="mx-2 flex cursor-pointer items-center gap-1.5 rounded-sm px-2 py-2 text-left text-red-600 hover:bg-neutral-100"
              role="button"
              onClick={() => deleteView.mutate({ id: viewId })}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="black"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
              Delete view
            </div>
          ) : (
            <div className="mx-2 flex items-center gap-1.5 rounded-sm px-2 py-2 text-left hover:bg-neutral-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="black"
                className="size-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
              Can&apos;t delete last view
            </div>
          )}
        </MenuItem>
      </MenuItems>
    </Menu>
  ) : (
    <Link
      className="flex w-full cursor-pointer items-center justify-between rounded-sm bg-white px-2 py-1 transition duration-150 hover:bg-neutral-300"
      href={link}
    >
      <div className="flex items-center gap-2">
        <div className="text-blue-600">
          <Grid />
        </div>
        {name}
      </div>
    </Link>
  );
}
