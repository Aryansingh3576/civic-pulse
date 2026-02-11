// app/dashboard/page.tsx — Premium Dashboard
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    BarChart3,
    Clock,
    CheckCircle2,
    AlertTriangle,
    FileText,
    ChevronRight,
    MapPin,
    Filter,
    TrendingUp,
    Loader2,
    Plus,
} from "lucide-react";
import { Container } from "@/components/ui/grid";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import StatusBadge from "@/components/status-badge";

interface Complaint {
    id: string;
    title: string;
    status: string;
    category: string;
    address: string;
    priority_score: number;
    submitted_at: string;
}

function normalizeStatus(status: string): string {
    const map: Record<string, string> = {
        "Submitted": "submitted",
        "In Progress": "in_progress",
        "Resolved": "resolved",
        "Closed": "resolved",
        "Escalated": "escalated",
    };
    return map[status] || status.toLowerCase();
}

const filters = [
    { id: "all", label: "All Reports" },
    { id: "submitted", label: "Pending" },
    { id: "in_progress", label: "In Progress" },
    { id: "resolved", label: "Resolved" },
];

export default function DashboardPage() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch real data
        api.get("/complaints")
            .then((res) => {
                const raw = res.data?.data?.complaints || res.data;
                if (Array.isArray(raw)) {
                    setComplaints(raw.map((c: any) => ({
                        id: String(c.id),
                        title: c.title || "Untitled Report",
                        status: normalizeStatus(c.status || "submitted"),
                        category: c.category || "General",
                        address: c.address || "Unknown location",
                        priority_score: c.priority_score || c.priority || 50,
                        submitted_at: c.created_at || c.submitted_at || new Date().toISOString(),
                    })));
                }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const filtered = filter === "all" ? complaints : complaints.filter((c) => c.status === filter);

    const stats = [
        { label: "Total Reports", value: complaints.length, icon: FileText, color: "text-blue-400", bg: "bg-blue-400/10" },
        { label: "Resolved", value: complaints.filter(c => c.status === "resolved").length, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
        { label: "Pending", value: complaints.filter(c => c.status === "submitted").length, icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
        { label: "High Priority", value: complaints.filter(c => c.priority_score > 70).length, icon: AlertTriangle, color: "text-rose-400", bg: "bg-rose-400/10" },
    ];

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6">
            <Container className="max-w-6xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-bold font-[family-name:var(--font-outfit)] mb-2"
                        >
                            Dashboard
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-muted-foreground"
                        >
                            Track real-time issues across your community.
                        </motion.p>
                    </div>

                    <Link href="/report">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                        >
                            <Plus className="size-5" />
                            New Report
                        </motion.button>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card p-6"
                        >
                            <div className={cn("inline-flex p-3 rounded-xl mb-4", stat.bg, stat.color)}>
                                <stat.icon className="size-6" />
                            </div>
                            <div className="text-3xl font-bold tabular-nums mb-1">{stat.value}</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    {filters.map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                                filter === f.id
                                    ? "bg-primary/10 text-primary border border-primary/20"
                                    : "bg-surface text-muted-foreground hover:bg-white/5 border border-transparent"
                            )}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="size-10 text-primary animate-spin mb-4" />
                        <p className="text-muted-foreground">Syncing data...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 px-6 glass-card border-dashed border-2 border-white/10">
                        <FileText className="size-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-1">No reports found</h3>
                        <p className="text-muted-foreground">Try adjusting your filters or submit a new report.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((complaint, i) => (
                            <ComplaintCard key={complaint.id} complaint={complaint} index={i} />
                        ))}
                    </div>
                )}
            </Container>
        </div>
    );
}

function ComplaintCard({ complaint, index }: { complaint: Complaint; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link href={`/dashboard/${complaint.id}`}>
                <div className="group glass-card p-5 hover:bg-white/[0.02] transition-colors border-white/5 hover:border-primary/20 cursor-pointer flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                    <div className="flex gap-4 items-start">
                        <div className={cn(
                            "flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br border border-white/10 shrink-0",
                            complaint.priority_score > 70 ? "from-rose-500/20 to-rose-900/20 text-rose-400" : "from-primary/20 to-primary/10 text-primary"
                        )}>
                            <TrendingUp className="size-5" />
                        </div>

                        <div>
                            <h3 className="text-lg font-medium group-hover:text-primary transition-colors mb-1">
                                {complaint.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <MapPin className="size-3.5" />
                                    {complaint.address}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                <span>{new Date(complaint.submitted_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pl-16 sm:pl-0">
                        <StatusBadge status={complaint.status} />
                        <ChevronRight className="size-5 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
