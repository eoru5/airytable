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
  type Dispatch,
  type SetStateAction,
} from "react";
import { api } from "~/trpc/react";
import TableCell from "./table-cell";
import AddFieldButton from "./add-field-button";
import AddRecordButton from "./add-record-button";
import { useVirtualizer } from "@tanstack/react-virtual";
import { keepPreviousData } from "@tanstack/react-query";
import LoadingCircle from "../loading-circle";
import TableHeader from "./table-header";
import TableNumberCell from "./table-number-cell";

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
  searching,
  setSearching,
}: {
  tableId: string;
  viewId: string;
  fields: TableFields;
  createField: (name: string, type: $Enums.fieldtype) => void;
  createRecord: (numRows: number, randomData: boolean) => void;
  sorting: SortingState;
  setSorting: Dispatch<SetStateAction<SortingState>>;
  searching: boolean;
  setSearching: Dispatch<SetStateAction<boolean>>;
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

  const [searchPos, setSearchPos] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<
    { rIdx: number; rId: number; fId: number }[]
  >([]);

  const columns = useMemo(() => {
    const cols: ColumnDef<TableRecord, unknown>[] = [
      {
        header: "",
        id: "id",
        enableSorting: false,
        cell: (props: CellContext<TableRecord, unknown>) => (
          <TableNumberCell
            index={
              (table
                .getSortedRowModel()
                ?.flatRows?.findIndex(
                  (flatRow) => flatRow.id === props.row.id,
                ) || 0) + 1
            }
            recordId={props.row.original.id as number}
          />
        ),
      },
    ];

    fields.forEach((f) =>
      cols.push({
        header: (props: HeaderContext<TableRecord, unknown>) => (
          <TableHeader props={props} field={f} />
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
            highlight={
              searchPos !== null &&
              search !== "" &&
              searchResults.length > 0 &&
              props.getValue() !== undefined &&
              String(props.getValue()).includes(search)
            }
            highlightDark={
              searchPos === null
                ? false
                : searchResults[searchPos]?.rId === props.row.original.id &&
                  searchResults[searchPos]?.fId.toString() === props.column.id
            }
          />
        ),
      }),
    );

    return cols;
  }, [fields, types, search, searchResults, searchPos]);

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

  const utils = api.useUtils();

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
      updateData: (rowIndex, columnId, value) =>
        setData((prev) =>
          prev.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...prev[rowIndex],
                [`f${columnId}`]: value,
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
            console.log(err);
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

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (searching && inputRef.current) {
      inputRef.current.focus();
    } else {
      setSearchResults([]);
      setSearchPos(null);
    }
  }, [searching]);

  const { refetch, isPending: searchIsPending } = api.table.search.useQuery(
    { tableId, viewId, search },
    { enabled: false },
  );

  useEffect(() => {
    if (searchPos !== null && !!table.getRowModel().rows.length) {
      const r = searchResults[searchPos];
      if (!r) return;
      const idx = data.findIndex((row) => Number(row.id) === r.rId);
      if (idx !== -1) {
        const virtualItems = rowVirtualizer.getVirtualItems();
        const firstVisible = virtualItems[0]?.index;
        const lastVisible = virtualItems[virtualItems.length - 1]?.index;

        if (idx < (firstVisible ?? -1) || idx > (lastVisible ?? -1)) {
          rowVirtualizer.scrollToIndex?.(idx, { align: "start" });
        }
      }
    }
  }, [searchPos, data]);

  useEffect(() => {
    if (search !== "") {
      setSearchResults([]);
      refetch()
        .then(({ data }) => {
          // need to use the latest search string
          if (data?.search === search) {
            setSearchPos(0);
            setSearchResults(data.results);
            console.log(data.results);
          }
        })
        .catch((err) => console.log(err));
    }
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F4" || (e.ctrlKey && e.key === "f")) {
        e.preventDefault();
        if (searching) {
          inputRef?.current?.focus();
        } else {
          setSearching(true);
        }
      }
      if (e.key === "Escape" && searching) {
        e.preventDefault();
        setSearching(false);
      }
      if (
        e.key === "Enter" &&
        search !== "" &&
        searchResults.length > 0 &&
        searchPos !== null
      ) {
        if (e.shiftKey) {
          changeSearchPos(
            (searchPos - 1 + searchResults.length) % searchResults.length,
          );
        } else {
          changeSearchPos((searchPos + 1) % searchResults.length);
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searching, inputRef, search, searchResults, searchPos]);

  // make sure we have the data before actually setting it
  const changeSearchPos = (pos: number) => {
    const r = searchResults[pos];
    if (!r) return;
    if (r.rIdx > data.length - 1) {
      utils.table.getRecords
        .fetch({
          tableId,
          viewId,
          limit: r.rIdx - data.length,
          cursor: nextCursor,
        })
        .then((newData) => {
          utils.table.getRecords.setInfiniteData(
            { tableId, viewId, limit: 50 },
            (oldData) => ({
              pages: [...(oldData?.pages ?? []), newData],
              pageParams: [
                ...(oldData?.pageParams ?? []),
                newData.nextCursor ?? null,
              ],
            }),
          );
          setSearchPos(pos);
        })
        .catch((err) => console.log(err));
    } else {
      setSearchPos(pos);
    }
  };

  return isPending ? (
    <div className="flex h-full w-full items-center justify-center">
      <LoadingCircle />
    </div>
  ) : (
    <div className="relative h-full w-full overflow-auto bg-neutral-200/80">
      {searching && (
        <div className="absolute top-0 right-0 z-20 mr-4 flex w-[300px] flex-col border-1 border-t-0 border-neutral-300 bg-white text-sm font-light select-none">
          <div className="flex items-center justify-between gap-2 px-2 py-1.5">
            <input
              className="w-0 flex-1 px-2 py-1 outline-none"
              placeholder="Find in view"
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex items-center justify-end gap-2 text-neutral-500">
              {search !== "" &&
                (!searchIsPending ? (
                  <div className="flex items-center gap-0.5">
                    {searchPos !== null &&
                      (searchResults[searchPos]?.rIdx ?? 0) >
                        data.length - 1 && (
                        <svg
                          width="13.5"
                          height="13.5"
                          viewBox="0 0 54 54"
                          style={{ shapeRendering: "geometricPrecision" }}
                          fill="currentColor"
                          className="animate-spin-scale"
                          data-testid="loading-spinner"
                        >
                          <path d="M10.9,48.6c-1.6-1.3-2-3.6-0.7-5.3c1.3-1.6,3.6-2.1,5.3-0.8c0.8,0.5,1.5,1.1,2.4,1.5c7.5,4.1,16.8,2.7,22.8-3.4c1.5-1.5,3.8-1.5,5.3,0c1.4,1.5,1.4,3.9,0,5.3c-8.4,8.5-21.4,10.6-31.8,4.8C13,50.1,11.9,49.3,10.9,48.6z" />
                          <path d="M53.6,31.4c-0.3,2.1-2.3,3.5-4.4,3.2c-2.1-0.3-3.4-2.3-3.1-4.4c0.2-1.1,0.2-2.2,0.2-3.3c0-8.7-5.7-16.2-13.7-18.5c-2-0.5-3.2-2.7-2.6-4.7s2.6-3.2,4.7-2.6C46,4.4,53.9,14.9,53.9,27C53.9,28.5,53.8,30,53.6,31.4z" />
                          <path d="M16.7,1.9c1.9-0.8,4.1,0.2,4.8,2.2s-0.2,4.2-2.1,5c-7.2,2.9-12,10-12,18.1c0,1.6,0.2,3.2,0.6,4.7c0.5,2-0.7,4.1-2.7,4.6c-2,0.5-4-0.7-4.5-2.8C0.3,31.5,0,29.3,0,27.1C0,15.8,6.7,5.9,16.7,1.9z" />
                        </svg>
                      )}
                    <div className="max-w-[50px] overflow-hidden text-xs tracking-tight text-nowrap text-ellipsis">
                      {searchPos !== null && searchResults.length > 0
                        ? searchPos + 1
                        : 0}{" "}
                      of {searchResults.length}
                    </div>
                  </div>
                ) : (
                  <svg
                    width="13.5"
                    height="13.5"
                    viewBox="0 0 54 54"
                    style={{ shapeRendering: "geometricPrecision" }}
                    fill="currentColor"
                    className="animate-spin-scale"
                    data-testid="loading-spinner"
                  >
                    <path d="M10.9,48.6c-1.6-1.3-2-3.6-0.7-5.3c1.3-1.6,3.6-2.1,5.3-0.8c0.8,0.5,1.5,1.1,2.4,1.5c7.5,4.1,16.8,2.7,22.8-3.4c1.5-1.5,3.8-1.5,5.3,0c1.4,1.5,1.4,3.9,0,5.3c-8.4,8.5-21.4,10.6-31.8,4.8C13,50.1,11.9,49.3,10.9,48.6z" />
                    <path d="M53.6,31.4c-0.3,2.1-2.3,3.5-4.4,3.2c-2.1-0.3-3.4-2.3-3.1-4.4c0.2-1.1,0.2-2.2,0.2-3.3c0-8.7-5.7-16.2-13.7-18.5c-2-0.5-3.2-2.7-2.6-4.7s2.6-3.2,4.7-2.6C46,4.4,53.9,14.9,53.9,27C53.9,28.5,53.8,30,53.6,31.4z" />
                    <path d="M16.7,1.9c1.9-0.8,4.1,0.2,4.8,2.2s-0.2,4.2-2.1,5c-7.2,2.9-12,10-12,18.1c0,1.6,0.2,3.2,0.6,4.7c0.5,2-0.7,4.1-2.7,4.6c-2,0.5-4-0.7-4.5-2.8C0.3,31.5,0,29.3,0,27.1C0,15.8,6.7,5.9,16.7,1.9z" />
                  </svg>
                ))}

              {search !== "" &&
                !searchIsPending &&
                searchResults.length > 0 &&
                searchPos !== null && (
                  <div className="flex">
                    <div
                      className="cursor-pointer rounded-l-sm transition duration-200 hover:bg-neutral-200"
                      role="button"
                      onClick={() =>
                        changeSearchPos((searchPos + 1) % searchResults.length)
                      }
                    >
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
                    <div
                      className="cursor-pointer rounded-r-sm transition duration-200 hover:bg-neutral-200"
                      role="button"
                      onClick={() =>
                        changeSearchPos(
                          (searchPos - 1 + searchResults.length) %
                            searchResults.length,
                        )
                      }
                    >
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
                    </div>
                  </div>
                )}

              <div
                className="cursor-pointer transition duration-200 hover:text-black"
                role="button"
                onClick={() => setSearching(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="size-5"
                >
                  <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-neutral-100 px-4 py-2.5 text-xs font-light">
            {search !== "" && searchResults.length > 0
              ? `Found ${searchResults.length} cells`
              : "Enter search term above"}
          </div>
        </div>
      )}
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
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
    </div>
  );
}
