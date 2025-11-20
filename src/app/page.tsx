import { HydrateClient } from "~/trpc/server";
import { auth } from "~/server/auth/auth";
import HomePageClient from "./_components/HomePageClient";
import UserCalendars from "./pages/UserCalendars/page";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <HomePageClient initialSession={session}>
        
      </HomePageClient>
    </HydrateClient>
  );
}
