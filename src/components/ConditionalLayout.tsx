"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import SupportChat from "./SupportChat";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  // For admin routes, render only children (no header/footer)
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // For regular routes, render with header and footer
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <SupportChat />
    </>
  );
}
