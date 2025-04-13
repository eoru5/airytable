import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Button,
} from "@headlessui/react";

import { useState } from "react";

const types: FieldType[] = ["Text", "Number"];

type FieldType = "Text" | "Number";

export default function AddFieldButton({
  createField,
}: {
  createField: (name: string, type: FieldType) => void;
}) {
  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState(types[0]);

  return (
    <Menu>
      <MenuButton>
        <div
          className="h-full cursor-pointer border-r-1 border-b-1 border-neutral-300 bg-neutral-100 px-4 py-1 transition duration-150 hover:bg-neutral-200"
          role="button"
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
      </MenuButton>

      <MenuItems
        anchor="bottom start"
        transition
        className="z-20 origin-top-right rounded-sm bg-white p-2 text-sm font-light shadow-sm transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
      >
        <MenuItem>
          {({ close }) => (
            <div
              className="flex max-h-[200px] w-[200px] flex-col gap-2"
              onClick={(e) => e.preventDefault()}
            >
              <input
                className="rounded-sm border-1 border-neutral-300 p-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Field name"
              />
              <div className="flex h-full w-full grow flex-col gap-1 overflow-scroll rounded-sm border-1 border-neutral-300 p-1">
                {types.map((type, idx) => (
                  <Button
                    key={idx}
                    className={`cursor-pointer px-2 py-1 text-left transition duration-100 ${selectedType === type ? "bg-neutral-200" : "hover:bg-neutral-100"}`}
                    onClick={() => setSelectedType(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
              <div>
                <div className="flex items-center justify-end gap-1">
                  <div
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      close();
                    }}
                    className="text-md cursor-pointer rounded-sm bg-white px-3 py-1 font-light transition duration-200 ease-in-out hover:bg-neutral-200 hover:active:bg-neutral-300"
                  >
                    Cancel
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      createField(name, selectedType!);
                      close();
                    }}
                    className="text-md cursor-pointer rounded-sm bg-blue-600 px-3 py-1 font-semibold text-white transition duration-200 ease-in-out data-[hover]:bg-blue-700 data-[hover]:data-[active]:bg-blue-800"
                  >
                    Create field
                  </Button>
                </div>
              </div>
            </div>
          )}
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
