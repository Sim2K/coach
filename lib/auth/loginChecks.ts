import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get stored activity status or default to false for safety
const getStoredActivityStatus = () => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('userActivityStatus');
  return stored ? stored === 'true' : false;
};

// Set activity status in storage
export const setStoredActivityStatus = (status: boolean) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('userActivityStatus', status.toString());
  isUserActive = status; // Update global state immediately
};

// Initialize with stored value
export let isUserActive = getStoredActivityStatus();

// Function to initialize user activity status on page load
export const initializeUserActivity = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const result = await checkUserActivity(session.user.id);
      isUserActive = result.isActive;
    }
  } catch (error) {
    console.error('Error initializing user activity:', error);
    isUserActive = false;
    setStoredActivityStatus(false);
  }
};

interface UserActivityCheck {
  isActive: boolean;
  expiryDate: Date | null;
}

export const checkUserActivity = async (userId: string): Promise<UserActivityCheck> => {
  try {
    // Get user registration date + 1 month
    const { data: userProfile } = await supabase
      .from('userprofile')
      .select('date_joined, is_active')
      .eq('user_id', userId)
      .single();

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    // Get latest payment end date
    const { data: latestPayment } = await supabase
      .from('payments')
      .select('subsenddate, timepaid')
      .eq('user_id', userId)
      .order('timepaid', { ascending: false })
      .limit(1)
      .single();

    const registrationExpiry = new Date(userProfile.date_joined);
    registrationExpiry.setMonth(registrationExpiry.getMonth() + 1);

    const today = new Date('2024-12-31T15:01:49Z'); // Using provided timestamp
    const paymentEndDate = latestPayment ? new Date(latestPayment.subsenddate) : null;
    
    // Use the later date between registration expiry and payment end date
    const effectiveExpiryDate = paymentEndDate && paymentEndDate > registrationExpiry 
      ? paymentEndDate 
      : registrationExpiry;

    const isActive = effectiveExpiryDate > today;

    // Update user's active status if needed
    if (userProfile.is_active !== isActive) {
      await supabase
        .from('userprofile')
        .update({ is_active: isActive })
        .eq('user_id', userId);
    }

    // Update global variable and storage
    isUserActive = isActive;
    setStoredActivityStatus(isActive);

    return {
      isActive,
      expiryDate: effectiveExpiryDate
    };
  } catch (error) {
    console.error('Error checking user activity:', error);
    // Set to false on error for safety
    isUserActive = false;
    setStoredActivityStatus(false);
    return {
      isActive: false,
      expiryDate: null
    };
  }
};

export const showActivityStatus = (isActive: boolean, expiryDate: Date | null) => {
  if (isActive) {
    toast.success('Your account is active', {
      description: expiryDate 
        ? `Active until ${expiryDate.toLocaleDateString()}`
        : undefined
    });
  } else {
    toast.error('Your account is inactive', {
      description: 'Please go to settings and select the Billings tab to renew your subscription to continue. Your data is saved but no changes can be made.'
    });
  }
};
