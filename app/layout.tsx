import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "BridgeAI — Find Your CUNY Resources",
  description: "AI-powered platform matching CUNY students to $40M in unclaimed scholarships and benefits.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Preconnecting helps the browser find the fonts faster before the CSS even loads */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
