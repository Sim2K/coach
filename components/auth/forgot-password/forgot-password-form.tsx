"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader2 } from "lucide-react";
import { getAuthRedirectUrl, getBaseUrl } from "@/lib/url-utils";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getBaseUrl()}/auth/reset-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        setIsEmailSent(true);
        toast.success("Password reset instructions have been sent to your email");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold">Check Your Email</h2>
        <p className="text-gray-600">
          We've sent password reset instructions to your email address.
        </p>
        <p className="text-sm text-gray-500">
          Didn't receive an email? Check your spam folder or{" "}
          <button
            onClick={() => setIsEmailSent(false)}
            className="text-indigo-600 hover:text-indigo-500"
          >
            try again
          </button>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
          placeholder="Enter your email address"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending Instructions...
          </>
        ) : (
          "Send Reset Instructions"
        )}
      </Button>

      <div className="text-center text-sm">
        <Link
          href="/auth/login"
          className="text-indigo-600 hover:text-indigo-500"
        >
          Back to Login
        </Link>
      </div>
    </form>
  );
}
