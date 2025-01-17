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
  subscription_end_date: string | null;
  timezone: string | null;
  language: string | null;
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
      
      <div className="flex-1">
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profile</h1>
            <div className="flex flex-wrap gap-2 md:gap-4 pt-4">
              {!isEditing ? (
                <Button className="w-full md:w-auto" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="flex-1 md:flex-none" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 md:flex-none"
                    onClick={handleUpdate}
                  >
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </div>

          <Card className="shadow-md">
            <CardContent className="p-4 md:p-6">
              {formData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b">Personal Information</h2>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">First Name</Label>
                        <Input
                          className="mt-1.5"
                          value={formData.first_name || ""}
                          onChange={(e) => handleInputChange("first_name", e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Last Name</Label>
                        <Input
                          className="mt-1.5"
                          value={formData.last_name || ""}
                          onChange={(e) => handleInputChange("last_name", e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your last name"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Nickname</Label>
                        <Input
                          className="mt-1.5"
                          value={formData.nick_name || ""}
                          onChange={(e) => handleInputChange("nick_name", e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your nickname"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <Input
                          className="mt-1.5 bg-gray-50"
                          value={formData.user_email || ""}
                          disabled
                          type="email"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Age</Label>
                        <Input
                          className="mt-1.5"
                          value={formData.age || ""}
                          onChange={(e) => handleInputChange("age", parseInt(e.target.value))}
                          disabled={!isEditing}
                          type="number"
                          placeholder="Enter your age"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Gender</Label>
                        <Select
                          value={formData.gender || ""}
                          onValueChange={(value) => handleInputChange("gender", value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Select your gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Location & Preferences */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b">Location & Preferences</h2>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Country</Label>
                        <Input
                          className="mt-1.5"
                          value={formData.country || ""}
                          onChange={(e) => handleInputChange("country", e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your country"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">City</Label>
                        <Input
                          className="mt-1.5"
                          value={formData.city || ""}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter your city"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Coaching Style Preference</Label>
                        <Select
                          value={formData.coaching_style_preference || ""}
                          onValueChange={(value) => handleInputChange("coaching_style_preference", value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Select coaching style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Direct">Direct</SelectItem>
                            <SelectItem value="Supportive">Supportive</SelectItem>
                            <SelectItem value="Collaborative">Collaborative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Feedback Frequency</Label>
                        <Select
                          value={formData.feedback_frequency || ""}
                          onValueChange={(value) => handleInputChange("feedback_frequency", value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Select feedback frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="twice-weekly">Twice-Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Timezone</Label>
                        <Select
                          value={formData.timezone || "UTC"}
                          onValueChange={(value) => handleInputChange("timezone", value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Select your timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                            <SelectItem value="UTC-12:00">Baker Island (UTC-12:00)</SelectItem>
                            <SelectItem value="UTC-11:00">American Samoa (UTC-11:00)</SelectItem>
                            <SelectItem value="UTC-10:00">Hawaii (UTC-10:00)</SelectItem>
                            <SelectItem value="UTC-09:00">Alaska (UTC-09:00)</SelectItem>
                            <SelectItem value="UTC-08:00">Pacific Time (UTC-08:00)</SelectItem>
                            <SelectItem value="UTC-07:00">Mountain Time (UTC-07:00)</SelectItem>
                            <SelectItem value="UTC-06:00">Central Time, Mexico City (UTC-06:00)</SelectItem>
                            <SelectItem value="UTC-05:00">Eastern Time, Bogota (UTC-05:00)</SelectItem>
                            <SelectItem value="UTC-04:00">Atlantic Time, Caracas (UTC-04:00)</SelectItem>
                            <SelectItem value="UTC-03:00">Buenos Aires, Sao Paulo (UTC-03:00)</SelectItem>
                            <SelectItem value="UTC-02:00">Fernando de Noronha (UTC-02:00)</SelectItem>
                            <SelectItem value="UTC-01:00">Cape Verde (UTC-01:00)</SelectItem>
                            <SelectItem value="UTC+00:00">London, Dublin, Lisbon (UTC+00:00)</SelectItem>
                            <SelectItem value="UTC+01:00">Paris, Rome, Berlin (UTC+01:00)</SelectItem>
                            <SelectItem value="UTC+02:00">Cairo, Jerusalem, Athens (UTC+02:00)</SelectItem>
                            <SelectItem value="UTC+03:00">Moscow, Istanbul (UTC+03:00)</SelectItem>
                            <SelectItem value="UTC+04:00">Dubai, Baku (UTC+04:00)</SelectItem>
                            <SelectItem value="UTC+05:00">Karachi, Tashkent (UTC+05:00)</SelectItem>
                            <SelectItem value="UTC+05:30">Mumbai, Colombo (UTC+05:30)</SelectItem>
                            <SelectItem value="UTC+06:00">Dhaka, Almaty (UTC+06:00)</SelectItem>
                            <SelectItem value="UTC+07:00">Bangkok, Jakarta (UTC+07:00)</SelectItem>
                            <SelectItem value="UTC+08:00">Singapore, Beijing (UTC+08:00)</SelectItem>
                            <SelectItem value="UTC+09:00">Tokyo, Seoul (UTC+09:00)</SelectItem>
                            <SelectItem value="UTC+10:00">Sydney, Melbourne (UTC+10:00)</SelectItem>
                            <SelectItem value="UTC+11:00">Solomon Islands (UTC+11:00)</SelectItem>
                            <SelectItem value="UTC+12:00">Auckland, Fiji (UTC+12:00)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Language</Label>
                        <Select
                          value={formData.language || "en-gb"}
                          onValueChange={(value) => handleInputChange("language", value)}
                          disabled={!isEditing}
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Select your language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en-gb">British English</SelectItem>
                            <SelectItem value="en-us">American English</SelectItem>
                            <SelectItem value="es-ES">Spanish (Spain)</SelectItem>
                            <SelectItem value="es-MX">Mexican Spanish</SelectItem>
                            <SelectItem value="fr-FR">French</SelectItem>
                            <SelectItem value="de-DE">German</SelectItem>
                            <SelectItem value="it-IT">Italian</SelectItem>
                            <SelectItem value="pt-BR">Brazilian Portuguese</SelectItem>
                            <SelectItem value="pt-PT">Portuguese (Portugal)</SelectItem>
                            <SelectItem value="nl-NL">Dutch</SelectItem>
                            <SelectItem value="pl-PL">Polish</SelectItem>
                            <SelectItem value="ru-RU">Russian</SelectItem>
                            <SelectItem value="ja-JP">Japanese</SelectItem>
                            <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
                            <SelectItem value="zh-TW">Chinese (Traditional)</SelectItem>
                            <SelectItem value="ko-KR">Korean</SelectItem>
                            <SelectItem value="ar-SA">Arabic</SelectItem>
                            <SelectItem value="hi-IN">Hindi</SelectItem>
                            <SelectItem value="tr-TR">Turkish</SelectItem>
                            <SelectItem value="vi-VN">Vietnamese</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="col-span-full space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 pb-2 border-b">Account Status</h2>
                    <div className="space-y-4">
                      {/* Subscription End Date */}
                      {formData.subscription_end_date && (
                        <div className={`p-3 rounded-lg ${
                          new Date(formData.subscription_end_date) < new Date() 
                          ? 'bg-red-50' 
                          : 'bg-gray-50'
                        }`}>
                          <Label className="text-sm font-medium">Subscription End Date</Label>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(formData.subscription_end_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      
                      {/* Active Status */}
                      <div className={`p-3 rounded-lg ${!formData.is_active ? 'bg-red-50' : 'bg-gray-50'}`}>
                        <div>
                          <Label className="text-sm font-medium">
                            Active Status: {formData.is_active ? 'Active' : 'Inactive'}
                          </Label>
                          <p className="text-sm text-gray-500">This is status of your subscription</p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div>
                          <Label className="text-sm font-medium">
                            Induction: {formData.induction_complete ? 'Complete' : 'Incomplete'}
                          </Label>
                          <p className="text-sm text-gray-500">Your induction status</p>
                        </div>
                      </div>

                      {formData.last_logged_in && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <Label className="text-sm font-medium">Last Login with Ajay</Label>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(formData.last_logged_in).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}