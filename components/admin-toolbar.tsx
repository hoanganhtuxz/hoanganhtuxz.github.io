"use client";

import { useAdminAuth } from "@/contexts/admin-auth-context";
import { useRouter, usePathname } from "next/navigation";
import { Settings, LogOut, Eye } from "lucide-react";
import Link from "next/link";

export function AdminToolbar() {
  const { isAuthenticated, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (!isAuthenticated) return null;

  // Do not show the admin toolbar inside the admin preview iframe
  if (pathname.endsWith("/preview")) return null;

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  // Extract lang from pathname e.g. /vi → vi
  const lang = pathname.split("/")[1] || "vi";

  return (
    <>
      {/* Push content down so toolbar doesn't overlap */}
      <div className="h-10" />

      <div
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999 }}
        className="h-10 bg-foreground text-background flex items-center px-4 gap-4 text-sm shadow-lg"
      >
        {/* Brand */}
        <span className="font-semibold text-xs tracking-wide opacity-70 uppercase select-none">
          Admin Mode
        </span>

        <div className="w-px h-5 bg-background/20" />

        {/* Quick links */}
        <Link
          href={`/admin`}
          className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity"
        >
          <Settings className="w-3.5 h-3.5" />
          Dashboard
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity hover:text-red-300"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </>
  );
}
