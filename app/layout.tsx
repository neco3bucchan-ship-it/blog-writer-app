import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SimpleSupabaseAuthProvider } from "@/contexts/SimpleSupabaseAuthContext"
import { ThemeProvider } from "@/components/theme-provider"
import { Footer } from "@/components/Footer"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Blog Writer - AIを活用したブログ執筆アプリ",
  description: "段階的にブログ記事を執筆できるWebアプリケーション",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SimpleSupabaseAuthProvider>
            <div className="flex min-h-screen flex-col">
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </SimpleSupabaseAuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
