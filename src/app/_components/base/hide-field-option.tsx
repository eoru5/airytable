"use client";

import { Switch } from "@headlessui/react";
import ColumnIcon from "./column-icon";
import type { OnChangeFn } from "@tanstack/react-table";

export default function HideFieldOption({
  name,
  type,
  fieldId,
  hiddenFields,
  setHiddenFields,
}: {
  name: string;
  type: string;
  fieldId: number;
  hiddenFields: number[];
  setHiddenFields: OnChangeFn<number[]>;
}) {
  // enabled means column is shown, ie not filter
  const enabled = !hiddenFields.includes(fieldId);

  const onChange = () => {
    const newHiddenFields = [...hiddenFields];
    if (!enabled) newHiddenFields.splice(newHiddenFields.indexOf(fieldId), 1);
    else newHiddenFields.push(fieldId);
    setHiddenFields(newHiddenFields);
  };

  return (
    <div
      className="flex cursor-pointer items-center justify-between gap-1 rounded-sm px-2 py-1 transition duration-150 hover:bg-neutral-200"
      onClick={onChange}
    >
      <div className="flex items-center gap-1">
        <div className="text-neutral-500">
          <ColumnIcon type={type} />
        </div>
        {name}
      </div>
      <Switch
        checked={enabled}
        onChange={onChange}
        className="group relative flex h-5 w-10 cursor-pointer rounded-full bg-neutral-200 p-1 transition-colors duration-200 ease-in-out focus:outline-none data-[checked]:bg-emerald-700 data-[focus]:outline-1 data-[focus]:outline-white"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none inline-block size-3 translate-x-0 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5"
        />
      </Switch>
    </div>
  );
}
