import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare, FolderKanban, QrCode } from "lucide-react";
import CreateCollectorDialog from "./_components/CreateCollectorDialog";
import { requireUser } from "@/lib/require-user";
import DashboardUserMenu from "./_components/DashboardUserMenu";
import { DarkToggler } from "@/components/DarkToggler";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireUser();

  return (
    <div className="flex min-h-svh">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col gap-4 border-r bg-background p-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <QrCode className="h-5 w-5 text-primary" />
          <span>QuickFeedback+</span>
        </Link>
        <CreateCollectorDialog />
        <nav className="mt-2 flex flex-col gap-1">
          <a
            href="#feedbacks"
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
          >
            <MessageSquare className="h-4 w-4" />
            Feedbacks
          </a>
          <a
            href="#collectors"
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
          >
            <FolderKanban className="h-4 w-4" />
            Collectors
          </a>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4">
          <h1 className="text-base font-semibold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <DarkToggler />
            <DashboardUserMenu user={session.user} />
          </div>
        </header>
        <main className="flex-1 space-y-10 p-4">{children}</main>
      </div>
    </div>
  );
}
