import { useEffect, useState } from "react";
import type { TableRecord } from "./table";
import type { Column, Getter, Row, Table } from "@tanstack/react-table";

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
  updateNumberCell: any;
  updateTextCell: any;
}) {
  // cell might not exist
  const initialValue = row.original[column.id] ? getValue() : "";

  const [value, setValue] = useState(initialValue);
  const onBlur = async () => {
    // keep empty cells in the client-side data object to keep code simple
    console.log(row.original);

    const fieldId = column.id;
    try {
      let cell = {};
      if (types[fieldId] === "Number") {
        cell = await updateNumberCell.mutateAsync({
          fieldId: Number(fieldId),
          recordId: row.original.recordId,
          value: value === "" ? null : Number(value),
        });
      } else if (types[fieldId] === "Text") {
        cell = await updateTextCell.mutateAsync({
          fieldId: Number(fieldId),
          recordId: row.original.recordId,
          value: value === "" ? null : (value as string),
        });
      }
      // if everything checks out, update the state var
      table.options.meta?.updateData(row.index, column.id, cell);
    } catch (error) {
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
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
    />
  );
}
