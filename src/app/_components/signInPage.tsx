import { signIn } from "~/server/auth/auth";

export default function SignIn() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <button
        className="rounded-xl border p-3"
        onClick={async () => {
          "use server";
          await signIn("google", { redirectTo: "/" });
        }}
      >
        Sign In With Google
      </button>
    </div>
  );
}
