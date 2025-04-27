import * as React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/providers/theme-provider";
import { Nav } from "./components/nav";
import { ThemePanel } from "./components/theme-panel";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ProTrack",
  description: "Work Statistics System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var rgb = JSON.parse(localStorage.getItem('protrack-theme-primary-rgb'));
                if (Array.isArray(rgb) && rgb.length === 3 && rgb.every(n => typeof n === 'number')) {
                  function rgbToHslString(r, g, b) {
                    r /= 255; g /= 255; b /= 255;
                    var max = Math.max(r, g, b), min = Math.min(r, g, b);
                    var h = 0, s = 0, l = (max + min) / 2;
                    if (max !== min) {
                      var d = max - min;
                      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                      switch (max) {
                        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                        case g: h = (b - r) / d + 2; break;
                        case b: h = (r - g) / d + 4; break;
                      }
                      h /= 6;
                    }
                    return Math.round(h * 360) + ' ' + Math.round(s * 100) + '% ' + Math.round(l * 100) + '%';
                  }
                  var hsl = rgbToHslString(rgb[0], rgb[1], rgb[2]);
                  document.documentElement.style.setProperty('--primary', hsl);
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col bg-background">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-8 hidden md:flex">
                    <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      ProTrack
                    </h1>
                  </div>
                  <Nav />
                </div>
                <ThemePanel />
              </div>
            </header>
            <main className="flex-1">
              <div className="container py-6 md:py-8">{children}</div>
            </main>
            <footer className="border-t py-6 md:py-0">
              <div className="container flex h-14 items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Built with Next.js and Tailwind CSS
                </p>
                <p className="text-sm text-muted-foreground">
                  © 2024 ProTrack. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
