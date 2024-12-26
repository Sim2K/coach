"use client";

import { useEffect, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { PasswordSection } from "@/components/settings/password-section/password-form";
import { BillingSection } from "@/components/settings/billing-section/payment-form";
import { PaymentsSection } from "@/components/settings/payments-section";
import { Sidebar } from "@/components/sidebar";
import { Lock, CreditCard, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

function SettingsContent() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "password";
  const status = searchParams.get("status");
  const sessionId = searchParams.get("session_id");
  const { toast } = useToast();

  useEffect(() => {
    if (status === "cancelled") {
      toast({
        variant: "destructive",
        title: "Payment Cancelled",
        description: "You have cancelled the payment process.",
        duration: 5000,
      });
      window.history.replaceState({}, '', '/settings?tab=billing');
    } else if (status === "success" && sessionId) {
      return;
    }
  }, [status, sessionId, toast]);

  const tabs = [
    { name: "Password", href: "/settings?tab=password", icon: Lock },
    { name: "Billings", href: "/settings?tab=billing", icon: CreditCard },
    { name: "Payments", href: "/settings?tab=payments", icon: Receipt },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500">
              Manage your account settings and preferences.
            </p>
          </div>

          <div className="mt-6">
            <div className="sm:hidden">
              <label htmlFor="tabs" className="sr-only">
                Select a tab
              </label>
              <select
                id="tabs"
                name="tabs"
                className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                defaultValue={currentTab}
                onChange={(e) => window.location.href = `/settings?tab=${e.target.value}`}
              >
                {tabs.map((tab) => (
                  <option key={tab.name} value={tab.name.toLowerCase()}>
                    {tab.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="hidden sm:block">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = tab.href.includes(currentTab);
                    return (
                      <Link
                        key={tab.name}
                        href={tab.href}
                        className={cn(
                          isActive
                            ? "border-indigo-500 text-indigo-600"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                          "group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium"
                        )}
                      >
                        <Icon
                          className={cn(
                            isActive ? "text-indigo-500" : "text-gray-400 group-hover:text-gray-500",
                            "-ml-0.5 mr-2 h-5 w-5"
                          )}
                          aria-hidden="true"
                        />
                        <span>{tab.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Card className="p-6">
              {currentTab === "password" && <PasswordSection />}
              {currentTab === "billing" && <BillingSection />}
              {currentTab === "payments" && <PaymentsSection />}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SettingsContent />
      {children}
    </Suspense>
  );
}
