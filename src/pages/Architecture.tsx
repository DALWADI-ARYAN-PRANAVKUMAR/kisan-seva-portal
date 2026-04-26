import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import {
  Smartphone, Globe, Database, Lock, Zap, Cloud, Box, Users,
  ArrowDown, ArrowRight, Server, FileCode, Palette, Languages
} from "lucide-react";

const colorMap: Record<string, { border: string; bg: string; text: string; bgSolid: string; bgFg: string; borderSoft: string; bgSoft: string }> = {
  primary: {
    border: "border-primary/40", bg: "bg-primary/15", text: "text-primary",
    bgSolid: "bg-primary", bgFg: "text-primary-foreground",
    borderSoft: "border-primary/30", bgSoft: "bg-primary/5",
  },
  secondary: {
    border: "border-secondary/40", bg: "bg-secondary/15", text: "text-secondary",
    bgSolid: "bg-secondary", bgFg: "text-secondary-foreground",
    borderSoft: "border-secondary/30", bgSoft: "bg-secondary/5",
  },
  accent: {
    border: "border-accent/40", bg: "bg-accent/15", text: "text-accent",
    bgSolid: "bg-accent", bgFg: "text-accent-foreground",
    borderSoft: "border-accent/30", bgSoft: "bg-accent/5",
  },
};

const Node = ({ icon: Icon, title, subtitle, color = "primary", className = "" }: any) => {
  const c = colorMap[color];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`relative rounded-2xl border-2 ${c.border} bg-card p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all min-w-[140px] ${className}`}
    >
      <div className={`h-10 w-10 rounded-lg ${c.bg} ${c.text} flex items-center justify-center mb-2 mx-auto`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-center">
        <div className="font-bold text-sm">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
      </div>
    </motion.div>
  );
};

const Layer = ({ title, color, children }: any) => {
  const c = colorMap[color];
  return (
    <div className={`relative rounded-3xl border-2 border-dashed ${c.borderSoft} ${c.bgSoft} p-5 md:p-6`}>
      <div className={`absolute -top-3 left-5 px-3 py-0.5 rounded-full ${c.bgSolid} ${c.bgFg} text-xs font-bold uppercase tracking-wider`}>
        {title}
      </div>
      <div className="flex flex-wrap gap-3 justify-center pt-2">{children}</div>
    </div>
  );
};

export default function Architecture() {
  return (
    <Layout>
      <section className="container py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto text-center mb-10"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/15 text-secondary text-sm font-semibold mb-4">
            🏗️ System Architecture
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            How Kisan Seva is Built
          </h1>
          <p className="text-muted-foreground">
            A complete view of the frontend, backend, database, and the data flow powering the platform.
          </p>
        </motion.div>

        {/* Architecture Diagram */}
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Users */}
          <Layer title="Users" color="accent">
            <Node icon={Users} title="Farmer" subtitle="Posts & manages crops" color="accent" />
            <Node icon={Users} title="Buyer" subtitle="Browses & orders" color="accent" />
          </Layer>

          <div className="flex justify-center"><ArrowDown className="h-6 w-6 text-muted-foreground" /></div>

          {/* Client Layer */}
          <Layer title="Client (Browser)" color="primary">
            <Node icon={Smartphone} title="React 18" subtitle="+ Vite + TS" />
            <Node icon={Palette} title="Tailwind" subtitle="+ shadcn/ui" />
            <Node icon={Zap} title="Framer Motion" subtitle="Animations" />
            <Node icon={Languages} title="i18next" subtitle="EN / HI" />
            <Node icon={Globe} title="React Router" subtitle="Pages" />
          </Layer>

          <div className="flex justify-center"><ArrowDown className="h-6 w-6 text-muted-foreground" /></div>

          {/* State Layer */}
          <Layer title="State & Data" color="secondary">
            <Node icon={Box} title="Auth Provider" subtitle="Session" color="secondary" />
            <Node icon={Box} title="Cart Provider" subtitle="Items" color="secondary" />
            <Node icon={Box} title="Theme Provider" subtitle="Dark / Light" color="secondary" />
            <Node icon={FileCode} title="TanStack Query" subtitle="Server state" color="secondary" />
          </Layer>

          <div className="flex justify-center"><ArrowDown className="h-6 w-6 text-muted-foreground" /></div>

          {/* Backend */}
          <Layer title="Lovable Cloud (Backend)" color="primary">
            <Node icon={Lock} title="Auth" subtitle="Phone + Password" />
            <Node icon={Zap} title="Realtime" subtitle="Postgres Changes" />
            <Node icon={Cloud} title="Storage" subtitle="Crop Images" />
            <Node icon={Server} title="RLS Policies" subtitle="Per-row security" />
          </Layer>

          <div className="flex justify-center"><ArrowDown className="h-6 w-6 text-muted-foreground" /></div>

          {/* Database */}
          <Layer title="PostgreSQL Database" color="accent">
            <Node icon={Database} title="profiles" subtitle="users + role" color="accent" />
            <Node icon={Database} title="user_roles" subtitle="buyer / farmer" color="accent" />
            <Node icon={Database} title="listings" subtitle="crops" color="accent" />
            <Node icon={Database} title="orders" subtitle="purchases" color="accent" />
            <Node icon={Database} title="order_items" subtitle="line items" color="accent" />
          </Layer>
        </div>

        {/* Data Flow */}
        <div className="max-w-5xl mx-auto mt-16">
          <h2 className="font-display text-3xl font-bold text-center mb-8">Order Flow (Realtime)</h2>
          <Card className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {[
                { icon: Users, label: "Buyer", color: "accent" },
                { icon: Box, label: "Cart", color: "secondary" },
                { icon: Lock, label: "Checkout + RLS", color: "primary" },
                { icon: Database, label: "orders + items", color: "accent" },
                { icon: Zap, label: "Realtime", color: "secondary" },
                { icon: Users, label: "Farmer Dashboard", color: "primary" },
              ].map((s, i, arr) => (
                <div key={i} className="flex items-center gap-3">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className={`h-14 w-14 rounded-2xl ${colorMap[s.color].bg} ${colorMap[s.color].text} flex items-center justify-center border-2 ${colorMap[s.color].borderSoft}`}>
                      <s.icon className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold text-center max-w-[80px]">{s.label}</span>
                  </motion.div>
                  {i < arr.length - 1 && <ArrowRight className="h-5 w-5 text-muted-foreground hidden md:block" />}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Tech Summary */}
        <div className="max-w-5xl mx-auto mt-16 grid md:grid-cols-3 gap-5">
          <Card className="p-6">
            <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center mb-3">
              <Smartphone className="h-5 w-5" />
            </div>
            <h3 className="font-bold mb-2">Frontend</h3>
            <p className="text-sm text-muted-foreground">
              React 18, Vite 5, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, React Router, TanStack Query, i18next.
            </p>
          </Card>
          <Card className="p-6">
            <div className="h-10 w-10 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center mb-3">
              <Cloud className="h-5 w-5" />
            </div>
            <h3 className="font-bold mb-2">Backend</h3>
            <p className="text-sm text-muted-foreground">
              Lovable Cloud (Supabase) — Auth, Realtime, Storage, and PostgreSQL with Row-Level Security policies.
            </p>
          </Card>
          <Card className="p-6">
            <div className="h-10 w-10 rounded-lg bg-accent/15 text-accent flex items-center justify-center mb-3">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="font-bold mb-2">Database</h3>
            <p className="text-sm text-muted-foreground">
              PostgreSQL with 5 core tables: profiles, user_roles, listings, orders, order_items — secured by RLS + helper functions.
            </p>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
