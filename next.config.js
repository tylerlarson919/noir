/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["res.cloudinary.com"],
  },
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: [],
    serverActions: true
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "frame-ancestors 'self' https://www.google.com",
              "frame-src https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://js.stripe.com https://hooks.stripe.com",
              "script-src 'self' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://va.vercel-scripts.com https://js.stripe.com 'unsafe-inline' 'unsafe-eval'",
              // Force 'unsafe-inline' for styles and include the existing hashes
              "style-src 'self' 'unsafe-inline' 'sha256-zhyeDlZTEKZvKgtxHpxj4ydFABucKb8zpjZLFzOborc=' 'sha256-leLzbVxZAzOi3vU/QL+Ol4qnwxlwA0nSPFZDP71A4Kk=' 'sha256-mQ4LZTkAl1QYJkeyaT4nVx0YDeQ9WOH9k4ajt5PFvNU=' 'sha256-B3yoUHRULn1isE4VCTQnLT04X7QKzhw+FhvpPPZfR/w=' 'sha256-2UaKjTporsQutKvrtoF3T6P1SfELvN/EBhNwd2wtQ3w='",
              "font-src 'self' data: https://assets.alicdn.com",
              "connect-src 'self' https://*.vercel-insights.com https://vitals.vercel-insights.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://*.googleapis.com https://api.stripe.com",
              "img-src 'self' data: https://res.cloudinary.com https://www.gstatic.com"
            ].join("; ")
          }
        ]
      }
    ]
  }
};

module.exports = nextConfig;