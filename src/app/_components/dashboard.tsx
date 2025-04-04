import { Button } from "@headlessui/react";
import Template from "./template";

export default function Dashboard() {
  return (
    <Template>
      <div className="flex items-center justify-center flex-col gap-5 p-5">
        <h1 className="text-3xl font-bold">Home</h1>
        <Button className="cursor-pointer flex justify-center items-center gap-2 rounded-sm bg-blue-600 py-2 px-3 text-md font-semibold text-white data-[hover]:bg-blue-700 data-[hover]:data-[active]:bg-blue-800 transition duration-200 ease-in-out">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="size-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create
        </Button>
      </div>
    </Template>
  );
}