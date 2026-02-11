"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mic,
    MapPin,
    Loader2,
    Send,
    CheckCircle2,
    X,
    Upload,
    AlertTriangle,
    Droplets,
    Lightbulb,
    Trash2,
    Car,
    TreePine,
    Wrench,
    Shield,
    LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";

const categories = [
    { id: "road_damage", label: "Road Damage", icon: AlertTriangle },
    { id: "sanitation", label: "Sanitation", icon: Trash2 },
    { id: "streetlight", label: "Streetlights", icon: Lightbulb },
    { id: "water_supply", label: "Water Supply", icon: Droplets },
    { id: "parks", label: "Parks", icon: TreePine },
    { id: "traffic", label: "Traffic", icon: Car },
    { id: "public_safety", label: "Public Safety", icon: Shield },
    { id: "other", label: "Other", icon: Wrench },
];

export default function ComplaintForm() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [address, setAddress] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setError("Photo must be under 5 MB");
            return;
        }
        setPhoto(file);
        setPhotoPreview(URL.createObjectURL(file));
        setError("");
    }

    function removePhoto() {
        setPhoto(null);
        if (photoPreview) URL.revokeObjectURL(photoPreview);
        setPhotoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    async function handleVoiceInput() {
        const win = window as any;
        const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;

        if (!SpeechRecognitionAPI) {
            setError("Voice input is not supported in this browser.");
            return;
        }

        if (isRecording) {
            setIsRecording(false);
            return;
        }

        setIsRecording(true);
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
            setIsRecording(false);
        };

        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognition.start();
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim() || !description.trim() || !selectedCategory) {
            setError("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const categoryLabel = categories.find((c) => c.id === selectedCategory)?.label || selectedCategory;

            // Send as JSON since backend expects JSON content for now
            // Future improvement: FormData for genuine file upload
            await api.post("/complaints", {
                title,
                description,
                category: categoryLabel,
                address,
                // photo: photoPreview // Base64 or URL could go here if backend supported it
            });

            setIsSuccess(true);
        } catch (err: any) {
            const message = err?.response?.data?.message || "Failed to submit report. Please try again.";
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleReset() {
        setTitle("");
        setDescription("");
        setSelectedCategory("");
        setAddress("");
        removePhoto();
        setIsSuccess(false);
        setError("");
    }

    // Auth Gate
    if (!authLoading && !isAuthenticated) {
        return (
            <div className="glass-card max-w-xl mx-auto p-12 text-center border-primary/20">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
                    <Shield className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold font-[family-name:var(--font-outfit)] mb-3">Sign In Required</h2>
                <p className="text-muted-foreground mb-8 text-lg">
                    To ensure accountability and track your impact, please sign in to report an issue.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="rounded-full px-8">
                        <Link href="/login">
                            <LogIn className="mr-2 size-4" /> Sign In
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                        <Link href="/register">Create Account</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <Card className="glass-card border-white/5 overflow-hidden">
            <AnimatePresence mode="wait">
                {isSuccess ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                        className="py-16 px-6 text-center"
                    >
                        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 mb-8 border border-emerald-500/20">
                            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                        </div>
                        <h2 className="text-3xl font-bold font-[family-name:var(--font-outfit)] mb-4">Report Submitted</h2>
                        <p className="text-muted-foreground mb-10 max-w-md mx-auto text-lg">
                            Thank you for being a proactive citizen! Your report has been logged and points have been added to your profile.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button onClick={handleReset} variant="outline" className="rounded-full w-full sm:w-auto">Report Another</Button>
                            <Button asChild className="rounded-full w-full sm:w-auto">
                                <Link href="/dashboard">View Dashboard</Link>
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-6 sm:p-8"
                    >
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold font-[family-name:var(--font-outfit)] mb-2 flex items-center gap-2">
                                <Send className="size-5 text-primary" /> Report an Issue
                            </h2>
                            <p className="text-muted-foreground">
                                Detailed reports help us resolve issues faster.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-base">Title</Label>
                                <Input
                                    id="title"
                                    placeholder="Brief summary of the issue..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="bg-black/20 border-white/10 h-12 text-lg focus-visible:ring-primary/50"
                                    required
                                />
                            </div>

                            {/* Category Grid */}
                            <div className="space-y-3">
                                <Label className="text-base">Category</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {categories.map((cat) => {
                                        const Icon = cat.icon;
                                        const isSelected = selectedCategory === cat.id;
                                        return (
                                            <div
                                                key={cat.id}
                                                onClick={() => setSelectedCategory(cat.id)}
                                                className={cn(
                                                    "cursor-pointer flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 gap-2",
                                                    isSelected
                                                        ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_-3px_var(--color-primary)]"
                                                        : "bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10 text-muted-foreground"
                                                )}
                                            >
                                                <Icon className="size-6" />
                                                <span className="text-xs font-medium text-center">{cat.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Description & Voice */}
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-base">Description</Label>
                                <div className="relative">
                                    <Textarea
                                        id="description"
                                        placeholder="Describe the location, severity, and any other details..."
                                        rows={5}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="bg-black/20 border-white/10 resize-none pr-12 text-base focus-visible:ring-primary/50"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={handleVoiceInput}
                                        className={cn(
                                            "absolute bottom-3 right-3 p-2 rounded-full transition-all",
                                            isRecording
                                                ? "bg-red-500/20 text-red-500 animate-pulse"
                                                : "bg-white/5 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                        )}
                                    >
                                        <Mic className="size-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-base">Location</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                                    <Input
                                        id="address"
                                        placeholder="Nearest landmark or street address..."
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="bg-black/20 border-white/10 pl-10 h-12 focus-visible:ring-primary/50"
                                    />
                                </div>
                            </div>

                            {/* Photo Upload */}
                            <div className="space-y-2">
                                <Label className="text-base">Photo Evidence</Label>
                                {photoPreview ? (
                                    <div className="relative rounded-xl overflow-hidden border border-white/10 h-64 group bg-black/40">
                                        <img src={photoPreview} alt="Preview" className="w-full h-full object-contain" />
                                        <button
                                            type="button"
                                            onClick={removePhoto}
                                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-500/80 transition-colors"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-white/10 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
                                    >
                                        <Upload className="size-8 text-muted-foreground mb-2 group-hover:text-primary group-hover:scale-110 transition-transform" />
                                        <p className="text-sm text-muted-foreground group-hover:text-primary/80">Click to upload photo</p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handlePhotoChange}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-2">
                                    <AlertTriangle className="size-5" />
                                    {error}
                                </div>
                            )}

                            {/* Submit */}
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all font-semibold"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 size-5 animate-spin" /> Submitting...
                                    </>
                                ) : (
                                    "Submit Report"
                                )}
                            </Button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}
