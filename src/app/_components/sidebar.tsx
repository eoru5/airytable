"use client";

import React, { type ReactEventHandler } from "react";
import { Button } from "@headlessui/react";
import Link from "next/link";

export default function Sidebar({
  createOnClick,
}: {
  createOnClick: ReactEventHandler<HTMLButtonElement>;
}) {
  return (
    // todo small sidebar
    <div className="flex h-full flex-col items-center justify-between bg-white px-2 py-6 shadow-sm md:min-w-[300px]">
      <div className="flex w-full flex-col gap-2">
        <Link
          href="/"
          className="cursor-pointer rounded-sm px-4 py-2 font-light transition duration-200 ease-in-out hover:bg-neutral-200"
        >
          Home
        </Link>
      </div>

      <div className="flex w-full flex-col gap-5">
        <hr className="h-0.5 border-neutral-300" />
        <Button
          onClick={createOnClick}
          className="text-md flex cursor-pointer items-center justify-center gap-2 rounded-sm bg-blue-600 px-3 py-2 font-semibold text-white transition duration-200 ease-in-out data-[hover]:bg-blue-700 data-[hover]:data-[active]:bg-blue-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
            className="size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Create
        </Button>
      </div>
    </div>
  );
}
