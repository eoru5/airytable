import { redirect } from 'next/navigation'
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import { SessionProvider } from "next-auth/react"
import Dashboard from './_components/dashboard';

export default async function Home() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <SessionProvider session={session}>
      <HydrateClient>
        <Dashboard />
      </HydrateClient>
    </SessionProvider>
  );
}
