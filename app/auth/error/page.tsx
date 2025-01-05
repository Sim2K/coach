"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md space-y-8 p-6 sm:p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            The password reset link is invalid or has expired. Please try requesting a new password reset.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href="/auth/forgot-password">
            Request New Password Reset
          </Link>
        </Button>
      </Card>
    </div>
  );
}
