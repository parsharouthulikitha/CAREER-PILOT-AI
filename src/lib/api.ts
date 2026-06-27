/**
 * API Utility Helper
 * Allows dynamically pointing to a custom backend URL (e.g. when hosted on Netlify)
 * using the VITE_API_URL environment variable.
 */

export function getApiUrl(path: string): string {
  const baseUrl = (import.meta as any).env?.VITE_API_URL || "";
  
  // Ensure we don't end up with double slashes if both have them
  if (baseUrl) {
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  }
  
  return path;
}
