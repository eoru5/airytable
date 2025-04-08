"use client";

import type { $Enums } from "@prisma/client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type CellContext,
  type ColumnDef,
  type NoInfer,
  type RowData,
} from "@tanstack/react-table";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { api } from "~/trpc/react";
import TableCell from "./table-cell";
import { Button } from "@headlessui/react";
import AddFieldButton from "./add-field-button";
import ColumnIcon from "./column-icon";

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

export type TableRecord = Record<string, any>;
type TableRecords = TableRecord[];
type TableFields = {
  id: number;
  name: string;
  tableId: string | null;
  Type: $Enums.fieldtype;
}[];

export default function Table({
  tableId,
  records,
  fields,
  createField,
  createRecord,
}: {
  tableId: string;
  records: TableRecords;
  fields: TableFields;
  createField: (name: string, type: "Text" | "Number") => void;
  createRecord: () => void;
}) {
  const [data, setData] = useState(records);
  useEffect(() => setData(records), [records]);

  const columnHelper = createColumnHelper<TableRecord>();
  const columns = useMemo(
    () =>
      fields.map((f) => ({
        header: () => (
          <div className="flex items-center gap-1">
            <div className="text-neutral-500">
              <ColumnIcon type={f.Type} />
            </div>
            {f.name}
          </div>
        ),
        accessorKey: `${f.id}.value`,
        id: f.id.toString(),
        cell: (props: CellContext<TableRecord, unknown>) => (
          <TableCell
            getValue={props.getValue}
            row={props.row}
            column={props.column}
            table={props.table}
            types={types}
            updateNumberCell={updateNumberCell}
            updateTextCell={updateTextCell}
          />
        ),
      })),
    [fields],
  );

  const types: Record<string, string> = {};
  for (const f of fields) {
    types[f.id.toString()] = f.Type;
  }

  const updateNumberCell = api.cell.updateNumber.useMutation();
  const updateTextCell = api.cell.updateText.useMutation();

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
                  className="border-r-1 border-neutral-300 bg-neutral-100 px-4 py-1 text-left text-sm font-light"
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
              <div
                className="h-full w-full cursor-pointer px-4 py-1 transition duration-150 hover:bg-neutral-200"
                role="button"
                onClick={() => createRecord()}
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
