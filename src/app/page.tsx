import { redirect } from 'next/navigation'
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import Loading from './_components/loading';
import Dashboard from './_components/dashboard';

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    // build dashboard
  } else {
    redirect('/login');
  }

  return (
    <HydrateClient>
      <Dashboard />
    </HydrateClient>
  );
}
