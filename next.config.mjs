/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), payment=(self)",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // unsafe-inline + unsafe-eval required for Next.js runtime scripts and Vercel preview toolbar
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel.live https://checkout.razorpay.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.vercel.live",
      "font-src 'self' https://fonts.gstatic.com https://*.vercel.live data:",
      "img-src 'self' data: blob: https://*.supabase.co https://*.vercel.app https://*.vercel.live https://*.public.blob.vercel-storage.com https://hebbkx1anhila5yf.public.blob.vercel-storage.com https://checkout.razorpay.com",
      // Razorpay + Supabase + Vercel live preview websocket connections
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vercel.live https://*.vercel.live wss://*.vercel.live wss://ws-us3.pusher.com https://api.razorpay.com https://lumberjack.razorpay.com",
      // Google Maps (contact page) + Razorpay payment modal iframes
      "frame-src 'self' https://www.google.com https://*.razorpay.com https://vercel.live https://*.vercel.live",
      "worker-src 'self' blob:",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
]

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
