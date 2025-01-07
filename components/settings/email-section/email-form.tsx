"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthService } from "@/lib/auth-service";
import { Loader2, Mail } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export function EmailSection() {
  const [newEmail, setNewEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();
  const [currentEmail, setCurrentEmail] = useState<string>("");

  // Fetch current email on component mount
  useState(() => {
    const fetchCurrentEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setCurrentEmail(user.email);
      }
    };
    fetchCurrentEmail();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Check if new email is different from current
    if (newEmail === currentEmail) {
      toast.error("New email must be different from current email");
      return;
    }

    setIsLoading(true);
    try {
      const { success, error } = await AuthService.updateEmail(newEmail);

      if (success) {
        toast.success(error?.message || "Please check your emails to confirm the change");
        setNewEmail("");
      } else {
        toast.error(error?.message || "Failed to update email");
      }
    } catch (error) {
      toast.error("An unexpected error occurred while updating your email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="current-email">Current Email</Label>
        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
          <Mail className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">{currentEmail}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="new-email">New Email</Label>
        <Input
          id="new-email"
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          disabled={isLoading}
          required
          placeholder="Enter your new email address"
          className="w-full"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating Email...
          </>
        ) : (
          "Update Email"
        )}
      </Button>

      <p className="text-sm text-gray-500 mt-4">
        Note: You will receive confirmation emails at both your current and new email addresses.
        The change will only take effect after you confirm it through both emails.
      </p>
    </form>
  );
}
