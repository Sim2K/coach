"use client";

import { LatestPayment } from "./latest-payment";
import { PaymentsList } from "./payments-list";

export function PaymentsSection() {
  return (
    <div className="space-y-6">
      <LatestPayment />
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Payment History</h3>
          <div className="mt-4">
            <PaymentsList />
          </div>
        </div>
      </div>
    </div>
  );
}
