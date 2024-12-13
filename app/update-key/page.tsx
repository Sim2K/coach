"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Copy } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import crypto from 'crypto';

export default function UpdateKeyPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [phrase, setPhrase] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }
      setUserEmail(session.user.email || "");
    };

    checkAuth();
  }, [router]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(newKey);
      toast.success("Key copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy key");
    }
  };

  const handleSave = async () => {
    if (!phrase.trim()) {
      toast.error("Please enter a phrase");
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }

      const rawKey = `${userEmail}:${phrase}`;
      const apiKeyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

      const { error } = await supabase
        .from("apikeys")
        .update({
          api_key_hash: apiKeyHash,
          raw_api_key: rawKey,
          last_used_at: new Date().toISOString(),
          email_sent: true,
          email_sent_at: new Date().toISOString()
        })
        .eq("user_id", session.user.id);

      if (error) throw error;

      setNewKey(rawKey);
      setShowDialog(true);
    } catch (error) {
      toast.error("Failed to update key");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    router.push("/profile");
  };

  /**
   * Handler to sanitize the phrase input.
   * Removes any non-alphanumeric characters and enforces no spaces.
   */
  const handlePhraseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Remove any character that is not a letter or number
    const sanitized = input.replace(/[^a-zA-Z0-9]/g, "");
    setPhrase(sanitized);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1">
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Update Login Key</h1>
          
          <Card className="shadow-md p-6">
            <div className="space-y-6">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-yellow-700">
                  For security reasons, we cannot display your original key. Please create a new one below.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="phrase">New Key Phrase</Label>
                  <p className="text-sm text-gray-500 mb-2">
                    Enter a new phrase (case sensitive) to generate your API key, no spaces allowed. The phrase or word or whatever you want needs to be 3 characters or longer and must be text or numbers only.
                  </p>
                  <Input
                    id="phrase"
                    value={phrase}
                    onChange={handlePhraseChange} // Updated to use sanitized handler
                    placeholder="Enter your phrase"
                    className="mb-2"
                  />
                  {/* Existing Validation: Phrase must be at least 3 characters */}
                  {phrase.length > 0 && phrase.length < 3 && (
                    <p className="text-red-500 text-sm">Phrase must be at least 3 characters long.</p>
                  )}
                  {/* New Validation: Phrase should not exceed 15 characters */}
                  {phrase.length > 15 && (
                    <p className="text-red-500 text-sm">
                      Hold up mate, we don't need chapter and verse here! It's up to you, but just a simple phrase will do!
                    </p>
                  )}
                </div>


                <div>
                  <Label>Generated Key</Label>
                  <p className="text-md font-mono bg-gray-50 p-3 rounded border">
                    {userEmail}:{phrase}
                  </p>
                </div>

                <Button 
                  onClick={handleSave} 
                  className="w-full"
                  disabled={isLoading || phrase.length < 3} // Updated to disable based on phrase length
                >
                  {isLoading ? "Updating..." : "Update Key"}
                </Button>
              </div>
            </div>
          </Card>

          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Your New API Key</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  A copy of your key has been emailed to you. For security reasons, we don't store the original key.
                  Please test your key with Ajay in ChatGPT as soon as possible!
                </p>
                <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded">
                  <code className="flex-1 font-mono">{newKey}</code>
                  <Button size="icon" variant="ghost" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCloseDialog}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
