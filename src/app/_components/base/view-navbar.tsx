"use client";

export default function ViewNavbar() {
  return (
    <div className="flex border-b-1 border-neutral-300 bg-white px-3 py-2 text-sm font-light">
      <div className="flex cursor-pointer items-center gap-1 rounded-sm px-3 py-1 transition duration-150 hover:bg-neutral-200">
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
            d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
          />
        </svg>
        Sort
      </div>
    </div>
  );
}
