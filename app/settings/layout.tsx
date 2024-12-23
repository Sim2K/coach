"use client";

import { useEffect } from "react";
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

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
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

          <div className="mt-6 space-y-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const isActive = currentTab === tab.name.toLowerCase();
                  return (
                    <Link
                      key={tab.name}
                      href={tab.href}
                      className={cn(
                        "group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm",
                        isActive
                          ? "border-purple-500 text-purple-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      )}
                    >
                      <tab.icon
                        className={cn(
                          "mr-2 h-5 w-5",
                          isActive
                            ? "text-purple-500"
                            : "text-gray-400 group-hover:text-gray-500"
                        )}
                      />
                      {tab.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-6">
              {currentTab === "password" && (
                <Card className="p-6 bg-white shadow-sm">
                  <PasswordSection />
                </Card>
              )}
              {currentTab === "billing" && (
                <Card className="p-6 bg-white shadow-sm">
                  <BillingSection />
                </Card>
              )}
              {currentTab === "payments" && (
                <Card className="p-6 bg-white shadow-sm">
                  <PaymentsSection />
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
