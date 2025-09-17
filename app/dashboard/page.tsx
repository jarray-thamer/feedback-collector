"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import UserDropDown from "@/components/UserDropDown";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, MessageSquare, FolderKanban, QrCode } from "lucide-react";

export default function DashboardPage() {
  const { data: session } = authClient.useSession();
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

  return (
    <div className="flex min-h-svh">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col gap-4 border-r bg-background p-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <QrCode className="h-5 w-5 text-primary" />
          <span>QuickFeedback+</span>
        </Link>
        <Link href="#">
          <Button className="w-full justify-start gap-2 font-medium">
            <Plus className="h-4 w-4" />
            Create collector
          </Button>
        </Link>
        <nav className="mt-2 flex flex-col gap-1">
          <Link
            href="#feedbacks"
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
          >
            <MessageSquare className="h-4 w-4" />
            Feedbacks
          </Link>
          <Link
            href="#collectors"
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
          >
            <FolderKanban className="h-4 w-4" />
            Collectors
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4">
          <h1 className="text-base font-semibold">Dashboard</h1>
          <div className="flex items-center gap-2">
            {session ? (
              <UserDropDown user={session.user} signOut={SignOut} />
            ) : (
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
            )}
          </div>
        </header>
        <main className="flex-1 space-y-10 p-4">
          <section id="feedbacks">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Feedbacks</h2>
              <Link href="#">
                <Button variant="outline" size="sm" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  View all
                </Button>
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              No feedback yet. Share your collector to start receiving
              responses.
            </div>
          </section>

          <section id="collectors">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Collectors</h2>
              <Link href="#">
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  New collector
                </Button>
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              You don’t have any collectors yet.
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
