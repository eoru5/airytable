"use client"

import React, { type ReactEventHandler } from 'react';
import { Button } from '@headlessui/react'
import Link from 'next/link';

export default function Sidebar({ createOnClick }: { createOnClick: ReactEventHandler<HTMLButtonElement> }) {
  return (
    // todo small sidebar
    <div className="flex h-full flex-col bg-white items-center shadow-sm justify-between py-6 px-2 md:min-w-[300px]">
      <div className="flex flex-col gap-2 w-full">
        <Link href="/" className="px-4 py-2 font-light rounded-sm cursor-pointer hover:bg-neutral-200 transition duration-200 ease-in-out">
          Home
        </Link>
      </div>

      <div className="flex flex-col gap-5 w-full">
        <hr className="h-0.5 border-neutral-300" />
        <Button onClick={createOnClick} className="cursor-pointer flex justify-center items-center gap-2 rounded-sm bg-blue-600 py-2 px-3 text-md font-semibold text-white data-[hover]:bg-blue-700 data-[hover]:data-[active]:bg-blue-800 transition duration-200 ease-in-out">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create
        </Button>
      </div>
    </div>
  );
}