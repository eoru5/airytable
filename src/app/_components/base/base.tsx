"use client";

import { Button } from "@headlessui/react";

import BaseNavbar from "./base-navbar";
import { api } from "~/trpc/react";
import React from "react";
import View from "./view";
import BaseTab from "./base-tab";

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

      <div className="flex h-full w-full flex-col overflow-auto">
        <div className={`flex w-full gap-2 ${color}`}>
          <div className={`${secondaryColor} grow rounded-tr-md px-4`}>
            <div className="flex overflow-scroll">
              {base?.Table.map(({ id, name, View }) => (
                <React.Fragment key={id}>
                  <BaseTab
                    name={name}
                    selected={id === tableId}
                    link={`/${baseId}/${id ?? 0}/${View[0]?.id ?? 0}`}
                    hoverColor={tertiaryColor}
                    baseId={baseId}
                    tableId={id}
                    canDelete={base?.Table.length > 1}
                  />
                  <div className="mx-2 py-2">
                    <div className="h-full w-0.5 bg-white opacity-20" />
                  </div>
                </React.Fragment>
              ))}

              <div className="flex cursor-pointer items-center text-white">
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

              <div className="mx-2 py-2">
                <div className="h-full w-0.5 bg-white opacity-20" />
              </div>
              <Button
                className={`cursor-pointer rounded-t-sm px-3 text-nowrap text-white hover:${tertiaryColor} transition duration-200 focus:outline-1 focus:outline-white focus:outline-none`}
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

          {/* <div
            className={`${secondaryColor} flex items-center gap-6 rounded-tl-md px-4 text-sm font-light text-white`}
          >
            <div>Extensions</div>
            <div className="flex items-center gap-1">
              Tools{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-4"
              >
                <path
                  fillRule="evenodd"
                  d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div> */}
        </div>

        <View baseId={baseId} tableId={tableId} viewId={viewId} />
      </div>
    </div>
  );
}
