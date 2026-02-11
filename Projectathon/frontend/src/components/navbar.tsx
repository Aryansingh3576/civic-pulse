"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Menu,
    X,
    Sun,
    Moon,
    LogOut,
    User,
    ShieldAlert,
    LayoutDashboard,
    Trophy,
    Shield,
    ChevronDown,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const links = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/report", label: "Report Issue", icon: ShieldAlert },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const { theme, setTheme } = useTheme();
    const { user, logout, isLoading } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => setIsOpen(false), [pathname]);

    if (!mounted) return null;

    return (
        <>
            <header
                className={cn(
                    "fixed top-4 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6 md:px-8",
                    scrolled ? "py-0" : "py-2"
                )}
            >
                <div className={cn(
                    "mx-auto max-w-5xl transition-all duration-300 rounded-2xl border",
                    scrolled
                        ? "bg-background/70 backdrop-blur-xl border-white/10 shadow-lg py-3 px-6"
                        : "bg-transparent border-transparent py-4 px-0"
                )}>
                    <div className="flex h-10 items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="relative flex items-center justify-center size-9 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
                                <Shield className="size-5 text-primary" />
                            </div>
                            <span className="text-xl font-bold font-[family-name:var(--font-outfit)] tracking-tight">
                                Civic<span className="text-primary">Pulse</span>
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-1">
                            {links.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            "relative px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:text-foreground/80",
                                            isActive ? "text-primary" : "text-muted-foreground"
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-pill"
                                                className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Right Side: Theme & Auth */}
                        <div className="hidden md:flex items-center gap-3">
                            {/* Theme Toggle */}
                            <button
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                className="p-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                aria-label="Toggle theme"
                            >
                                {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
                            </button>

                            <div className="w-px h-6 bg-border mx-1" />

                            {/* Auth State */}
                            {!isLoading && (
                                user ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="pl-2 pr-1 gap-2 rounded-full ring-offset-2 ring-primary">
                                                <Avatar className="size-8 border border-border">
                                                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                                                        {user.name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-medium max-w-[100px] truncate">{user.name}</span>
                                                <ChevronDown className="size-4 text-muted-foreground opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 glass-card p-2">
                                            <DropdownMenuItem asChild className="rounded-md">
                                                <Link href="/profile" className="w-full cursor-pointer">
                                                    <User className="mr-2 size-4" />
                                                    <span>Profile</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-border/50" />
                                            <DropdownMenuItem
                                                onClick={logout}
                                                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer rounded-md"
                                            >
                                                <LogOut className="mr-2 size-4" />
                                                <span>Log out</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                            Sign In
                                        </Link>
                                        <Button asChild size="sm" className="rounded-full px-5 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                                            <Link href="/register">Get Started</Link>
                                        </Button>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 top-[72px] z-40 bg-background/95 backdrop-blur-3xl md:hidden flex flex-col p-6 gap-6"
                    >
                        <nav className="flex flex-col gap-2">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-3 p-4 rounded-xl text-lg font-medium transition-colors",
                                        pathname === link.href
                                            ? "bg-primary/10 text-primary"
                                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {link.icon && <link.icon className="size-5" />}
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-auto space-y-4">
                            {!isLoading && user ? (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/50">
                                        <Avatar>
                                            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                                                {user.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        className="w-full justify-start"
                                        onClick={logout}
                                    >
                                        <LogOut className="mr-2 size-4" />
                                        Log out
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <Button asChild variant="outline" className="w-full">
                                        <Link href="/login">Sign In</Link>
                                    </Button>
                                    <Button asChild className="w-full">
                                        <Link href="/register">Sign Up</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
