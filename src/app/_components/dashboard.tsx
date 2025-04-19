"use client";

import { Suspense } from "react";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import { api } from "~/trpc/react";
import BaseCard from "./base-card";
import Loading from "../loading";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const utils = api.useUtils();
  const router = useRouter();

  const createBase = api.base.create.useMutation({
    onSuccess: async (base) => {
      router.push(`/${base.id}`);
      await utils.base.getAll.invalidate();
    },
  });

  const deleteBase = api.base.delete.useMutation({
    onSuccess: async () => {
      await utils.base.getAll.invalidate();
    },
  });

  const renameBase = api.base.rename.useMutation({
    onSuccess: async () => {
      await utils.base.getAll.invalidate();
    },
  });

  const [bases] = api.base.getAll.useSuspenseQuery();

  return (
    <div className="flex h-screen w-screen flex-col">
      <Navbar />

      <div className="flex grow">
        <Sidebar
          createOnClick={() => createBase.mutate({ name: "Untitled Base" })}
        />
        <div className="flex grow flex-col gap-10 bg-gray-50 p-10">
          <h1 className="text-3xl font-bold">Home</h1>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-light text-neutral-600 tracking-tight">
              <div className="flex items-center gap-1">
                Opened by you
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

              <div className="flex items-center gap-1">
                Show all types
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
            </div>

            <div className="flex items-center gap-1 text-neutral-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-7 cursor-pointer p-1"
              >
                <path
                  fillRule="evenodd"
                  d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z"
                  clipRule="evenodd"
                />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-7 cursor-pointer rounded-full bg-neutral-200 p-1"
              >
                <path
                  fillRule="evenodd"
                  d="M.99 5.24A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25l.01 9.5A2.25 2.25 0 0 1 16.76 17H3.26A2.267 2.267 0 0 1 1 14.74l-.01-9.5Zm8.26 9.52v-.625a.75.75 0 0 0-.75-.75H3.25a.75.75 0 0 0-.75.75v.615c0 .414.336.75.75.75h5.373a.75.75 0 0 0 .627-.74Zm1.5 0a.75.75 0 0 0 .627.74h5.373a.75.75 0 0 0 .75-.75v-.615a.75.75 0 0 0-.75-.75H11.5a.75.75 0 0 0-.75.75v.625Zm6.75-3.63v-.625a.75.75 0 0 0-.75-.75H11.5a.75.75 0 0 0-.75.75v.625c0 .414.336.75.75.75h5.25a.75.75 0 0 0 .75-.75Zm-8.25 0v-.625a.75.75 0 0 0-.75-.75H3.25a.75.75 0 0 0-.75.75v.625c0 .414.336.75.75.75H8.5a.75.75 0 0 0 .75-.75ZM17.5 7.5v-.625a.75.75 0 0 0-.75-.75H11.5a.75.75 0 0 0-.75.75V7.5c0 .414.336.75.75.75h5.25a.75.75 0 0 0 .75-.75Zm-8.25 0v-.625a.75.75 0 0 0-.75-.75H3.25a.75.75 0 0 0-.75.75V7.5c0 .414.336.75.75.75H8.5a.75.75 0 0 0 .75-.75Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <Suspense fallback={<Loading />}>
            <div className="flex flex-wrap gap-6">
              {bases.map((base, idx) => (
                <BaseCard
                  name={base.name}
                  id={base.id}
                  key={idx}
                  renameBase={(name) =>
                    renameBase.mutate({ id: base.id, name })
                  }
                  deleteBase={() => deleteBase.mutate({ id: base.id })}
                />
              ))}
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
