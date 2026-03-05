"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  LogOut,
  FileSignature,
  ClipboardList,
  LayoutTemplate,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/dashboard", label: "Übersicht", icon: LayoutDashboard },
  { href: "/contracts", label: "Verträge", icon: FileText },
  { href: "/templates", label: "Vorlagen", icon: LayoutTemplate },
  { href: "/audit-log", label: "Audit Log", icon: ClipboardList },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 min-h-screen border-r bg-background px-4 py-6">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8 px-2">
        <FileSignature className="h-6 w-6 text-primary" />
        <span className="font-semibold text-lg">Contract Manager</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <Separator className="my-4" />

      {/* Logout */}
      <Button
        variant="ghost"
        className="justify-start gap-3 text-muted-foreground hover:text-foreground"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <LogOut className="h-4 w-4" />
        Abmelden
      </Button>
    </aside>
  );
}
