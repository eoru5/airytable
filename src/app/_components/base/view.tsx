"use client";

import { Button } from "@headlessui/react";
import { api } from "~/trpc/react";
import Grid from "./grid-icon";
import { useRouter } from "next/navigation";
import Table, { type ColumnFiltersState } from "./table";
import ViewNavbar from "./view-navbar";
import { type SortingState } from "@tanstack/react-table";
import { useState, useEffect } from "react";

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
  const router = useRouter();

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

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [loaded, setLoaded] = useState(false);

  const updateView = () => {
    const currentView = views.find((v) => v.id === viewId)!;
    setSorting((currentView.sort as { id: string; desc: boolean }[]) ?? []);
    setColumnFilters((currentView.filters as ColumnFiltersState) ?? []);
    setLoaded(true);
  };

  useEffect(() => updateView(), [viewId]);

  useEffect(() => {
    // save new filter configs to db
    if (loaded) {
      updateFilter.mutate({ id: viewId, filters: columnFilters });
    }
  }, [columnFilters]);

  useEffect(() => {
    // save new sort configs to db
    if (loaded) {
      updateSort.mutate({ id: viewId, sort: sorting });
    }
  }, [sorting]);

  return (
    <div className="flex h-full w-full flex-col overflow-auto">
      <ViewNavbar
        sorting={sorting}
        setSorting={setSorting}
        fields={fields}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
      />
      <div className="flex h-full w-full overflow-auto">
        <div className="flex h-full w-[300px] flex-col justify-between border-r-1 border-neutral-300 bg-white px-4 py-4 text-sm font-light">
          <div className="flex flex-col gap-1">
            {views.map((view) => (
              <Button
                key={view.id}
                className={`flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-1 transition duration-150 ${view.id === viewId ? "bg-blue-100 hover:bg-blue-200" : "bg-white hover:bg-neutral-300"}`}
                onClick={() => router.push(`/${baseId}/${tableId}/${view.id}`)}
              >
                <div className="flex items-center gap-2">
                  <div className="text-blue-600">
                    <Grid />
                  </div>
                  {view.name}
                </div>
                {view.id === viewId && (
                  <div className="text-black/50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="size-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                      />
                    </svg>
                  </div>
                )}
              </Button>
            ))}
          </div>
          <div>
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
        <div className="h-full w-full">
          <Table
            tableId={tableId}
            viewId={viewId}
            fields={fields}
            createField={(name, type) =>
              createField.mutate({ tableId, name, type })
            }
            createRecord={(numRows, randomData) =>
              createRecord.mutate({ tableId, numRows, randomData })
            }
            sorting={sorting}
            setSorting={setSorting}
          />
        </div>
      </div>
    </div>
  );
}
