import { Nunito, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/contexts/AuthContext";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const notoJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

export const metadata = {
  title: "Pitcho - AI-Powered Presentation & Interview Coach",
  description:
    "Pitcho is your personalized AI communication coach. Master public speaking, presentation delivery, and job interviews with real-time feedback and interactive simulations.",
  icons: {
    icon: "/logo-transparent.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${notoJp.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
