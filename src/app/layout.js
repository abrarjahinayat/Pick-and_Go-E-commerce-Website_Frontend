import { Poppins } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/components/redux/ReduxProvider";
import VerifyUser from "@/components/verify/VerifyUser";
import { Toaster } from "sonner";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Pick & Go",
  description: "Your convenient online grocery shopping platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <ReduxProvider>
          <VerifyUser>
            {children}
            <Toaster richColors position="top-center" /> {/* 🔥 Required */}
          </VerifyUser>
        </ReduxProvider>
      </body>
    </html>
  );
}
