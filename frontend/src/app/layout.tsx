import type { Metadata } from "next";
import { AuthProvider } from "@/lib/authContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Student Career Navigator | Personalised Path from Skills to Career",
  description: "An AI-powered web platform providing university students and early-career engineers personalized career recommendations, skill-gap analysis, adaptive roadmaps, and portfolio project guidance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#070b14] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
