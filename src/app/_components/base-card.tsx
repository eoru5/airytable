"use client";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import Link from "next/link";
import DeleteButton from "./delete-button";
import { useEffect, useRef, useState, type ReactNode } from "react";
import RenameButton from "./rename-button";

export default function BaseCard({
  name,
  id,
  renameBase,
  deleteBase,
  iconColor = "bg-emerald-700",
}: {
  name: string;
  id: string;
  renameBase: (name: string) => void;
  deleteBase: () => void;
  iconColor?: string;
}) {
  const [renaming, setRenaming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const containerClass =
    "flex w-[300px] cursor-pointer justify-between rounded-sm border-1 border-solid border-neutral-200 bg-white p-5 shadow-sm transition duration-200 hover:shadow-md";

  const Container = ({ children }: { children: ReactNode }) =>
    renaming ? (
      <div className={containerClass}>{children}</div>
    ) : (
      <Link href={`/${id}`} className={containerClass}>
        {children}
      </Link>
    );

  useEffect(() => {
    if (renaming && inputRef.current) {
      inputRef.current.focus();
      window.getSelection()?.removeAllRanges();
    }
  }, [renaming]);

  return (
    <Container>
      <div className="flex items-center gap-4">
        <div
          className={`h-[50px] w-[50px] shrink-0 ${iconColor} flex items-center justify-center rounded-lg text-2xl text-white`}
        >
          {name[0]}
          {name[1]}
        </div>

        <div>
          {renaming ? (
            <div className="mr-2 mb-2 text-sm font-light">
              <input
                ref={inputRef}
                defaultValue={name}
                className="w-full"
                onBlur={(e) => {
                  renameBase(e.target.value);
                  setRenaming(false);
                }}
              />
            </div>
          ) : (
            <div className="mb-2 text-sm font-light">{name}</div>
          )}
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
            onClick={(e) => e.preventDefault()}
            className="origin-top-right rounded-sm bg-white py-2 text-sm font-light shadow-sm transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            <MenuItem>
              <RenameButton
                text="Rename Base"
                onClick={() => setRenaming(true)}
              />
            </MenuItem>
            <MenuItem>
              <DeleteButton
                text="Delete Base"
                description={`Are you sure you want to delete ${name}?`}
                onClick={deleteBase}
              />
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </Container>
  );
}
