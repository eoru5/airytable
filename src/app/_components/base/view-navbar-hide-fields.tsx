"use client";

import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import type { OnChangeFn } from "@tanstack/react-table";
import type { TableFields } from "./table";
import HideFieldOption from "./hide-field-option";

export default function ViewNavbarHideFields({
  hiddenFields,
  setHiddenFields,
  fields,
}: {
  hiddenFields: number[];
  setHiddenFields: OnChangeFn<number[]>;
  fields: TableFields;
}) {
  return (
    <Menu>
      <MenuButton>
        <div
          className={`flex cursor-pointer items-center gap-1 rounded-sm px-3 py-1 transition duration-150 ${hiddenFields.length > 0 ? "bg-emerald-100" : "hover:bg-neutral-200"}`}
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
              d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
            />
          </svg>
          {hiddenFields.length > 0
            ? `${hiddenFields.length} hidden field${hiddenFields.length > 1 ? "s" : ""}`
            : "Hide Fields"}
        </div>
      </MenuButton>

      <MenuItems
        anchor="bottom start"
        transition
        className="z-20 w-[250px] origin-top-right rounded-sm bg-white p-2 text-sm shadow-sm transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
      >
        <MenuItem>
          <div
            className="flex flex-col gap-2"
            onClick={(e) => e.preventDefault()}
          >
            <div className="flex flex-col gap-1 font-light">
              {fields.map((f) => (
                <HideFieldOption
                  key={f.id}
                  name={f.name}
                  type={f.Type}
                  fieldId={f.id}
                  hiddenFields={hiddenFields}
                  setHiddenFields={setHiddenFields}
                />
              ))}
            </div>
          </div>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
