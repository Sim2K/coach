"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
//import { crypto } from "crypto";
//import CryptoJS from 'crypto-js';
import crypto from 'crypto';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  nickName: z.string().min(2, {
    message: "Nickname must be at least 2 characters.",
  }),
  loginKey: z.string().min(4, {
    message: "Your Login key must be at least 4 characters. You will receive an email with more details on how to use it. Please check your spam folder just incase.",
  }),
  //coachingStylePreference: z.string().optional(),
});

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      nickName: "",
      loginKey: "",
      //coachingStylePreference: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
          },
        },
      });

      if (authError) {
        toast.error(authError.message);
        return;
      }

      if (!authData.user) {
        toast.error("Registration failed");
        return;
      }


      

      
       // Update existing userprofile or insert if not exists
    const { error: profileError } = await supabase
      .from("userprofile")
      .upsert([
        {
          user_id: authData.user.id,
          first_name: values.firstName,
          last_name: values.lastName,
          nick_name: values.nickName,
          user_email: values.email,
          // coaching_style_preference: values.coachingStylePreference || null,
        },
      ], { onConflict: 'user_id' }); // Ensure 'user_id' has a unique constraint

    if (profileError) {
      console.error("Profile upsert error:", profileError);
      toast.error("Failed to create or update profile");
      return;
    }

    // Concatenate and hash the email and loginKey
      const rawKey = values.email + ":" + values.loginKey;
      //const apiKeyHash = CryptoJS.SHA256(rawKey).toString(CryptoJS.enc.Hex);
      const apiKeyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
      
    // Update both raw_api_key and api_key_hash in Supabase
      //const { error: profileError } = await supabase
      const { error: apiKeysError } = await supabase
        .from("apikeys")
        .upsert([
          {
            user_id: authData.user.id,
            raw_api_key: rawKey,
            api_key_hash: apiKeyHash,
            user_email: values.email,
          },
        ]);

      if (apiKeysError) {
        console.error("API keys creation error:", apiKeysError);
        toast.error("Failed to create API keys");
        return;
      }
      



      

      toast.success("Registration successful! Please check your email for your special login key.");
      router.push("/auth/login");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input className="auth-input" placeholder="John" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input className="auth-input" placeholder="Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input className="auth-input" placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input className="auth-input" type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="nickName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nickname</FormLabel>
              <FormControl>
                <Input className="auth-input" placeholder="johndoe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="loginKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your login key</FormLabel>
              <FormControl>
                <Input className="auth-input" placeholder="one word case sensitive" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="auth-button" type="submit" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>
    </Form>
  );
}