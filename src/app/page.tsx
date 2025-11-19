import { HydrateClient } from "~/trpc/server";
import { auth } from "~/server/auth/auth";
import HomePageClient from "./_components/HomePageClient";
import UserCalendars from "./pages/UserCalendars/page";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <HomePageClient initialSession={session}>
        {session && (
          <div className="w-full mt-8">
            <UserCalendars />
          </div>
        )}
      </HomePageClient>
    </HydrateClient>
  );
}
