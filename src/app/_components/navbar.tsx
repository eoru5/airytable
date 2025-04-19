"use client";

import TextLogo from "./text-logo";
import React from "react";
import Image from "next/image";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuSeparator,
} from "@headlessui/react";
import Link from "next/link";
import signOutAction from "./signout-action";
import { useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="z-10 flex w-full items-center bg-white shadow-sm">
      <nav className="flex w-full items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4 text-neutral-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-5 cursor-pointer hover:text-neutral-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>

          <Link href="/">
            <TextLogo text="xl" size={0.8} />
          </Link>
        </div>

        <div className="flex w-[350px] items-center justify-between rounded-full border-1 border-neutral-300 px-3 py-1 text-sm font-light text-neutral-500 shadow-sm">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            Search...
          </div>
          ctrl K
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1 text-sm font-light text-neutral-800">
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
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
              />
            </svg>
            Help
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-8 cursor-pointer rounded-full bg-white p-1.5 text-neutral-700 shadow-sm/20"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
            />
          </svg>
          <Menu>
            <MenuButton>
              <Image
                src={session?.user?.image ?? ""}
                alt="User Avatar"
                className="cursor-pointer rounded-full"
                width={32}
                height={32}
              />
            </MenuButton>

            <MenuItems
              anchor="bottom end"
              transition
              className="z-20 origin-top-right rounded-sm bg-white py-4 text-sm/6 shadow-sm transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
            >
              <MenuItem>
                <div className="mx-4 block">{session?.user?.name}</div>
              </MenuItem>
              <MenuItem>
                <div className="mx-4 block">{session?.user?.email}</div>
              </MenuItem>
              <MenuSeparator className="my-3 h-px bg-neutral-200" />
              <MenuItem>
                <div
                  className="mx-2 flex cursor-pointer items-center gap-1.5 px-2 text-left data-[focus]:bg-neutral-100"
                  role="button"
                  onClick={signOutAction}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="size-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M6 10a.75.75 0 0 1 .75-.75h9.546l-1.048-.943a.75.75 0 1 1 1.004-1.114l2.5 2.25a.75.75 0 0 1 0 1.114l-2.5 2.25a.75.75 0 1 1-1.004-1.114l1.048-.943H6.75A.75.75 0 0 1 6 10Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Log out
                </div>
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </nav>
    </header>
  );
}
