"use client";
import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";

export default function DeleteButton({
  text,
  description,
  onClick,
}: {
  text: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <Menu>
      <MenuButton className="w-full px-2">
        <div className="flex cursor-pointer items-center gap-1.5 rounded-sm p-2 text-left hover:bg-neutral-100">
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
          {text}
        </div>
      </MenuButton>

      <MenuItems
        anchor="bottom start"
        transition
        className="mt-3 origin-top-right rounded-sm bg-white p-2 text-sm/6 font-light shadow-sm transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
      >
        <MenuItem>
          <div>
            <div>{description}</div>
            <div className="mt-2 flex items-center justify-end gap-3">
              <div
                role="button"
                className="text-md cursor-pointer rounded-sm bg-white px-3 py-1 font-light transition duration-200 ease-in-out hover:bg-neutral-200 hover:active:bg-neutral-300"
              >
                Cancel
              </div>
              <Button
                onClick={() => onClick()}
                className="text-md cursor-pointer rounded-sm bg-red-600 px-3 py-1 font-semibold text-white transition duration-200 ease-in-out data-[hover]:bg-red-700 data-[hover]:data-[active]:bg-red-800"
              >
                Delete
              </Button>
            </div>
          </div>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
