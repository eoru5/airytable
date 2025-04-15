import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import { auth } from "~/server/auth";
import type { Metadata } from "next";

export type Props = {
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
    title: `${base.name}: ${table.name} - Airytable`,
  };
}

export default function ViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
