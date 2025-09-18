"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import CreateCollectorDialog from "./_components/CreateCollectorDialog";
import CollectorsList from "./_components/CollectorsList";

export default function DashboardPage() {
  return (
    <>
      <section id="feedbacks">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Feedbacks</h2>
          <Link href="/dashboard/feedbacks">
            <Button variant="outline" size="sm" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              View all
            </Button>
          </Link>
        </div>
        <div className="text-sm text-muted-foreground">
          No feedback yet. Share your collector to start receiving responses.
        </div>
      </section>

      <section id="collectors">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Latest collectors</h2>
          <CreateCollectorDialog />
        </div>
        <CollectorsList />
      </section>
    </>
  );
}
