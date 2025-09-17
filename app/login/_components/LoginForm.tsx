"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { Loader2Icon } from "lucide-react";
import { Google } from "developer-icons";
import React, { useTransition } from "react";
import { toast } from "sonner";

const LoginForm = () => {
  const [googleSignInPending, startGoogleSignInTransition] = useTransition();

  async function signInWithGoogle() {
    startGoogleSignInTransition(async () => {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed In Successfully ");
          },
          onError: () => {
            toast.error("Something wrong!");
          },
        },
      });
    });
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl ">Welcome back!</CardTitle>
        <CardDescription>Sign in to continue </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button
          disabled={googleSignInPending}
          onClick={signInWithGoogle}
          className="w-full"
          variant="outline"
        >
          {googleSignInPending ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              <span>Loading ...</span>
            </>
          ) : (
            <>
              Sign in using your Google account
              <Google />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
