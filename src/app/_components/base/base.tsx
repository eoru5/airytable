"use client";

import { Button } from "@headlessui/react";

import BaseNavbar from "./base-navbar";
import { api } from "~/trpc/react";
import React from "react";
import Link from "next/link";
import View from "./view";

export default function Base({
  baseId,
  tableId,
  viewId,
  color = "bg-emerald-700",
  secondaryColor = "bg-emerald-800",
  tertiaryColor = "bg-emerald-900",
}: {
  baseId: string;
  tableId: string;
  viewId: string;
  color?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
}) {
  const utils = api.useUtils();

  const [base] = api.base.get.useSuspenseQuery({ baseId });

  const createBase = api.table.create.useMutation({
    onSuccess: async () => {
      await utils.base.get.invalidate();
    },
  });

  return (
    <div className="flex h-screen w-screen flex-col">
      <BaseNavbar baseName={base?.name ?? ""} color={color} />

      <div className="flex h-screen w-full justify-center">
        <div className="z-20 w-full">
          <div className="flex h-full flex-col">
            <div className={`${secondaryColor} w-full px-4`}>
              <div className="flex overflow-scroll">
                {base?.Table.map(({ id, name, View }) => (
                  <React.Fragment key={id}>
                    <Link
                      className={`cursor-pointer rounded-t-sm px-4 py-2 text-sm text-nowrap ${tableId == id ? "bg-white text-black" : "text-white"} data-[hover]:${tertiaryColor} focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white`}
                      href={`/${baseId}/${id ?? 0}/${View[0]?.id ?? 0}`}
                    >
                      {name}
                    </Link>
                    <div className="mx-3 py-2">
                      <div className="h-full w-0.5 bg-white opacity-20" />
                    </div>
                  </React.Fragment>
                ))}

                <Button
                  className="cursor-pointer"
                  onClick={() =>
                    createBase.mutate({
                      baseId,
                      name: `Table ${(base?.Table.length ?? 0) + 1}`,
                    })
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="white"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </Button>
              </div>
            </div>
            <View baseId={baseId} tableId={tableId} viewId={viewId} />
          </div>
        </div>
      </div>
    </div>
  );
}
