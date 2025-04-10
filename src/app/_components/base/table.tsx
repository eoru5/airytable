"use client";

import type { $Enums } from "@prisma/client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type CellContext,
  type HeaderContext,
  type OnChangeFn,
  type RowData,
  type SortingState,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { api } from "~/trpc/react";
import TableCell from "./table-cell";
import AddFieldButton from "./add-field-button";
import ColumnIcon from "./column-icon";
import AddRecordButton from "./add-record-button";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

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
  records,
  fields,
  createField,
  createRecord,
  sorting,
  setSorting,
}: {
  records: TableRecords;
  fields: TableFields;
  createField: (name: string, type: $Enums.fieldtype) => void;
  createRecord: (numRows: number, randomData: boolean) => void;
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
}) {
  const [data, setData] = useState(records);
  useEffect(() => setData(records), [records]);
  const types = useMemo(
    () =>
      fields.reduce((acc, f) => ({ ...acc, [f.id.toString()]: f.Type }), {}),
    [fields],
  );

  const updateNumberCell = api.cell.updateNumber.useMutation();
  const updateTextCell = api.cell.updateText.useMutation();

  const columnHelper = createColumnHelper<TableRecord>();
  const columns = useMemo(
    () =>
      fields.map((f) => ({
        header: (props: HeaderContext<TableRecord, unknown>) => (
          <div
            className="flex cursor-pointer items-center justify-between"
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
        accessorKey: `${f.id}.value`,
        enableMultiSorting: true,
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
      })),
    [fields, types],
  );

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

  return (
    <div className="h-full w-full bg-neutral-200/80">
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              <th className="border-r-1 border-neutral-300 bg-neutral-100 px-4 py-1"></th>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="cursor-pointer border-r-1 border-neutral-300 bg-neutral-100 px-4 py-1 text-left text-sm font-light"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
              <th>
                <AddFieldButton createField={createField} />
              </th>
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              <td className="border-t-1 border-r-1 border-b-1 border-neutral-300 bg-white px-4 py-1 text-sm font-light">
                {Number(row.id) + 1}
              </td>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="border-t-1 border-r-1 border-b-1 border-neutral-300 bg-white text-sm font-light"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td className="border-t-1 border-r-1 border-b-1 border-neutral-300 bg-white text-sm font-light">
              <AddRecordButton createRecord={() => createRecord(1, false)} />
            </td>
            <td className="border-t-1 border-r-1 border-b-1 border-neutral-300 bg-white text-sm font-light">
              <div
                className="flex h-full w-full cursor-pointer items-center justify-center py-1 transition duration-150 hover:bg-neutral-200"
                role="button"
                onClick={() => createRecord(1, true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                (random data)
              </div>
            </td>
            <td className="border-t-1 border-r-1 border-b-1 border-neutral-300 bg-white text-sm font-light">
              <div
                className="flex h-full w-full cursor-pointer items-center justify-center py-1 transition duration-150 hover:bg-neutral-200"
                role="button"
                onClick={() => createRecord(10, true)} // change to 100000 after virtualisation impemented
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                100k (random data)
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot>
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
    </div>
  );
}
