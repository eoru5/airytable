import { redirect } from "next/navigation";
import { HydrateClient } from "~/trpc/server";
import { auth } from "~/server/auth";
import Base from "~/app/_components/base/base";
import { SessionProvider } from "next-auth/react";
import type { Props } from "./layout";

export default async function Page({ params }: Props) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { baseId, tableId, viewId } = await params;

  return (
    <SessionProvider session={session}>
      <HydrateClient>
        <Base baseId={baseId} tableId={tableId} viewId={viewId} />
      </HydrateClient>
    </SessionProvider>
  );
}
