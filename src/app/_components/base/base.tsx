"use client";

import {
  Button,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";

import BaseNavbar from "./base-navbar";
import { api } from "~/trpc/react";
import { useState } from "react";
import React from "react";
import View from "./view";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const utils = api.useUtils();

  const [base] = api.base.get.useSuspenseQuery({ baseId });

  const selectedTableIndex =
    base?.Table.findIndex((t) => t.id === tableId) ?? 0;
  const [selectedIndex, setSelectedIndex] = useState(selectedTableIndex);

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
          {/* maybe just dont use this */}
          <TabGroup
            className="flex h-full flex-col"
            selectedIndex={selectedIndex}
            onChange={(e) => {
              setSelectedIndex(e);
              router.push(
                `/${baseId}/${base?.Table[e]?.id ?? 0}/${base?.Table[e]?.View[0]?.id ?? 0}`,
              );
            }}
          >
            <TabList
              className={`flex ${secondaryColor} w-full overflow-scroll px-4`}
            >
              {base?.Table.map(({ id, name }) => (
                <React.Fragment key={id}>
                  <Tab
                    className={`cursor-pointer rounded-t-sm px-4 py-2 text-sm text-nowrap text-white data-[selected]:bg-white data-[selected]:text-black data-[hover]:${tertiaryColor} focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white`}
                  >
                    {name}
                  </Tab>
                  <div className="mx-3 py-2">
                    <div className="h-full w-0.5 bg-white opacity-20"></div>
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
            </TabList>
            <TabPanels className="grow">
              {base?.Table.map(({ id }) => (
                <TabPanel key={id} className="h-full w-full">
                  <View baseId={baseId} tableId={tableId} viewId={viewId} />
                </TabPanel>
              ))}
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </div>
  );
}
