"use client";

import { ForgotPasswordForm } from "@/components/auth/forgot-password/forgot-password-form";
import { Card } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md space-y-8 p-6 sm:p-8">
        <div>
          <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Forgot Your Password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>
        <ForgotPasswordForm />
      </Card>
    </div>
  );
}
