"use client";

import { useState } from "react";
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
  Menu,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  { href: "/dashboard", label: "Übersicht", icon: LayoutDashboard },
  { href: "/contracts", label: "Verträge", icon: FileText },
  { href: "/templates", label: "Vorlagen", icon: LayoutTemplate },
  { href: "/audit-log", label: "Audit Log", icon: ClipboardList },
  { href: "/settings", label: "Einstellungen", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden flex items-center justify-between border-b px-4 py-3 bg-background sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <FileSignature className="h-5 w-5 text-primary" />
        <span className="font-semibold">Contract Manager</span>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="px-4 py-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-primary" />
              Contract Manager
            </SheetTitle>
          </SheetHeader>

          <nav className="flex-1 space-y-1 p-4">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
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

          <div className="border-t p-4 space-y-2">
            <div className="flex items-center justify-between px-3">
              <span className="text-xs text-muted-foreground">Design</span>
              <ThemeToggle />
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4" />
              Abmelden
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
