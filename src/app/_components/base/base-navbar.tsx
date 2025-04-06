"use client"

import TextLogo from "../text-logo";
import React from 'react';
import Image from "next/image";
import { Menu, MenuButton, MenuItem, MenuItems, MenuSeparator } from '@headlessui/react'
import Link from "next/link";
import signOutAction from "../signout-action";
import { useSession } from "next-auth/react";

export default function BaseNavbar({ baseName, color = 'bg-emerald-700' }: { baseName: string, color?: string }) {
  const { data: session } = useSession()
  
  return (
    <header className={`flex w-full items-center shadow-sm ${color} z-10`}>
      <nav className="flex w-full items-center px-4 py-3 justify-between">
        <Link href="/">
          <TextLogo text="xl" textColor="text-white" size={0.8} monoColor="fill-white" name={baseName}/>
        </Link>

        <Menu>
          <MenuButton>
            <Image
              src={session?.user?.image ?? ""}
              alt="User Avatar"
              className="rounded-full cursor-pointer"
              width={32}
              height={32}
            />
          </MenuButton>

          <MenuItems
            anchor="bottom end"
            transition
            className="z-20 origin-top-right rounded-sm shadow-sm bg-white py-4 text-sm/6 transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            <MenuItem>
              <div className="block mx-4">
                {session?.user?.name}
              </div>
            </MenuItem>
            <MenuItem>
              <div className="block mx-4">
                {session?.user?.email}
              </div>
            </MenuItem>
            <MenuSeparator className="my-3 h-px bg-neutral-200" />
            <MenuItem>
              <div className="data-[focus]:bg-neutral-100 mx-2 px-2 text-left cursor-pointer flex items-center gap-1.5" role="button" onClick={signOutAction}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                  <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M6 10a.75.75 0 0 1 .75-.75h9.546l-1.048-.943a.75.75 0 1 1 1.004-1.114l2.5 2.25a.75.75 0 0 1 0 1.114l-2.5 2.25a.75.75 0 1 1-1.004-1.114l1.048-.943H6.75A.75.75 0 0 1 6 10Z" clipRule="evenodd" />
                </svg>
                Log out
              </div>
            </MenuItem>
          </MenuItems>
        </Menu>
      </nav>
    </header>
  );
}