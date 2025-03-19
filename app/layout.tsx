import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@copilotkit/react-ui/styles.css";
import { CopilotKit } from "@copilotkit/react-core";
import Sidebar from "./components/Sidebar";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MCP Assistant",
  description: "Professional AI assistance for your MCP servers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased w-screen h-screen bg-black text-white`}
      >
        <CopilotKit
          runtimeUrl="/api/copilotkit"
          agent="sample_agent"
          showDevConsole={false}
        >
          {/* <Sidebar /> */}
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}
