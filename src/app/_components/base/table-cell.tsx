import { useEffect, useState } from "react";
import type { TableRecord } from "./table";
import type { Column, Getter, Row, Table } from "@tanstack/react-table";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";

const NUMERIC = /^[-+]?\d*\.?\d*$/;

export default function TableCell({
  getValue,
  row,
  column,
  table,
  types,
  updateNumberCell,
  updateTextCell,
}: {
  getValue: Getter<unknown>;
  row: Row<TableRecord>;
  column: Column<TableRecord, unknown>;
  table: Table<TableRecord>;
  types: Record<string, string>;
  updateNumberCell: (
    value: number | null,
    recordId: number,
    fieldId: number,
  ) => Promise<inferRouterOutputs<AppRouter>["cell"]["updateNumber"]>;

  updateTextCell: (
    value: string | null,
    recordId: number,
    fieldId: number,
  ) => Promise<inferRouterOutputs<AppRouter>["cell"]["updateText"]>;
}) {
  const initialValue = row.original[`f${column.id}`] ? getValue() : "";

  const [value, setValue] = useState(initialValue);
  const onBlur = async () => {
    // keep empty cells in the client-side data object to keep code simple

    const fieldId = column.id;
    try {
      if (types[fieldId] === "Number") {
        const cell = await updateNumberCell(
          value === "" ? null : Number(value),
          Number(row.original.id),
          Number(fieldId),
        );
        // if everything checks out, update the state var
        table.options.meta?.updateData(row.index, column.id, cell);
      } else if (types[fieldId] === "Text") {
        const cell = await updateTextCell(
          value === "" ? null : (value as string),
          Number(row.original.id),
          Number(fieldId),
        );
        // if everything checks out, update the state var
        table.options.meta?.updateData(row.index, column.id, cell);
      }
    } catch (error) {
      console.log("Error occured, resetting value");
      // else reset to init val
      setValue(initialValue);
    }
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <input
      className="h-full w-full px-4 py-1"
      value={value as string}
      onChange={(e) => {
        if (
          (types[column.id] === "Number" &&
            (e.target.value === "" || NUMERIC.test(e.target.value))) ||
          types[column.id] === "Text"
        ) {
          setValue(e.target.value);
        }
      }}
      onBlur={onBlur}
    />
  );
}
