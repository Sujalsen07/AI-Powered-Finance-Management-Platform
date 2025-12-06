import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/ui/header";
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Wealth",
  description: "One stop Finance Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/"
        >
          <Header />
          <main className="min-h-screen mt-16">{children}</main>
          <Toaster richColors />
          <footer className="bg-blue-50 py-12">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>Made By Sujal Sen</p>
            </div>
          </footer>
        </ClerkProvider>
      </body>
    </html>
  );
}
