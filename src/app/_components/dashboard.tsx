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

  // const renameBase = api.base.rename.useMutation({
  //   onSuccess: async () => {
  //     await utils.base.getAll.invalidate();
  //   }
  // });

  const [bases] = api.base.getAll.useSuspenseQuery();

  return (
    <div className="flex h-screen w-screen flex-col">
      <Navbar />

      <div className="flex grow">
        <Sidebar
          createOnClick={() => createBase.mutate({ name: "Untitled Base" })}
        />
        <div className="flex grow flex-col gap-10 p-10">
          <h1 className="text-3xl font-bold">Home</h1>
          <Suspense fallback={<Loading />}>
            <div className="flex flex-wrap gap-6">
              {bases.map((base, idx) => (
                <BaseCard
                  name={base.name}
                  id={base.id}
                  key={idx}
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
