"use client";

import type { $Enums } from "@prisma/client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type CellContext,
  type HeaderContext,
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
type TableFields = {
  id: number;
  name: string;
  tableId: string | null;
  Type: $Enums.fieldtype;
}[];

export default function Table({
  records,
  fields,
  createField,
  createRecord,
  updateSort,
}: {
  records: TableRecords;
  fields: TableFields;
  createField: (name: string, type: $Enums.fieldtype) => void;
  createRecord: (numRows: number, randomData: boolean) => void;
  updateSort: (sort: SortingState) => void;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  useEffect(() => updateSort(sorting), [sorting]);

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
            className="flex cursor-pointer items-center gap-1"
            onClick={props.column.getToggleSortingHandler()}
          >
            <div className="text-neutral-500">
              <ColumnIcon type={f.Type} />
            </div>
            {f.name}
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
                {row.id}
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
