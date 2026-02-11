"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Users,
    AlertTriangle,
    Settings,
    LogOut,
    Shield,
    Menu,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const sidebarLinks = [
    { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/complaints", label: "Complaints", icon: AlertTriangle },
    // Future: { href: "/admin/users", label: "Users", icon: Users },
    // Future: { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-card/50 backdrop-blur-xl border-r border-border/40 transform transition-transform duration-300 md:translate-x-0 md:static",
                isMobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-full flex flex-col p-6">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="flex items-center justify-center size-10 rounded-xl bg-primary/20 text-primary">
                            <Shield className="size-6" />
                        </div>
                        <span className="text-xl font-bold font-[family-name:var(--font-outfit)]">
                            Civic<span className="text-primary">Admin</span>
                        </span>
                    </div>

                    <nav className="flex-1 space-y-1">
                        {sidebarLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative overflow-hidden",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                    )}
                                >
                                    <link.icon className="size-5" />
                                    {link.label}
                                    {isActive && <motion.div layoutId="admin-active" className="absolute inset-0 bg-primary -z-10" />}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto pt-6 border-t border-white/5">
                        <div className="flex items-center gap-3 mb-4 px-2">
                            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                {user?.name?.substring(0, 2).toUpperCase() || "AD"}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium truncate">{user?.name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={logout}>
                            <LogOut className="mr-2 size-4" /> Sign Out
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen relative">
                <header className="md:hidden h-16 flex items-center justify-between px-4 border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-40">
                    <span className="font-bold">CivicAdmin</span>
                    <button onClick={() => setIsMobileOpen(!isMobileOpen)}>
                        {isMobileOpen ? <X /> : <Menu />}
                    </button>
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
                    {children}
                </main>
            </div>

            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </div>
    );
}
