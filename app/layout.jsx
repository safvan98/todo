"use client"

import { ThemeProvider } from 'next-themes'
import { Button } from "@/components/ui/button"
import { Moon, Sun, Laptop } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from "next-themes"
import { useEffect, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Toaster } from "@/components/ui/toaster"
import './globals.css'
export default function RootLayout({ children }) {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  // if (!mounted) {
  //   return null
  // }

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen bg-background text-foreground">
            <header className="container mx-auto p-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold">To-Do App</h1>
              <nav>
                <ul className="flex space-x-4">
                  <li><Link href="/" className="hover:underline">Dashboard</Link></li>
                  <li><Link href="/tasks" className="hover:underline">Tasks</Link></li>
                  <li><Link href="/categories" className="hover:underline">Categories</Link></li>
                  <li><Link href="/reminders" className="hover:underline">Reminders</Link></li>
                  <li><Link href="/templates" className="hover:underline">Templates</Link></li>
                </ul>
              </nav>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Laptop className="mr-2 h-4 w-4" />
                    <span>System</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </header>
            <main className="container mx-auto p-4">
              {children}
            </main>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

