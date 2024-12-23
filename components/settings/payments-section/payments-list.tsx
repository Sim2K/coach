"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

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

export function PaymentsList() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function fetchPayments() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) return;

        const { data, error } = await supabase
          .from("payments")
          .select("*")
          .eq("user_id", session.user.id)
          .order("timepaid", { ascending: false });

        if (error) throw error;
        setPayments(data || []);
      } catch (error) {
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPayments();
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded"></div>
        ))}
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="text-red-500 p-4">
        Failed to load payment history.
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">No payment history available.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payments.map((payment) => (
            <tr key={payment.paymentid}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(payment.timepaid).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  payment.issuccess 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {payment.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {new Intl.NumberFormat(undefined, {  style: 'currency',  currency: payment.currency}).format(payment.amount / 100)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {payment.paymenttype}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {payment.paymentstatus}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
