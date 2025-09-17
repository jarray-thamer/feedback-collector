"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import UserDropDown from "@/components/UserDropDown";

type User = {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null | undefined;
};

export default function DashboardUserMenu({ user }: { user: User }) {
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

  return <UserDropDown user={user} signOut={SignOut} />;
}
