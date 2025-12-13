import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Phenohunt",
  description: "Phenotype hunting and cannabis breeding companion",
  icons: { icon: "/app-icon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

