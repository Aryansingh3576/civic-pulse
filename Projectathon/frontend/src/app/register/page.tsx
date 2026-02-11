// app/register/page.tsx — Registration page
// Follows: All SKILL.MD files
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus, Loader2, Mail, Lock, User, Phone, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Container } from "@/components/ui/grid";
import { useAuth } from "@/providers/AuthProvider";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { register } = useAuth();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name || !email || !password || !confirmPassword) {
            setError("Please fill in all required fields.");
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            await register({ name, email, phone, password });
        } catch (err: any) {
            const message = err?.response?.data?.message || "Registration failed. Please try again.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <section className="py-12 sm:py-20" aria-labelledby="register-heading">
            <Container size="sm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-md mx-auto"
                >
                    <div className="text-center mb-8">
                        <Shield
                            className="size-10 text-primary mx-auto mb-4"
                            aria-hidden="true"
                        />
                        <h1
                            id="register-heading"
                            className="text-2xl sm:text-3xl font-bold mb-1"
                        >
                            Create Account
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Join CivicPulse and start making a difference
                        </p>
                    </div>

                    <Card className="glass-card">
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="register-name">Full Name *</Label>
                                    <div className="relative">
                                        <User
                                            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                                            aria-hidden="true"
                                        />
                                        <Input
                                            id="register-name"
                                            name="name"
                                            placeholder="Your full name…"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="pl-9"
                                            autoComplete="name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-email">Email *</Label>
                                    <div className="relative">
                                        <Mail
                                            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                                            aria-hidden="true"
                                        />
                                        <Input
                                            id="register-email"
                                            name="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-9"
                                            autoComplete="email"
                                            spellCheck={false}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-phone">Phone (optional)</Label>
                                    <div className="relative">
                                        <Phone
                                            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                                            aria-hidden="true"
                                        />
                                        <Input
                                            id="register-phone"
                                            name="phone"
                                            type="tel"
                                            placeholder="+91 9876543210"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="pl-9"
                                            autoComplete="tel"
                                            inputMode="tel"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-password">Password *</Label>
                                    <div className="relative">
                                        <Lock
                                            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                                            aria-hidden="true"
                                        />
                                        <Input
                                            id="register-password"
                                            name="password"
                                            type="password"
                                            placeholder="Min 8 characters…"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-9"
                                            autoComplete="new-password"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="register-confirm">Confirm Password *</Label>
                                    <div className="relative">
                                        <Lock
                                            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                                            aria-hidden="true"
                                        />
                                        <Input
                                            id="register-confirm"
                                            name="confirmPassword"
                                            type="password"
                                            placeholder="Confirm your password…"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="pl-9"
                                            autoComplete="new-password"
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div
                                        role="alert"
                                        className="text-sm text-destructive bg-destructive/10 rounded-md p-3"
                                    >
                                        {error}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2
                                                className="size-4 mr-2 animate-spin"
                                                aria-hidden="true"
                                            />
                                            Creating account…
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="size-4 mr-2" aria-hidden="true" />
                                            Create Account
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="justify-center pb-6">
                            <p className="text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Link
                                    href="/login"
                                    className="text-primary font-medium cursor-pointer hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </CardFooter>
                    </Card>
                </motion.div>
            </Container>
        </section>
    );
}
