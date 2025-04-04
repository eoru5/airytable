import { auth, signIn } from "~/server/auth";
import TextLogo from "../_components/text-logo";
import GoogleLoginButton from "../_components/google-login-button";
import { redirect } from "next/navigation";

export default async function Login() {
  const session = await auth();
  if (session?.user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative flex items-center justify-center flex-col gap-5">
        {/* center the title+button, with logo floating above cause why not */}
        <div className="absolute -top-30">
          <TextLogo />
        </div>

        <h1 className="text-4xl">
          Sign in
        </h1>

        <GoogleLoginButton onClick={async () => {
          "use server"
          await signIn("google", { redirectTo: "/" })
        }} />
      </div>  
    </div>
  );
}
