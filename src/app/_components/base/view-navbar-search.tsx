"use client";

import type { Dispatch, SetStateAction } from "react";

export default function ViewNavbarSearch({
  searching,
  setSearching
}: {
  searching: boolean;
  setSearching: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className='cursor-pointer items-center rounded-sm px-3 py-1 text-neutral-500' role="button" onClick={() => setSearching(!searching)}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
      </svg>
    </div>
  );
}
