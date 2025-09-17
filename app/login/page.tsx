import { auth } from "@/lib/auth";
import LoginForm from "./_components/LoginForm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const LoginPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    return redirect("/dashboard");
  }
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-background">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <LoginForm />
        <div className="text-balance text-center text-xs text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <span className="cursor-pointer hover:underline hover:text-primary">
            Terms of service
          </span>{" "}
          and{" "}
          <span className="hover:underline cursor-pointer hover:text-primary">
            Privacy Policy.
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
