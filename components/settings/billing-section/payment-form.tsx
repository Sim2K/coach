"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { getEnvironmentConfig } from "@/lib/config/environment";
import { createCheckoutSession, redirectToCheckout } from "@/lib/stripe/client";
import { StripeCurrency, StripeSessionResponse } from "@/types/stripe";
import { supabase } from "@/lib/supabase";
import { initializeUserActivity, setStoredActivityStatus } from "@/lib/auth/loginChecks";

const currencies = [
  { code: "USD", symbol: "$", minAmount: 5, rate: 1 },/*  */
  { code: "GBP", symbol: "£", minAmount: 5, rate: 0.79 },
  { code: "EUR", symbol: "€", minAmount: 6, rate: 0.92 },
  { code: "CAD", symbol: "$", minAmount: 7, rate: 1.36 },
  { code: "AUD", symbol: "$", minAmount: 8, rate: 1.52 }
];

export function BillingSection() {
  const [currency, setCurrency] = useState<StripeCurrency>("USD");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentType, setPaymentType] = useState("afford"); // "afford" or "worth"
  const [lastPayment, setLastPayment] = useState<StripeSessionResponse | null>(null);
  const [selectedMonths, setSelectedMonths] = useState(1);
  const [currentSubsEndDate, setCurrentSubsEndDate] = useState<string | null>(null);
  const { toast } = useToast();
  const config = getEnvironmentConfig();

  const selectedCurrency = currencies.find(c => c.code === currency);
  const usdEquivalent = amount ? parseFloat(amount) / selectedCurrency!.rate : 0;

  // Fetch current subscription end date from latest payment
  useEffect(() => {
    const fetchLatestPayment = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data, error } = await supabase
          .from('payments')
          .select('subsenddate')
          .eq('user_id', session.user.id)
          .order('timepaid', { ascending: false })
          .limit(1)
          .single();

        const now = new Date().toISOString().split('T')[0];
        
        if (!error && data && data.subsenddate) {
          // Use payment date if it's in the future, otherwise use current date
          if (data.subsenddate > now) {
            setCurrentSubsEndDate(data.subsenddate);
          } else {
            setCurrentSubsEndDate(now);
          }
        } else {
          setCurrentSubsEndDate(now);
        }
      }
    };
    fetchLatestPayment();
  }, []);

  // Calculate new subscription end date
  const calculateSubsEndDate = () => {
    const baseDate = currentSubsEndDate ? new Date(currentSubsEndDate) : new Date();
    const newDate = new Date(baseDate);
    newDate.setMonth(newDate.getMonth() + selectedMonths);
    return newDate;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  // Check for returning from Stripe checkout
  useEffect(() => {
    const url = window.location.href;
    const urlParams = new URL(url);
    const sessionId = urlParams.searchParams.get('session_id');
    const status = urlParams.searchParams.get('status');
    
    console.log('Payment return params:', { sessionId, status });

    const handlePaymentReturn = async () => {
      try {
        setIsLoading(true);

        if (status === 'cancelled') {
          console.log('Payment was cancelled');
          toast({
            variant: "destructive",
            title: "Payment Cancelled",
            description: "You have cancelled the payment process.",
            duration: 5000,
          });
          return;
        }

        if (sessionId && status === 'success') {
          console.log('Checking payment status for session:', sessionId);
          const response = await fetch(`/api/stripe/session-status?session_id=${sessionId}`);
          
          if (!response.ok) {
            throw new Error('Failed to verify payment status');
          }
          
          const data: StripeSessionResponse = await response.json();
          console.log('Payment status data:', data);
          
          // Store the payment data
          setLastPayment(data);
          
          if (data.isSuccess) {
            const amount = parseFloat(data.metadata.originalAmount);
            const formattedAmount = new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: data.metadata.currency
            }).format(amount);

            // Immediately update activity status
            setStoredActivityStatus(true);
            
            toast({
              title: "Payment Successful!",
              description: `Thank you for your ${formattedAmount} ${data.metadata.paymentType === 'worth' ? 'value-based' : 'accessibility-based'} payment.`,
              duration: 5000,
            });

            // Force activity check after status update
            await initializeUserActivity();
            
            // You might want to update UI or trigger other actions based on payment success
            // For example, update subscription status, show receipt, etc.
          } else {
            toast({
              variant: "destructive",
              title: "Payment Incomplete",
              description: `Payment status: ${data.paymentStatus}. Please try again or contact support.`,
              duration: 5000,
            });
          }
        }
      } catch (error) {
        console.error('Error handling payment return:', error);
        toast({
          variant: "destructive",
          title: "Status Check Failed",
          description: "Unable to verify payment status. Please contact support.",
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
        // Clean up URL without refreshing
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('session_id');
        newUrl.searchParams.delete('status');
        window.history.replaceState({}, '', newUrl.pathname + '?tab=billing');
      }
    };

    if (status || sessionId) {
      handlePaymentReturn();
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount < selectedCurrency?.minAmount!) {
        throw new Error(`Minimum amount is ${selectedCurrency?.symbol}${selectedCurrency?.minAmount} for ${currency}`);
      }

      const totalAmount = numAmount * selectedMonths;
      const subsEndDate = calculateSubsEndDate();

      console.log('Calculated subscription end date:', subsEndDate.toISOString().split('T')[0]);

      // Create checkout session
      const session = await createCheckoutSession(
        currency,
        totalAmount,
        paymentType as 'afford' | 'worth',
        {
          subscriptionEndDate: subsEndDate.toISOString().split('T')[0],
          MonthsCount: selectedMonths.toString()
        }
      );

      // Redirect to Stripe Checkout
      await redirectToCheckout(session);
    } catch (error: any) {
      console.error('Payment form error:', error);
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error.message || "Failed to process payment"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderLastPayment = () => {
    if (!lastPayment) return null;

    const amount = parseFloat(lastPayment.metadata.originalAmount);
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: lastPayment.metadata.currency
    }).format(amount);

    return (
      <div className="mt-4 p-4 bg-green-50 rounded-md">
        <h3 className="text-sm font-medium text-green-800">Last Payment Details</h3>
        <dl className="mt-2 text-sm text-green-700">
          <div className="flex justify-between">
            <dt>Amount:</dt>
            <dd>{formattedAmount}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Type:</dt>
            <dd>{lastPayment.metadata.paymentType === 'worth' ? 'Value-based' : 'Accessibility-based'}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Status:</dt>
            <dd>{lastPayment.paymentStatus}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Email:</dt>
            <dd>{lastPayment.customerEmail}</dd>
          </div>
        </dl>
      </div>
    );
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
              <Select value={currency} onValueChange={(value) => setCurrency(value as StripeCurrency)}>
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
              <Label htmlFor="amount">Amount per month</Label>
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
                Minimum monthly amount: {selectedCurrency?.symbol}{selectedCurrency?.minAmount}
              </p>
              {amount && (
                <p className="text-sm text-gray-500 mt-1">
                  ≈ ${usdEquivalent.toFixed(2)} USD
                </p>
              )}
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

          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <Label>Select Payment Period (1-3 months)</Label>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Total: {selectedCurrency?.symbol}{(parseFloat(amount || "0") * selectedMonths).toFixed(2)}
                </span>
                <span className="text-sm text-gray-600">
                  Valid until: {formatDate(calculateSubsEndDate())}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-500 whitespace-nowrap">
                {selectedMonths} {selectedMonths === 1 ? 'month' : 'months'} × {selectedCurrency?.symbol}{amount || '0'}
              </p>
              <Slider
                value={[selectedMonths]}
                onValueChange={(value) => setSelectedMonths(value[0])}
                min={1}
                max={3}
                step={1}
                className="flex-grow"
              />
              <Input
                type="number"
                value={(parseFloat(amount || "0") * selectedMonths).toFixed(2)}
                className="w-24"
                readOnly
              />
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : config.buttonText}
        </Button>
      </form>

      {renderLastPayment()}
    </div>
  );
}
