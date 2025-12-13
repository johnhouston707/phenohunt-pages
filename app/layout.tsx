import type { Metadata } from "next";
import AppDownloadBanner, { BannerProvider } from "@/components/AppDownloadBanner";

export const metadata: Metadata = {
  title: "Phenohunt",
  description: "Phenotype hunting and cannabis breeding companion",
  icons: { icon: "/app-icon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppDownloadBanner />
        <BannerProvider>{children}</BannerProvider>
      </body>
    </html>
  );
}

