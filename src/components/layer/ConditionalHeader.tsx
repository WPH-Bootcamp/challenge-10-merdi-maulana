"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layer/Header";

const noHeaderRoutes = ["/create", "/edit"];

export default function ConditionalHeader() {
  const pathname = usePathname();

  const shouldHideHeader = noHeaderRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (shouldHideHeader) {
    return null;
  }

  return <Header />;
}
