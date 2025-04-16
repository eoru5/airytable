"use client";

import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import type { HeaderContext } from "@tanstack/react-table";
import DeleteButton from "../delete-button";
import RenameButton from "../rename-button";
import ColumnIcon from "./column-icon";
import type { TableField, TableRecord } from "./table";
import { useEffect, useRef, useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

export default function TableHeader({
  field,
  props,
}: {
  field: TableField;
  props: HeaderContext<TableRecord, unknown>;
}) {
  const [renaming, setRenaming] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming && inputRef.current) {
      inputRef.current.focus();
    }
  }, [renaming]);

  const utils = api.useUtils();

  const deleteField = api.field.delete.useMutation({
    onSuccess: async () => {
      await utils.table.getFields.invalidate();
    },
  });

  const renameField = api.field.rename.useMutation({
    onSuccess: async () => {
      await utils.table.getFields.invalidate();
    },
  });

  return (
    <div className="flex h-full w-full justify-between">
      <div
        className="flex grow cursor-pointer items-center justify-between overflow-hidden py-1 pl-3"
        onClick={!renaming ? props.column.getToggleSortingHandler() : undefined}
      >
        <div className="flex items-center gap-1 overflow-hidden">
          <div className="text-neutral-500">
            <ColumnIcon type={field.Type} />
          </div>
          {renaming ? (
            <div className="flex-1 pr-1 text-sm font-light">
              <input
                ref={inputRef}
                defaultValue={field.name}
                className="w-full"
                onBlur={(e) => {
                  renameField.mutate({ id: field.id, name: e.target.value });
                  setRenaming(false);
                }}
              />
            </div>
          ) : (
            <>{field.name}</>
          )}
        </div>
        <div className="text-neutral-600">
          {props.column.getIsSorted() === "asc" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-5"
            >
              <path
                fillRule="evenodd"
                d="M9.47 6.47a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L10 8.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06l4.25-4.25Z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {props.column.getIsSorted() === "desc" && (
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
          )}
        </div>
      </div>

      <Menu>
        <MenuButton>
          <div className="flex cursor-pointer items-center py-1 pr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="size-4"
            >
              <path d="M8 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM8 6.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM9.5 12.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
            </svg>
          </div>
        </MenuButton>

        <MenuItems
          anchor="bottom start"
          transition
          onClick={(e) => e.preventDefault()}
          className="origin-top-right rounded-sm bg-white py-2 text-sm font-light shadow-sm transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          <MenuItem>
            <RenameButton
              text="Rename Field"
              onClick={() => setRenaming(true)}
            />
          </MenuItem>
          <MenuItem>
            <DeleteButton
              text="Delete Field"
              description={`Are you sure you want to delete ${field.name}?`}
              onClick={() => deleteField.mutate({ id: field.id })}
            />
          </MenuItem>
        </MenuItems>
      </Menu>
    </div>
  );
}
