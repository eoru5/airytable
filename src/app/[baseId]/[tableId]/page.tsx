import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import { auth } from "~/server/auth";

export default async function Page({
  params,
}: {
  params: Promise<{ baseId: string; tableId: string }>;
}) {
  // check user logged in
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // redirect to base/table/view
  const { baseId, tableId } = await params;
  const table = await api.table.getLatestView({ id: tableId });
  if (table?.lastUsedView) {
    redirect(`/${baseId}/${tableId}/${table.lastUsedView.id}`);
  } else {
    redirect("/");
  }
}
