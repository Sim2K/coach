/**
 * Utility functions for handling dynamic URLs in the application
 */

/**
 * Get the base URL of the application, works both client and server side
 */
export const getBaseUrl = () => {
  // Browser environment
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Server environment - use environment variable
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    console.warn('NEXT_PUBLIC_SITE_URL is not set in environment variables');
    return 'http://localhost:3000';
  }
  return siteUrl;
};

/**
 * Generate a full auth redirect URL based on the current domain
 */
export const getAuthRedirectUrl = (path: string) => {
  return `${getBaseUrl()}${path}`;
};
