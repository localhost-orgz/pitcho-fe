import { Nunito, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

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
  title: "Presenta - Belajar Presentasi Jadi Mudah",
  description: "Learn to present with confidence. Stay focused and keep eye contact with real-time feedback.",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
