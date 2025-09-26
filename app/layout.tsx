import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import ClientLayout from "./client-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AI Affiliate Networks — RankForge Engine v0.3",
  description: "Professional SEO operator dashboard",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gunmetal text-white min-h-screen`}>
        <ClientLayout>{children}</ClientLayout>

        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "#151821",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
            },
          }}
        />
      </body>
    </html>
  )
}
