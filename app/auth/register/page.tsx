"use client";

import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { Hexagon } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="auth-container">
      <div className="auth-left-panel">
        <div className="auth-gradient-overlay" />
        <div className="bg-dots absolute inset-0 opacity-10" />
        <div className="floating-shapes" />
        <div className="auth-logo">
          <Hexagon className="mr-2 h-8 w-8" />
          Another Veedence.co.uk idea
        </div>
        <div className="relative z-20 mt-auto">
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            Calling all
            <br />
            <span className="italic font-serif">Fabulous</span>
            <br />
            Creators
            <br />& Brands!
          </h1>
          <div className="auth-avatar-stack">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="auth-avatar">
                <img
                  src={`https://source.unsplash.com/random/100x100?portrait=${i}`}
                  alt={`Creator ${i}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
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
      <div className="auth-content">
        <div className="auth-form-container">
          <div className="text-center">
            <h2 className="auth-heading">Sign Up!</h2>
            <p className="auth-subheading">
              You are just a few mins away from getting your personal Accountability Life Coach!
            </p>
          </div>
          <RegisterForm />
          <p className="text-center">
            <Link href="/auth/login" className="auth-link">
              Already have an account, then what are you doing here?!?!? Sign In!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}