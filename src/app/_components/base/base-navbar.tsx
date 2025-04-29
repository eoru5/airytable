"use client";

import TextLogo from "../text-logo";
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
import signOutAction from "../signout-action";
import { useSession } from "next-auth/react";

export default function BaseNavbar({
  baseName,
  color = "bg-emerald-700",
}: {
  baseName: string;
  color?: string;
}) {
  const { data: session } = useSession();

  return (
    <header className={`flex w-full items-center ${color} z-10`}>
      <nav className="flex w-full items-center justify-between px-4 py-3">
        <div className="flex items-center gap-5 text-white">
          <div className="flex items-center gap-1">
            <Link href="/">
              <TextLogo
                text="xl"
                textColor="text-white"
                size={0.8}
                monoColor="fill-white"
                name={baseName}
              />
            </Link>
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
          <div className="flex items-center gap-7 text-sm font-light">
            <div className="cursor-pointer rounded-full bg-emerald-800 px-3 py-1 inset-shadow-xs inset-shadow-black/25 transition duration-200 select-none">
              Data
            </div>
            {/* <div className="cursor-pointer rounded-full px-3 py-1 transition duration-200 select-none hover:bg-emerald-800 hover:inset-shadow-xs hover:inset-shadow-black/25">
              Automations
            </div>
            <div className="cursor-pointer rounded-full px-3 py-1 transition duration-200 select-none hover:bg-emerald-800 hover:inset-shadow-xs hover:inset-shadow-black/25">
              Interfaces
            </div>
            <div className="cursor-pointer rounded-full px-3 py-1 transition duration-200 select-none hover:bg-emerald-800 hover:inset-shadow-xs hover:inset-shadow-black/25">
              Forms
            </div> */}
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm font-light text-white">
          {/* <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="mr-4 size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>

          <div className="flex items-center gap-1">
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

          <div className="flex items-center gap-1 rounded-full bg-emerald-900 p-2">
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
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
              />
            </svg>
            Upgrade
          </div>

          <div className="flex items-center gap-1 rounded-full bg-white p-2 text-emerald-700">
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
                d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
              />
            </svg>
            Share
          </div>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-8 cursor-pointer rounded-full bg-white p-1.5 text-emerald-700 shadow-sm/20"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
            />
          </svg> */}
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
