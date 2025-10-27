import { HydrateClient } from "~/trpc/server";
import { auth } from "~/server/auth/auth";
import SignIn from "./_components/signInPage";

export default async function Home() {
  const session = await auth();

  if (!session) {
    return <SignIn />;
  }
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          Sign In Successful! <br /> {session.user?.name}
        </div>
      </main>
    </>
  );
}
