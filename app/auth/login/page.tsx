"use client";

import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

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
  return (
    <>
      <Script
        id="login-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen flex flex-col-reverse md:flex-row">
        <div className="w-full md:w-1/2 relative bg-muted flex flex-col overflow-hidden min-h-[50vh] md:min-h-screen text-white p-4 md:p-8">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-600 to-indigo-600" />
          <div className="bg-dots absolute inset-0 opacity-10" />
          <div className="floating-shapes" />
          <div className="absolute inset-0 flex items-center justify-center opacity-35 pointer-events-none">
            <div className="w-48 h-48 bg-[url('/images/svg/veedence_logo.svg')] bg-contain bg-no-repeat bg-center" />
          </div>
          <div className="relative z-20 flex items-center text-lg font-medium">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            Accountability and Life Coach by Veedence
          </div>
          <div className="relative z-20 flex flex-col justify-center flex-1 max-w-2xl mx-auto px-4 md:px-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-center mt-8 md:mt-0">
              Discover the Future of Coaching
            </h2>
            <div className="space-y-4 text-base">
              <p>
                Ready to achieve your goals with a coach that remembers every detail? Veedence Accountability Coaching, powered by advanced AI and ChatGPT, is here to help you stay on track, uncover hidden potential, and reach new heights.
              </p>
              <ul className="space-y-3 md:space-y-4">
                <li className="flex items-start">
                  <span className="font-semibold mr-2">✦</span>
                  <span><strong>Personalized Guidance:</strong> Tailored coaching designed around your unique goals and milestones.</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">✦</span>
                  <span><strong>Seamless Progress Tracking:</strong> A dashboard that keeps all your achievements and plans in one place.</span>
                </li>
                <li className="flex items-start">
                  <span className="font-semibold mr-2">✦</span>
                  <span><strong>Always Here for You:</strong> Unlike traditional coaches, this AI-powered coach is available 24/7 to help you succeed.</span>
                </li>
              </ul>
              <p className="mt-4 mb-12 md:mb-4">
                Whether you're planning a career change, building better habits, or simply looking for someone to hold you accountable, Veedence is the coaching partner you've been searching for.
              </p>
            </div>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md mx-4 md:mx-0 space-y-6">
            <div className="w-48 h-12 bg-[url('/images/svg/veedence_logo_wide.svg')] bg-contain bg-no-repeat bg-left mb-8" />
            <div className="flex flex-col space-y-2 text-center mt-8 md:mt-0">
              <h1 className="text-2xl font-semibold tracking-tight">
                Log in to Your Coaching Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Welcome back! Enter your email and password to access your personalized coaching dashboard. Let's get back to tracking your progress and achieving your goals
              </p>
            </div>
            <LoginForm />
            <p className="text-center text-sm text-muted-foreground mb-8 md:mb-0">
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
    </>
  );
}