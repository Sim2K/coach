"use client";

import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col-reverse md:flex-row">
      <div className="w-full md:w-1/2 relative bg-muted flex flex-col overflow-hidden min-h-[50vh] md:min-h-screen text-white p-4 md:p-8">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600 to-indigo-600" />
        <div className="bg-dots absolute inset-0 opacity-10" />
        <div className="floating-shapes" />
        <div className="absolute inset-0 flex items-center justify-center opacity-35 pointer-events-none">
          <div className="w-48 h-48 bg-[url('/images/svg/veedence_logo.svg')] bg-contain bg-no-repeat bg-center" />
        </div>
        <div className="auth-logo">
          <div className="mr-2 h-8 w-8 bg-[url('/images/svg/veedence_logo.svg')] bg-contain bg-no-repeat bg-center" />
          Another Veedence.co.uk idea
        </div>
        <div className="relative z-20 flex flex-col justify-center flex-1 px-4 md:px-8">
          <h1 className="text-2xl md:text-3xl font-bold leading-relaxed max-w-xl italic font-serif text-center mx-auto">
            Start Your Journey with Veedence! Sign up now to unlock personalized, AI-powered coaching tailored just for you. Your goals, milestones, and progress—everything in one seamless platform!
          </h1>
        </div>
        <svg
          className="curved-line"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
        >
          <path
            d="M0,500 C200,300 800,700 1000,500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md mx-4 md:mx-0 space-y-6">
          <div className="w-48 h-12 bg-[url('/images/svg/veedence_logo_wide.svg')] bg-contain bg-no-repeat bg-left mb-8" />
          <div className="flex flex-col space-y-2 text-center">
            <h2 className="auth-heading">Sign Up!</h2>
            <p className="auth-subheading mb-3">
              You are just a few mins away from getting your personal Accountability Life Coach!
            </p>
          </div>
          <RegisterForm />
          <p className="text-center">
            <Link href="/auth/login" className="auth-link">
              Already have an account, then what are you doing here?! Sign in here to continue achieving your goals!!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}