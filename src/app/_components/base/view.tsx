"use client";

import { Button, Input } from "@headlessui/react";
import { api } from "~/trpc/react";
import Grid from "./grid-icon";
import Table, { type ColumnFiltersState } from "./table";
import ViewNavbar from "./view-navbar";
import { type SortingState } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import ViewSidebarButton from "./view-sidebar-button";

export default function View({
  baseId,
  tableId,
  viewId,
}: {
  baseId: string;
  tableId: string;
  viewId: string;
}) {
  const utils = api.useUtils();

  const [views] = api.table.getAllViews.useSuspenseQuery({ tableId });
  const [fields] = api.table.getFields.useSuspenseQuery({ tableId });

  const createView = api.view.create.useMutation({
    onSuccess: async () => {
      await utils.table.getAllViews.invalidate();
    },
  });
  const createField = api.field.create.useMutation({
    onSuccess: async () => {
      await utils.table.getFields.invalidate();
    },
  });

  const createRecord = api.record.create.useMutation({
    onSuccess: async () => {
      await utils.table.getRecords.invalidate();
    },
  });

  const updateSort = api.view.updateSort.useMutation({
    onSuccess: async () => {
      await utils.table.getRecords.invalidate();
    },
  });

  const updateFilter = api.view.updateFilter.useMutation({
    onSuccess: async () => {
      await utils.table.getRecords.invalidate();
    },
  });

  const updateHiddenFields = api.view.updateHiddenFields.useMutation({
    onSuccess: async () => {
      await utils.table.getRecords.invalidate();
    },
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [loaded, setLoaded] = useState(false);
  const [hiddenFields, setHiddenFields] = useState<number[]>([]);
  const [searching, setSearching] = useState(false);

  const updateView = () => {
    const currentView = views.find((v) => v.id === viewId)!;
    setSorting((currentView.sort as { id: string; desc: boolean }[]) ?? []);
    setColumnFilters((currentView.filters as ColumnFiltersState) ?? []);
    setHiddenFields(currentView.hiddenFields ?? []);
    setLoaded(true);
  };

  useEffect(() => updateView(), [viewId]);

  useEffect(() => {
    // save new filter configs to db
    if (loaded) updateFilter.mutate({ id: viewId, filters: columnFilters });
  }, [columnFilters]);

  useEffect(() => {
    // save new sort configs to db
    if (loaded) updateSort.mutate({ id: viewId, sort: sorting });
  }, [sorting]);

  useEffect(() => {
    if (loaded) updateHiddenFields.mutate({ id: viewId, hiddenFields });
  }, [hiddenFields]);

  return (
    <div className="flex h-full w-full flex-col overflow-auto">
      <ViewNavbar
        sorting={sorting}
        setSorting={setSorting}
        fields={fields}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        hiddenFields={hiddenFields}
        setHiddenFields={setHiddenFields}
        searching={searching}
        setSearching={setSearching}
      />
      <div className="flex h-full w-full overflow-auto">
        <div className="flex h-full w-[300px] flex-col justify-between border-r-1 border-neutral-300 bg-white px-4 py-4 text-sm font-light">
          <div className="flex flex-col gap-1">
            <div className="mb-3 flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-6 pb-2 text-neutral-400"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                  clipRule="evenodd"
                />
              </svg>
              <Input
                className="border-b-1 border-neutral-300 pb-2 transition duration-200 data-[focus]:border-blue-700 data-[focus]:outline-none"
                placeholder="Find a view"
              />
            </div>

            {views.map((view) => (
              <ViewSidebarButton
                key={view.id}
                name={view.name}
                viewId={view.id}
                baseId={baseId}
                selected={view.id === viewId}
                link={`/${baseId}/${tableId}/${view.id}`}
                canDelete={views.length > 1}
              />
            ))}
          </div>
          <div>
            <hr className="mb-3 h-0.5 border-neutral-300" />

            <div className="flex cursor-pointer items-center justify-between px-2 py-1">
              Create...
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

            <Button
              className="flex w-full cursor-pointer items-center justify-between rounded-sm px-3 py-2 transition duration-150 hover:bg-neutral-300"
              onClick={() =>
                createView.mutate({
                  tableId,
                  name: `View ${views.length + 1}`,
                })
              }
            >
              <div className="flex items-center gap-2">
                <div className="text-blue-600">
                  <Grid />
                </div>
                Grid
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-4 text-neutral-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </Button>

            <div className="flex w-full cursor-pointer items-center justify-between rounded-sm px-3 py-2 transition duration-150 hover:bg-neutral-300">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-5 text-orange-700"
                >
                  <path d="M5.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V12ZM6 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H6ZM7.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H8a.75.75 0 0 1-.75-.75V12ZM8 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H8ZM9.25 10a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H10a.75.75 0 0 1-.75-.75V10ZM10 11.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75H10ZM9.25 14a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H10a.75.75 0 0 1-.75-.75V14ZM12 9.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V10a.75.75 0 0 0-.75-.75H12ZM11.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H12a.75.75 0 0 1-.75-.75V12ZM12 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H12ZM13.25 10a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H14a.75.75 0 0 1-.75-.75V10ZM14 11.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75H14Z" />
                  <path
                    fillRule="evenodd"
                    d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z"
                    clipRule="evenodd"
                  />
                </svg>
                Calendar
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-4 text-neutral-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>

            <div className="flex w-full cursor-pointer items-center justify-between rounded-sm px-3 py-2 transition duration-150 hover:bg-neutral-300">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5 text-purple-800"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
                  />
                </svg>
                Gallery
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-4 text-neutral-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>

            <div className="flex w-full cursor-pointer items-center justify-between rounded-sm px-3 py-2 transition duration-150 hover:bg-neutral-300">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5 text-green-700"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                  />
                </svg>
                Kanban
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-4 text-neutral-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>

            <div className="flex w-full cursor-pointer items-center justify-between rounded-sm px-3 py-2 transition duration-150 hover:bg-neutral-300">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5 text-red-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125Z"
                  />
                </svg>
                Timeline
                <div className="rounded-lg bg-blue-100 px-1 py-0.5 text-xs text-blue-600">
                  Team
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-4 text-neutral-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>

            <div className="flex w-full cursor-pointer items-center justify-between rounded-sm px-3 py-2 transition duration-150 hover:bg-neutral-300">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5 text-blue-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  />
                </svg>
                List
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-4 text-neutral-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>

            <div className="flex w-full cursor-pointer items-center justify-between rounded-sm px-3 py-2 transition duration-150 hover:bg-neutral-300">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-5 text-emerald-700"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
                  />
                </svg>
                Gantt
                <div className="rounded-lg bg-blue-100 px-1 py-0.5 text-xs text-blue-600">
                  Team
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-4 text-neutral-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>

            <div className="flex w-full cursor-pointer items-center justify-between rounded-sm px-3 py-2 transition duration-150 hover:bg-neutral-300">
              <div className="flex items-center gap-2">
                New section
                <div className="rounded-lg bg-blue-100 px-1 py-0.5 text-xs text-blue-600">
                  Team
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-4 text-neutral-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>

            <hr className="mb-3 h-0.5 border-neutral-300" />

            <div className="flex w-full cursor-pointer items-center justify-between rounded-sm px-3 py-2 transition duration-150 hover:bg-neutral-300">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                  className="size-5 text-red-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                  />
                </svg>
                Form
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-4 text-neutral-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="h-full w-full">
          <Table
            tableId={tableId}
            viewId={viewId}
            fields={fields.filter((f) => !hiddenFields.includes(f.id))}
            createField={(name, type) =>
              createField.mutate({ tableId, name, type })
            }
            createRecord={(numRows, randomData) =>
              createRecord.mutate({ tableId, numRows, randomData })
            }
            sorting={sorting}
            setSorting={setSorting}
            searching={searching}
            setSearching={setSearching}
          />
        </div>
      </div>
    </div>
  );
}
