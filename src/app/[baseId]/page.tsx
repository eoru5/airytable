import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import { auth } from "~/server/auth";

export default async function Page({
  params,
}: {
  params: Promise<{ baseId: string }>;
}) {
  // check user logged in
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // redirect to base/table/view
  const { baseId } = await params;
  const base = await api.base.getLatestTableView({ id: baseId });
  if (base?.lastUsedTable && base?.lastUsedView) {
    redirect(`${baseId}/${base.lastUsedTable.id}/${base.lastUsedView.id}`);
  } else {
    redirect("/");
  }
}
