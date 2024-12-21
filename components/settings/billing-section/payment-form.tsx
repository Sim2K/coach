"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

const currencies = [
  { code: "USD", symbol: "$", minAmount: 5, rate: 1 },
  { code: "GBP", symbol: "£", minAmount: 5, rate: 0.79 },
  { code: "EUR", symbol: "€", minAmount: 5, rate: 0.92 },
  { code: "CAD", symbol: "$", minAmount: 6.80, rate: 1.36 },
  { code: "AUD", symbol: "$", minAmount: 7.60, rate: 1.52 },
];

export function BillingSection() {
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentType, setPaymentType] = useState("afford"); // "afford" or "worth"
  const { toast } = useToast();

  const selectedCurrency = currencies.find(c => c.code === currency);
  const usdEquivalent = amount ? parseFloat(amount) / selectedCurrency!.rate : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < selectedCurrency?.minAmount!) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: `Minimum amount is ${selectedCurrency?.symbol}${selectedCurrency?.minAmount} for ${currency}`
      });
      return;
    }

    toast({
      title: "Payment prepared",
      description: `Ready to process ${selectedCurrency?.symbol}${amount} (≈ $${usdEquivalent.toFixed(2)}) payment.`
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 text-gray-600">
        <p className="text-base sm:text-lg">
          Welcome to our unique approach to AI coaching accessibility. We believe that personal growth and professional development should be available to everyone, regardless of their financial situation.
        </p>
        <p className="text-sm sm:text-base">
          This is a social experiment in value-based pricing. You can choose to pay either what you can afford or what you believe the service is worth. While there's a minimal monthly subscription to maintain service quality ({selectedCurrency?.symbol}{selectedCurrency?.minAmount}), you have the freedom to contribute more if you find value in the AI coaching experience.
        </p>
        <p className="text-sm sm:text-base">
          Your choice helps us understand how to make AI coaching more accessible while ensuring sustainable service delivery.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_2fr_1.2fr] gap-8 items-start">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency" className="mt-2">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.code} ({curr.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount">Amount</Label>
              <div className="relative mt-2">
                <span className="absolute left-3 top-2.5 text-gray-500">
                  {selectedCurrency?.symbol}
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min={selectedCurrency?.minAmount}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-6"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Minimum amount: {selectedCurrency?.symbol}{selectedCurrency?.minAmount}
              </p>
            </div>

            <div>
              <Label>Payment Basis</Label>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`text-sm ${paymentType === 'afford' ? 'text-purple-600' : 'text-gray-500'}`}>Afford</span>
                <Switch
                  id="payment-type"
                  checked={paymentType === 'worth'}
                  onCheckedChange={(checked) => setPaymentType(checked ? 'worth' : 'afford')}
                />
                <span className={`text-sm ${paymentType === 'worth' ? 'text-purple-600' : 'text-gray-500'}`}>Worth</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card">Credit/Debit Card</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal">PayPal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bank" id="bank" />
                <Label htmlFor="bank">Bank Transfer</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <Button type="submit" className="w-full">
          Process Payment
        </Button>
      </form>
    </div>
  );
}
