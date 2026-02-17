"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell, X, CheckCircle, AlertTriangle, MapPin, MessageSquare,
    Clock, ChevronRight, Trash2, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Notification {
    id: string;
    type: "status_change" | "nearby_issue" | "resolution" | "upvote" | "system";
    title: string;
    message: string;
    time: string;
    read: boolean;
    link?: string;
}

const ICONS: Record<string, any> = {
    status_change: CheckCircle,
    nearby_issue: MapPin,
    resolution: Eye,
    upvote: AlertTriangle,
    system: MessageSquare,
};

const ICON_COLORS: Record<string, string> = {
    status_change: "text-emerald-400 bg-emerald-500/10",
    nearby_issue: "text-blue-400 bg-blue-500/10",
    resolution: "text-purple-400 bg-purple-500/10",
    upvote: "text-amber-400 bg-amber-500/10",
    system: "text-primary bg-primary/10",
};

// Default mock notifications — in production these come from a real backend
const DEFAULT_NOTIFICATIONS: Notification[] = [
    { id: "1", type: "status_change", title: "Status Updated", message: "Your pothole complaint on MG Road is now In Progress.", time: "2 min ago", read: false, link: "/dashboard" },
    { id: "2", type: "nearby_issue", title: "New Issue Nearby", message: "Garbage dump reported 500m from your location.", time: "15 min ago", read: false },
    { id: "3", type: "resolution", title: "Issue Resolved!", message: "Street light complaint on Station Rd has been resolved with photo proof.", time: "1 hr ago", read: false, link: "/dashboard" },
    { id: "4", type: "upvote", title: "Your Report Gained Votes", message: "Water leakage issue received 5 new upvotes.", time: "3 hrs ago", read: true },
    { id: "5", type: "system", title: "Welcome to CivicPulse!", message: "Earn points by reporting issues and helping your community.", time: "1 day ago", read: true },
    { id: "6", type: "status_change", title: "Escalated!", message: "SLA deadline passed — drainage issue escalated to zonal officer.", time: "5 hrs ago", read: false, link: "/dashboard" },
];

export default function NotificationCenter() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(DEFAULT_NOTIFICATIONS);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unread = notifications.filter((n) => !n.read).length;

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    const markRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    const clearAll = () => setNotifications([]);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-xl hover:bg-white/5 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="size-5" />
                {unread > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-background"
                    >
                        {unread}
                    </motion.span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-[380px] max-h-[500px] rounded-2xl border border-border/30 bg-card/95 backdrop-blur-xl shadow-2xl shadow-black/30 overflow-hidden z-[200]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
                            <h3 className="font-semibold text-sm">Notifications</h3>
                            <div className="flex items-center gap-2">
                                {unread > 0 && (
                                    <button onClick={markAllRead} className="text-[11px] text-primary hover:underline">
                                        Mark all read
                                    </button>
                                )}
                                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/5">
                                    <X className="size-4 text-muted-foreground" />
                                </button>
                            </div>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto max-h-[380px] scrollbar-hide">
                            {notifications.length === 0 ? (
                                <div className="py-12 text-center text-sm text-muted-foreground">
                                    <Bell className="size-8 mx-auto mb-2 opacity-30" />
                                    No notifications yet.
                                </div>
                            ) : (
                                notifications.map((n) => {
                                    const Icon = ICONS[n.type] || Bell;
                                    const content = (
                                        <div
                                            key={n.id}
                                            onClick={() => markRead(n.id)}
                                            className={cn(
                                                "flex gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors cursor-pointer border-b border-border/10",
                                                !n.read && "bg-primary/[0.03]"
                                            )}
                                        >
                                            <div className={cn("p-2 rounded-xl shrink-0 h-fit", ICON_COLORS[n.type])}>
                                                <Icon className="size-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <p className={cn("text-sm font-medium", !n.read && "text-foreground")}>{n.title}</p>
                                                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                                                </div>
                                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                                                <p className="text-[10px] text-muted-foreground/60 mt-1 flex items-center gap-1">
                                                    <Clock className="size-3" /> {n.time}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                    return n.link ? <Link key={n.id} href={n.link}>{content}</Link> : <div key={n.id}>{content}</div>;
                                })
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-2.5 border-t border-border/20 flex items-center justify-between">
                                <button onClick={clearAll} className="text-[11px] text-muted-foreground hover:text-rose-400 flex items-center gap-1 transition-colors">
                                    <Trash2 className="size-3" /> Clear All
                                </button>
                                <span className="text-[10px] text-muted-foreground">{notifications.length} notification{notifications.length !== 1 ? "s" : ""}</span>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
