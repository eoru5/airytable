import { redirect } from "next/navigation";
import { api, HydrateClient } from "~/trpc/server";
import { auth } from "~/server/auth";
import type { Metadata } from "next";
import Base from "~/app/_components/base/base";
import { SessionProvider } from "next-auth/react";

type Props = {
  params: Promise<{
    baseId: string;
    tableId: string;
    viewId: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { baseId, tableId, viewId } = await params;
  const { base, table } = await api.base.open({ baseId, tableId, viewId });

  return {
    title: `${base.name}: ${table.name} - Airtable`,
  };
}

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
