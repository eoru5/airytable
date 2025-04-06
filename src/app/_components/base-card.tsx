"use client";
import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import Link from "next/link";
import type { MouseEventHandler } from "react";

export default function BaseCard({
  name,
  id,
  deleteBase,
  iconColor = "bg-emerald-700",
}: {
  name: string;
  id: string;
  deleteBase: () => void;
  iconColor?: string;
}) {
  return (
    <Link
      href={`/${id}`}
      className="flex w-[300px] cursor-pointer justify-between rounded-sm border-1 border-solid border-neutral-200 bg-white p-5 shadow-sm transition duration-200 hover:shadow-md"
    >
      <div className="flex items-center gap-4">
        <div
          className={`h-[50px] w-[50px] ${iconColor} flex items-center justify-center rounded-lg text-2xl text-white`}
        >
          {name[0]}
          {name[1]}
        </div>

        <div>
          <div className="mb-2 text-sm font-light">{name}</div>
          <div className="text-xs font-light text-neutral-600">Base</div>
        </div>
      </div>

      <div>
        <Menu>
          <MenuButton>
            <svg
              className="size-6 cursor-pointer rounded-xl hover:bg-neutral-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>
          </MenuButton>

          <MenuItems
            anchor="bottom start"
            transition
            className="origin-top-right rounded-sm bg-white py-2 text-sm font-light shadow-sm transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            {/* <MenuItem>
              <Button onClick={deleteBase} className="cursor-pointer data-[focus]:bg-neutral-100 mx-2 p-2 text-left flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                </svg>
                Rename base
              </Button>
            </MenuItem> */}
            <MenuItem>
              {({ close }) => (
                <div>
                  <Menu>
                    <MenuButton>
                      <div className="mx-2 flex cursor-pointer items-center gap-1.5 p-2 text-left hover:bg-neutral-100">
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
                        Delete base
                      </div>
                    </MenuButton>

                    <MenuItems
                      anchor="bottom start"
                      transition
                      className="mt-3 origin-top-right rounded-sm bg-white p-2 text-sm/6 font-light shadow-sm transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
                    >
                      <MenuItem>
                        <div>
                          <div>Are you sure you want to delete {name}?</div>
                          <div className="mt-2 flex items-center justify-end gap-3">
                            <div
                              role="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                close();
                              }}
                              className="text-md cursor-pointer rounded-sm bg-white px-3 py-1 font-light transition duration-200 ease-in-out hover:bg-neutral-200 hover:active:bg-neutral-300"
                            >
                              Cancel
                            </div>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                close();
                                deleteBase();
                              }}
                              className="text-md cursor-pointer rounded-sm bg-red-600 px-3 py-1 font-semibold text-white transition duration-200 ease-in-out data-[hover]:bg-red-700 data-[hover]:data-[active]:bg-red-800"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </MenuItem>
                    </MenuItems>
                  </Menu>
                </div>
              )}
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </Link>
  );
}
