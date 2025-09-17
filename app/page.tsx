"use client";
import { Button } from "@/components/ui/button";
import UserDropDown from "@/components/UserDropDown";
import { DarkToggler } from "@/components/DarkToggler";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  MessageSquareHeart,
  BarChart3,
  QrCode,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TestimonialsColumn } from "@/components/testimonials-columns-1";
import { Pricing } from "@/components/pricing";

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

  const testimonials = [
    {
      text: "QuickFeedback+ makes collecting feedback from attendees effortless. The live ratings and comments help us improve every event.",
      image: "https://randomuser.me/api/portraits/men/10.jpg",
      name: "Adam Clarke",
      role: "Event Manager",
    },
    {
      text: "The photo-sharing feature is brilliant. Attendees love uploading their moments, and it adds a lively touch to our dashboard.",
      image: "https://randomuser.me/api/portraits/men/11.jpg",
      name: "Bilal Ahmed",
      role: "Hotel Operations Manager",
    },
    {
      text: "Integrating QuickFeedback+ was smooth and quick. Our team can now see ratings, tags, and comments in real-time.",
      image: "https://randomuser.me/api/portraits/men/12.jpg",
      name: "Cameron Diaz",
      role: "Conference Coordinator",
    },
    {
      text: "The analytics dashboard provides actionable insights. We can identify trends and improve our events immediately.",
      image: "https://randomuser.me/api/portraits/men/13.jpg",
      name: "Omar Raza",
      role: "CEO",
    },
    {
      text: "Attendees love how easy it is to give feedback, and we love how organized it is. QuickFeedback+ transformed our workflow.",
      image: "https://randomuser.me/api/portraits/men/14.jpg",
      name: "Zain Malik",
      role: "Project Manager",
    },
    {
      text: "The setup was straightforward. We now have a central place to collect ratings, comments, and photos from all our events.",
      image: "https://randomuser.me/api/portraits/men/15.jpg",
      name: "Ayaan Khan",
      role: "Business Analyst",
    },
    {
      text: "We can now see live attendee feedback, identify what works, and take action faster than ever.",
      image: "https://randomuser.me/api/portraits/men/16.jpg",
      name: "Farhan Siddiqui",
      role: "Marketing Director",
    },
    {
      text: "QuickFeedback+ exceeded our expectations. The interface is intuitive and our guests enjoy giving feedback.",
      image: "https://randomuser.me/api/portraits/men/17.jpg",
      name: "Sami Sheikh",
      role: "Sales Manager",
    },
    {
      text: "The combination of ratings, tags, comments, and photos gives us a complete view of attendee satisfaction.",
      image: "https://randomuser.me/api/portraits/men/18.jpg",
      name: "Hassan Ali",
      role: "E-commerce Manager",
    },
  ];

  const firstColumn = testimonials.slice(0, 3);
  const secondColumn = testimonials.slice(3, 6);
  const thirdColumn = testimonials.slice(6, 9);

  const demoPlans = [
    {
      name: "STARTER",
      price: "50",
      yearlyPrice: "40",
      period: "per month",
      features: [
        "Up to 5 events",
        "Basic analytics dashboard",
        "Collect ratings & comments",
        "Limited photo uploads",
        "Email support",
      ],
      description: "Perfect for small events and first-time users",
      buttonText: "Start Free Trial",
      href: "/sign-up",
      isPopular: false,
    },
    {
      name: "PROFESSIONAL",
      price: "99",
      yearlyPrice: "79",
      period: "per month",
      features: [
        "Unlimited events",
        "Advanced analytics & charts",
        "Collect ratings, tags & comments",
        "Photo wall with consent management",
        "24-hour support response",
        "Team collaboration features",
        "Customizable event branding",
      ],
      description: "Ideal for organizers running multiple events",
      buttonText: "Get Started",
      href: "/sign-up",
      isPopular: true,
    },
    {
      name: "ENTERPRISE",
      price: "299",
      yearlyPrice: "239",
      period: "per month",
      features: [
        "Everything in Professional",
        "Custom analytics & dashboards",
        "Dedicated account manager",
        "Priority support response",
        "SSO Authentication",
        "Advanced security controls",
        "Custom integrations & workflow",
        "SLA agreement for uptime",
      ],
      description: "For large organizations or high-volume events",
      buttonText: "Contact Sales",
      href: "/contact",
      isPopular: false,
    },
  ];

  return (
    <div className="flex min-h-svh flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <QrCode className="h-5 w-5 text-primary" />
            <span className="tracking-tight">QuickFeedback+</span>
          </Link>
          <div className="flex items-center gap-2">
            <DarkToggler />
            {isPending ? null : session ? (
              <UserDropDown user={session.user} signOut={SignOut} />
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link href="/login">
                  <Button className="font-medium">Get started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl flex-1 px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center gap-6">
          <Badge className="rounded-full px-3 py-1" variant="secondary">
            Collect event feedback in seconds
          </Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
            Turn attendee feedback into insights you can act on
          </h1>
          <p className="text-balance max-w-2xl text-muted-foreground md:text-lg">
            Create a feedback collector, share a QR code at your event, and
            watch responses roll in — no setup headaches.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {session ? (
              <Link href="/dashboard">
                <Button size="lg" className="font-medium">
                  Go to dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button size="lg" className="font-medium">
                    Create your first collector
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    Try a demo
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 md:pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6 flex flex-col gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold">Set up for any event</h3>
            <p className="text-sm text-muted-foreground">
              Create collectors tailored to talks, workshops, or full
              conferences.
            </p>
          </Card>
          <Card className="p-6 flex flex-col gap-2">
            <QrCode className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold">Scan to respond</h3>
            <p className="text-sm text-muted-foreground">
              Share a QR code and gather responses without friction.
            </p>
          </Card>
          <Card className="p-6 flex flex-col gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold">See insights instantly</h3>
            <p className="text-sm text-muted-foreground">
              Track satisfaction and comments in real time on your dashboard.
            </p>
          </Card>
        </div>
      </section>

      {/* Social proof */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-12">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <MessageSquareHeart className="h-4 w-4" />
          Loved by organizers and speakers alike
        </div>

        <section className="bg-background my-20 relative">
          <div className="container z-10 mx-auto">
            <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
              <TestimonialsColumn testimonials={firstColumn} duration={15} />
              <TestimonialsColumn
                testimonials={secondColumn}
                className="hidden md:block"
                duration={19}
              />
              <TestimonialsColumn
                testimonials={thirdColumn}
                className="hidden lg:block"
                duration={17}
              />
            </div>
          </div>
        </section>
      </section>

      <Pricing
        plans={demoPlans}
        title="Simple, Transparent Pricing"
        description="Choose the plan that works for you\nAll plans include access to our platform, lead generation tools, and dedicated support."
      />

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} QuickFeedback+</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-foreground">
              Pricing
            </Link>
            <Link href="/login" className="hover:text-foreground">
              Docs
            </Link>
            <Link href="/login" className="hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
