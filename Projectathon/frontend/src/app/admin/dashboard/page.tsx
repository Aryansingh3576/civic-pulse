"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    TrendingUp,
    Users,
    AlertTriangle,
    CheckCircle2,
    MoreHorizontal,
    MapPin,
    ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api";
import StatusBadge from "@/components/status-badge";
import Link from "next/link";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        resolved: 0,
        critical: 0
    });
    const [recentReports, setRecentReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // In a real app, these would be separate optimized endpoints
                // For now, we fetch all complaints and calculate
                const res = await api.get("/complaints");
                const data = res.data?.data?.complaints || [];

                setStats({
                    total: data.length,
                    pending: data.filter((c: any) => c.status === "Submitted" || c.status === "submitted").length,
                    resolved: data.filter((c: any) => c.status === "Resolved" || c.status === "resolved").length,
                    critical: data.filter((c: any) => (c.priority_score || c.priority) > 80).length
                });

                setRecentReports(data.slice(0, 5));
            } catch (e) {
                console.error("Failed to fetch admin data", e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)] tracking-tight">Overview</h1>
                <p className="text-muted-foreground">Welcome back. Here's what's happening in your city.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Reports"
                    value={stats.total}
                    icon={TrendingUp}
                    description="+12% from last month"
                />
                <StatCard
                    title="Pending Review"
                    value={stats.pending}
                    icon={AlertTriangle}
                    description="Requires attention"
                    alert={stats.pending > 10}
                />
                <StatCard
                    title="Issues Resolved"
                    value={stats.resolved}
                    icon={CheckCircle2}
                    description="Great progress!"
                />
                <StatCard
                    title="Critical Issues"
                    value={stats.critical}
                    icon={AlertTriangle}
                    description="High priority"
                    critical
                />
            </div>

            {/* Recent Reports Table */}
            <Card className="glass-card border-white/5">
                <CardHeader>
                    <CardTitle>Recent Reports</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-white/5 border-white/5">
                                <TableHead>ID</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">Loading...</TableCell>
                                </TableRow>
                            ) : recentReports.map((report: any) => (
                                <TableRow key={report.id} className="hover:bg-white/5 border-white/5">
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        #{String(report.id).substring(0, 8)}
                                    </TableCell>
                                    <TableCell className="font-medium">{report.title}</TableCell>
                                    <TableCell>
                                        <StatusBadge status={report.status} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${report.priority_score || 50}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-muted-foreground">{report.priority_score || 50}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="size-3" />
                                            {report.address || "Unknown"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/complaints/${report.id}`}>
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>Mark as Resolved</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Delete Report</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, description, alert, critical }: any) {
    return (
        <Card className="glass-card border-white/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className={cn("h-4 w-4 text-muted-foreground", critical && "text-red-500", alert && "text-amber-500")} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}
