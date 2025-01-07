import { supabase } from "./supabase";

export type AuthError = {
  message: string;
  code?: string;
};

export class AuthService {
  private static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error getting current user:", error);
      throw error;
    }
    if (!user) {
      console.error("No user found");
      throw new Error('No user found');
    }
    return user;
  }

  static async updatePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: AuthError }> {
    try {
      // Get current user
      const user = await this.getCurrentUser();
      
      // First verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword
      });

      if (signInError) {
        return {
          success: false,
          error: {
            message: "Current password is incorrect",
            code: "INVALID_CREDENTIALS"
          }
        };
      }

      // Now update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        return {
          success: false,
          error: {
            message: updateError.message,
            code: updateError.name
          }
        };
      }

      return { success: true };
    } catch (error) {
      console.error("Unexpected error:", error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "An unexpected error occurred",
          code: "UNKNOWN_ERROR"
        }
      };
    }
  }

  static async updateEmail(newEmail: string): Promise<{ success: boolean; error?: AuthError }> {
    try {
      // Get current user to verify session
      const user = await this.getCurrentUser();
      
      // Update email
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (updateError) {
        return {
          success: false,
          error: {
            message: updateError.message,
            code: updateError.name
          }
        };
      }

      return { 
        success: true,
        error: {
          message: "Confirmation emails have been sent. Please check both your current and new email addresses.",
          code: "CONFIRMATION_REQUIRED"
        }
      };
    } catch (error) {
      console.error("Unexpected error:", error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "An unexpected error occurred",
          code: "UNKNOWN_ERROR"
        }
      };
    }
  }
}
