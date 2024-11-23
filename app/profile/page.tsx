"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/sidebar";
import { 
  User, 
  Settings, 
  Target, 
  Bullseye, 
  MessageSquare, 
  Activity, 
  Flag, 
  Bell, 
  Heart 
} from "lucide-react";

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  coaching_style_preference: string | null;
  feedback_frequency: string | null;
  privacy_settings: any | null;
  is_active: boolean;
  last_logged_in: string | null;
  nick_name: string | null;
  user_email: string | null;
  induction_complete: boolean;
  country: string | null;
  city: string | null;
  age: number | null;
  gender: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/auth/login");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("userprofile")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (error) throw error;
        setProfile(data);
        setFormData(data);
      } catch (error) {
        toast.error("Error loading profile");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleUpdate = async () => {
    if (!formData) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase
        .from("userprofile")
        .update(formData)
        .eq("user_id", session.user.id);

      if (error) throw error;

      setProfile(formData);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Error updating profile");
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/auth/login");
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <div className="space-x-4">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdate}>
                    Save Changes
                  </Button>
                </>
              )}
              <Button variant="destructive" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <Label>First Name</Label>
                        <Input
                          value={formData.first_name || ""}
                          onChange={(e) => handleInputChange("first_name", e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label>Last Name</Label>
                        <Input
                          value={formData.last_name || ""}
                          onChange={(e) => handleInputChange("last_name", e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label>Nickname</Label>
                        <Input
                          value={formData.nick_name || ""}
                          onChange={(e) => handleInputChange("nick_name", e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          value={formData.user_email || ""}
                          disabled
                          type="email"
                        />
                      </div>
                      <div>
                        <Label>Age</Label>
                        <Input
                          value={formData.age || ""}
                          onChange={(e) => handleInputChange("age", parseInt(e.target.value))}
                          disabled={!isEditing}
                          type="number"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Gender</Label>
                        <Select
                          value={formData.gender || ""}
                          onValueChange={(value) => handleInputChange("gender", value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Country</Label>
                        <Input
                          value={formData.country || ""}
                          onChange={(e) => handleInputChange("country", e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label>City</Label>
                        <Input
                          value={formData.city || ""}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label>Coaching Style Preference</Label>
                        <Select
                          value={formData.coaching_style_preference || ""}
                          onValueChange={(value) => handleInputChange("coaching_style_preference", value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select coaching style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="directive">Directive</SelectItem>
                            <SelectItem value="supportive">Supportive</SelectItem>
                            <SelectItem value="collaborative">Collaborative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Feedback Frequency</Label>
                        <Select
                          value={formData.feedback_frequency || ""}
                          onValueChange={(value) => handleInputChange("feedback_frequency", value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select feedback frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="col-span-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Active Status</Label>
                        <Switch
                          checked={formData.is_active}
                          onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Induction Complete</Label>
                        <Switch
                          checked={formData.induction_complete}
                          onCheckedChange={(checked) => handleInputChange("induction_complete", checked)}
                          disabled={!isEditing}
                        />
                      </div>
                      {formData.last_logged_in && (
                        <div>
                          <Label>Last Login</Label>
                          <Input
                            value={new Date(formData.last_logged_in).toLocaleString()}
                            disabled
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}