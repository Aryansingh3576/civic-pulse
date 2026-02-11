"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Shield, Zap, Activity, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[128px] animate-pulse-glow" style={{ animationDelay: "1s" }} />
        </div>

        <motion.div
          style={{ y, opacity }}
          className="text-center max-w-4xl mx-auto space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full border-primary/30 bg-primary/5 text-primary backdrop-blur-md">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              CivicPulse 2.0 is Live
            </Badge>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight font-[family-name:var(--font-outfit)] leading-[1.1]">
              Empower Your <br />
              <span className="gradient-text">Community</span> Today.
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Report infrastructure issues, track real-time resolution, and earn rewards for making your city a better place to live.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button asChild size="lg" className="h-12 px-8 rounded-full text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105 active:scale-95">
              <Link href="/dashboard">
                Launch Dashboard <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-full text-base bg-background/50 hover:bg-background/80 border-white/10 hover:border-white/20 backdrop-blur-md transition-all">
              <Link href="/report">Submit a Report</Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/50"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 sm:py-32 relative">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Zap}
              title="Real-Time Tracking"
              description="Monitor the status of your reports instantly. Get notified when issues are resolved."
              delay={0}
            />
            <FeatureCard
              icon={Shield}
              title="Secure & Private"
              description="Your data is encrypted. Report anonymously or build a trusted profile."
              delay={0.1}
            />
            <FeatureCard
              icon={Activity}
              title="Gamified Impact"
              description="Earn points and badges for your contributions. Compete on the leaderboard."
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -skew-y-3 transform origin-bottom-left scale-110" />
        <div className="container px-4 md:px-6 mx-auto relative">
          <div className="max-w-3xl mx-auto text-center space-y-8 glass-card p-12 md:p-16 border-primary/20 bg-primary/5">
            <h2 className="text-3xl sm:text-5xl font-bold font-[family-name:var(--font-outfit)]">
              Ready to make a difference?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of citizens who are actively shaping their future.
            </p>
            <Button asChild size="lg" variant="default" className="h-14 px-10 rounded-full text-lg shadow-xl shadow-primary/20">
              <Link href="/register">
                Get Started Now <ChevronRight className="ml-2 size-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      className="glass-card p-8 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10">
        <div className="mb-6 inline-flex items-center justify-center size-12 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
          <Icon className="size-6" />
        </div>
        <h3 className="text-xl font-semibold mb-3 font-[family-name:var(--font-outfit)]">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
