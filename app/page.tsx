"use client";
import { Button } from "@/components/ui/button";
import UserDropDown from "@/components/UserDropDown";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Home() {
  const { data: session, isPending } = authClient.useSession();

  const router = useRouter();
  async function SignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
        onError: () => {
          toast.error("Something wrong!");
        },
      },
    });
  }
  // Simple Landing Page with navbar (logo in right and button to sign in or userProfile)
  return (
    <div className="flex justify-between w-full px-8">
      <h1>hello</h1>
      {isPending ? null : session ? (
        <UserDropDown user={session.user} signOut={SignOut} />
      ) : (
        <Link href="/login" className="cursor-pointer">
          <Button size="lg" className="cursor-pointer font-medium  ">
            دخول
          </Button>
        </Link>
      )}
    </div>
  );
}
