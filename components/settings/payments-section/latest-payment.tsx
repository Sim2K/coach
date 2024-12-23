"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";

interface Payment {
  paymentid: string;
  issuccess: boolean;
  status: string;
  paymentstatus: string;
  paymentintentstatus: string;
  customeremail: string;
  amount: number;
  currency: string;
  paymenttype: string;
  timepaid: string;
}

export function LatestPayment() {
  const [latestPayment, setLatestPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function fetchLatestPayment() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) return;

        const { data, error } = await supabase
          .from("payments")
          .select("*")
          .eq("user_id", session.user.id)
          .order("timepaid", { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") throw error;
        setLatestPayment(data);
      } catch (error) {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLatestPayment();
  }, []);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (hasError) {
    return (
      <Card className="p-6">
        <div className="text-red-500">
          Failed to load latest payment information.
        </div>
      </Card>
    );
  }

  if (!latestPayment) {
    return (
      <Card className="p-6">
        <p className="text-gray-500">No payment history available.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Latest Payment</h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Status</p>
          <div className="mt-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              latestPayment.issuccess 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {latestPayment.status}
            </span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Amount</p>
          <p className="mt-1 text-sm text-gray-900">
          {new Intl.NumberFormat(undefined, {  style: 'currency',  currency: latestPayment.currency}).format(latestPayment.amount / 100)}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Date</p>
          <p className="mt-1 text-sm text-gray-900">
            {new Date(latestPayment.timepaid).toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Payment Type</p>
          <p className="mt-1 text-sm text-gray-900">
            {latestPayment.paymenttype}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Payment Status</p>
          <p className="mt-1 text-sm text-gray-900">
            {latestPayment.paymentstatus}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Email</p>
          <p className="mt-1 text-sm text-gray-900">
            {latestPayment.customeremail}
          </p>
        </div>
      </div>
    </Card>
  );
}
