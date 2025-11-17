import { HydrateClient } from "~/trpc/server";
import { auth } from "~/server/auth/auth";
import SignIn from "./_components/Authentication/SignIn/signInPage";
import CalendarView from "./_components/CalendarView/[calendarId]";
// import SignOut from "./_components/Authentication/SignOut/signOut";
// import { Sign } from "crypto";
import SignOutButton from "./_components/Authentication/SignOut/signOutButton";
import UserCalendars from "./pages/UserCalendars/page";

export default async function Home() {
  const session = await auth();

  if (!session) {
    return <SignIn />;
  }
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          Sign In Successful! <br /> {session.user.email}
        </div>
        <SignOutButton />

        <div className="w-full">
          <UserCalendars />
        </div>
      </main>
    </HydrateClient>
  );
}
