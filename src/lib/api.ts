/**
 * API Utility Helper
 * Allows dynamically pointing to a custom backend URL (e.g. when hosted on Netlify)
 * using the VITE_API_URL environment variable.
 */

export function getApiUrl(path: string): string {
  let baseUrl = "";
  
  if (typeof window !== "undefined") {
    baseUrl = localStorage.getItem("custom_api_url") || "";
  }

  if (!baseUrl) {
    baseUrl = (import.meta as any).env?.VITE_API_URL || "";
  }
  
  // If not explicitly set via environment variables, detect if we're on an external host
  if (!baseUrl && typeof window !== "undefined") {
    const host = window.location.hostname;
    // If we're on Netlify, GitHub Pages, or another external hosting provider
    if (host && !host.includes("run.app") && !host.includes("localhost") && !host.includes("127.0.0.1")) {
      baseUrl = "https://ais-pre-eli7wull6pc3vvvlygnvqr-393363908126.asia-east1.run.app";
    }
  }
  
  // Ensure we don't end up with double slashes if both have them
  if (baseUrl) {
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
  }
  
  return path;
}
