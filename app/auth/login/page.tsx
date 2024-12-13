"use client";

import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { useState } from "react";
import { LandingSection } from "@/components/auth/landing-section";
import { LoginForm } from "@/components/auth/login-form";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Login | Veedence Accountability Coaching | AI-Powered Personal Growth Dashboard",
  "description": "Log in to Veedence's AI-powered accountability coaching platform. Track your goals, uncover hidden potential, and experience a coach that remembers your journey and adjusts to your needs.",
  "url": "https://veedence.co.uk/login",
  "mainEntity": {
    "@type": "Organization",
    "name": "Veedence Accountability Coaching",
    "description": "An AI-driven coaching service offering personalized goal tracking, milestone progress, and tailored guidance through advanced AI and ChatGPT technology."
  }
};

export default function LoginPage() {
  const [showLoginMobile, setShowLoginMobile] = useState(false);

  return (
    <>
      <Script
        id="login-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Landing Section - Full width on mobile when not showing login */}
        <div className={`w-full md:w-1/2 relative bg-muted overflow-y-auto h-screen ${
          showLoginMobile ? 'hidden md:block' : 'block'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-b from-purple-600 to-indigo-600" />
          <div className="bg-dots absolute inset-0 opacity-10" />
          <div className="floating-shapes" />
          <LandingSection onLoginClick={() => setShowLoginMobile(true)} />
        </div>
        
        {/* Login Form Section - Full width on mobile when showing login */}
        <div className={`w-full md:w-1/2 min-h-screen flex flex-col ${
          showLoginMobile ? 'block' : 'hidden md:block'
        }`}>
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 bg-white border-b">
            <button
              onClick={() => setShowLoginMobile(false)}
              className="text-sm font-medium text-purple-600 hover:text-purple-700"
            >
              Back
            </button>
            <div className="w-32 h-8 bg-[url('/images/svg/veedence_logo_wide.svg')] bg-contain bg-no-repeat bg-left" />
            <Link
              href="/auth/register"
              className="text-sm font-medium text-purple-600 hover:text-purple-700"
            >
              Sign Up
            </Link>
          </div>

          {/* Form Container */}
          <div className="flex-1 flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-md space-y-6">
              {/* Desktop Logo - Hidden on mobile */}
              <div className="hidden md:block w-48 h-12 bg-[url('/images/svg/veedence_logo_wide.svg')] bg-contain bg-no-repeat bg-left mb-8" />
              
              <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Log in to Your Coaching Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back! Enter your email and password to access your personalized coaching dashboard
                </p>
              </div>

              <LoginForm />

              {/* Desktop Sign Up Link - Hidden on mobile */}
              <p className="hidden md:block text-center text-sm text-muted-foreground">
                <Link
                  href="/auth/register"
                  className="hover:text-brand underline underline-offset-4"
                >
                  Don&apos;t have an account? Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}