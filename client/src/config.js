// In production on Vercel, set VITE_API_URL to your Render backend URL (e.g. https://your-app.onrender.com)
// In local development, leaving it empty uses the Vite local proxy (/api)
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
