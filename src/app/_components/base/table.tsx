"use client";

import type { $Enums } from "@prisma/client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type CellContext,
  type ColumnDef,
  type HeaderContext,
  type OnChangeFn,
  type Row,
  type RowData,
  type SortingState,
} from "@tanstack/react-table";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { api } from "~/trpc/react";
import TableCell from "./table-cell";
import AddFieldButton from "./add-field-button";
import ColumnIcon from "./column-icon";
import AddRecordButton from "./add-record-button";
import { useVirtualizer } from "@tanstack/react-virtual";
import { keepPreviousData } from "@tanstack/react-query";
import LoadingCircle from "../loading-circle";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

export enum NumberFilters {
  LessThan = "<",
  GreaterThan = ">",
}
export enum TextFilters {
  Is = "is",
  Contains = "contains",
  DoesNotContain = "does not contain",
  IsEmpty = "is empty",
  IsNotEmpty = "is not empty",
}
export type FilterType = NumberFilters | TextFilters;

export type ColumnFilter = {
  id: string; // field id
  type: FilterType;
  value?: string;
};

export const numberFilters = ["<", ">"];

export const textFilters = [
  "is",
  "contains",
  "does not contain",
  "is empty",
  "is not empty",
];

export type ColumnFiltersState = ColumnFilter[];

export type TableRecord = Record<string, unknown>;
type TableRecords = TableRecord[];
export type TableField = {
  id: number;
  name: string;
  tableId: string | null;
  Type: $Enums.fieldtype;
};
export type TableFields = TableField[];

export default function Table({
  tableId,
  viewId,
  fields,
  createField,
  createRecord,
  sorting,
  setSorting,
}: {
  tableId: string;
  viewId: string;
  fields: TableFields;
  createField: (name: string, type: $Enums.fieldtype) => void;
  createRecord: (numRows: number, randomData: boolean) => void;
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
}) {
  const tableContainerRef = useRef(null);
  const types = useMemo(
    () =>
      fields.reduce((acc, f) => ({ ...acc, [f.id.toString()]: f.Type }), {}),
    [fields],
  );

  const updateNumberCell = api.cell.updateNumber.useMutation();
  const updateTextCell = api.cell.updateText.useMutation();

  const columnHelper = createColumnHelper<TableRecord>();
  const columns = useMemo(() => {
    const cols: ColumnDef<TableRecord, unknown>[] = [
      {
        header: "",
        id: "id",
        enableSorting: false,
        cell: (props: CellContext<TableRecord, unknown>) => (
          <div className="h-full w-full px-4 py-1">
            {(table
              .getSortedRowModel()
              ?.flatRows?.findIndex((flatRow) => flatRow.id === props.row.id) ||
              0) + 1}
          </div>
        ),
      },
    ];

    fields.forEach((f) =>
      cols.push({
        header: (props: HeaderContext<TableRecord, unknown>) => (
          <div
            className="flex h-full w-full cursor-pointer items-center justify-between px-4 py-1"
            onClick={props.column.getToggleSortingHandler()}
          >
            <div className="flex items-center gap-1">
              <div className="text-neutral-500">
                <ColumnIcon type={f.Type} />
              </div>
              {f.name}
            </div>

            <div className="text-neutral-600">
              {props.column.getIsSorted() === "asc" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.47 6.47a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L10 8.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06l4.25-4.25Z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {props.column.getIsSorted() === "desc" && (
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
              )}
            </div>
          </div>
        ),
        accessorKey: `f${f.id}`,
        enableMultiSort: true,
        id: f.id.toString(),
        cell: (props: CellContext<TableRecord, unknown>) => (
          <TableCell
            getValue={props.getValue}
            row={props.row}
            column={props.column}
            table={props.table}
            types={types}
            updateNumberCell={(value, recordId, fieldId) =>
              updateNumberCell.mutateAsync({ fieldId, recordId, value })
            }
            updateTextCell={(value, recordId, fieldId) =>
              updateTextCell.mutateAsync({ fieldId, recordId, value })
            }
          />
        ),
      }),
    );

    return cols;
  }, [fields, types]);

  const {
    data: records,
    fetchNextPage,
    isFetching,
    isPending,
  } = api.table.getRecords.useInfiniteQuery(
    {
      tableId,
      viewId,
      limit: 50,
    },

    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
      placeholderData: keepPreviousData,
    },
  );

  const [data, setData] = useState<TableRecord[]>([]);

  useEffect(() => {
    if (records?.pages) {
      setData(records.pages.flatMap((page) => page.records));
    }
  }, [records]);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: (rowIndex, columnId, cell) =>
        setData((prev) =>
          prev.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...prev[rowIndex],
                [columnId]: cell,
              };
            } else {
              return row;
            }
          }),
        ),
    },
    isMultiSortEvent: () => true, // always multi sort instead of needing to press shift
    manualSorting: true,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    enableMultiSort: true,
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 35,
    getScrollElement: () => tableContainerRef.current,
    measureElement:
      typeof window !== "undefined" && !navigator.userAgent.includes("Firefox")
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 10,
  });

  const nextCursor = records?.pages[records.pages.length - 1]?.nextCursor;

  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        // once the user has scrolled within 500px of the bottom of the table, fetch more data if we can
        if (
          scrollHeight - scrollTop - clientHeight < 500 &&
          !isFetching &&
          nextCursor
        ) {
          fetchNextPage().catch((err) => {
            console.log(err)
          });
        }
      }
    },
    [fetchNextPage, isFetching, nextCursor],
  );

  // a check on mount and after a fetch to see if the table is already scrolled to the bottom and immediately needs to fetch more data
  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  return isPending ? (
    <div className="flex h-full w-full items-center justify-center">
      <LoadingCircle />
    </div>
  ) : (
    <div
      className="relative h-full w-full overflow-auto bg-neutral-200/80"
      ref={tableContainerRef}
      onScroll={(e) => fetchMoreOnBottomReached(e.currentTarget)}
    >
      <table className="grid">
        <thead className="sticky top-0 z-1 grid">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="flex w-full">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{
                    width: header.getSize(),
                  }}
                  className="flex border-r-1 border-b-1 border-neutral-300 bg-neutral-100 text-left text-sm font-light"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
              <th className="flex">
                <AddFieldButton createField={createField} />
              </th>
            </tr>
          ))}
        </thead>
        <tbody
          className="relative grid"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index] as Row<TableField>;
            return (
              <tr
                data-index={virtualRow.index}
                ref={(node) => rowVirtualizer.measureElement(node)}
                key={row.id}
                className="absolute flex w-full"
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{
                      width: cell.column.getSize(),
                    }}
                    className="flex border-r-1 border-b-1 border-neutral-300 bg-white text-sm font-light"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
        <tfoot className="grid">
          <tr className="flex">
            <td className="flex border-r-1 border-b-1 border-neutral-300 bg-white text-sm font-light">
              <AddRecordButton createRecord={() => createRecord(1, false)} />
            </td>

            <td className="flex border-r-1 border-b-1 border-neutral-300 bg-white text-sm font-light">
              <AddRecordButton
                createRecord={() => createRecord(1, true)}
                text="(random data)"
              />
            </td>
            <td className="flex border-r-1 border-b-1 border-neutral-300 bg-white text-sm font-light">
              <AddRecordButton
                createRecord={() => createRecord(100000, true)}
                text="100k (random data)"
              />
            </td>
          </tr>

          {table.getFooterGroups().map((footerGroup) => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
      {isFetching && (
        <div className="my-5 ml-10 flex items-center gap-2">
          <LoadingCircle size={0.5} />
          Fetching More...
        </div>
      )}
    </div>
  );
}
