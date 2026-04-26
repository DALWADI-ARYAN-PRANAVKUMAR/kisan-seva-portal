import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sprout, ShoppingBasket, ShieldCheck, Languages, Smartphone, Zap,
  Users, BarChart3, Heart, ArrowRight, Github, Network
} from "lucide-react";

const features = [
  { icon: Sprout, title: "Crop Listings", desc: "Farmers post crops with images, price & quantity in seconds.", color: "text-primary" },
  { icon: ShoppingBasket, title: "Easy Checkout", desc: "Buyers add to cart and place orders with a delightful animation.", color: "text-secondary" },
  { icon: Zap, title: "Realtime Sync", desc: "Orders appear instantly on the farmer's dashboard.", color: "text-accent" },
  { icon: ShieldCheck, title: "Secure Auth", desc: "Mobile + password login with Row-Level Security on every table.", color: "text-primary" },
  { icon: Languages, title: "Bilingual", desc: "Full English & Hindi support powered by i18next.", color: "text-secondary" },
  { icon: Smartphone, title: "Mobile-First", desc: "Responsive design that works beautifully on any device.", color: "text-accent" },
  { icon: BarChart3, title: "Smart Dashboards", desc: "Earnings for farmers, spendings & order history for buyers.", color: "text-primary" },
  { icon: Users, title: "Role-Based", desc: "Separate experiences for buyers and farmers, secured server-side.", color: "text-secondary" },
];

const techStack = [
  { name: "React 18 + Vite", category: "Frontend" },
  { name: "TypeScript", category: "Language" },
  { name: "Tailwind CSS + shadcn/ui", category: "Styling" },
  { name: "Framer Motion", category: "Animations" },
  { name: "React Router v6", category: "Routing" },
  { name: "TanStack Query", category: "Data Fetching" },
  { name: "i18next", category: "i18n" },
  { name: "Lovable Cloud (Supabase)", category: "Backend" },
  { name: "PostgreSQL + RLS", category: "Database" },
  { name: "Supabase Realtime", category: "Live Updates" },
  { name: "Supabase Auth", category: "Authentication" },
  { name: "React Hook Form + Zod", category: "Forms" },
];

const workflow = [
  { step: "1", title: "Farmer Posts Crop", desc: "Adds image, price, and quantity to the marketplace." },
  { step: "2", title: "Buyer Browses", desc: "Discovers fresh produce and adds items to cart." },
  { step: "3", title: "Order Placed", desc: "Checkout writes to orders & order_items with RLS." },
  { step: "4", title: "Success Animation", desc: "Buyer sees a beautiful confirmation animation." },
  { step: "5", title: "Realtime Update", desc: "Farmer's dashboard updates instantly with the new order." },
];

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <section className="container py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-5">
            📖 About Kisan Seva
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-5 leading-tight">
            Connecting <span className="text-primary">Farmers</span> directly to{" "}
            <span className="text-secondary">Buyers</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Kisan Seva is a modern, bilingual digital marketplace that eliminates middlemen — ensuring fair
            prices for Indian farmers and fresh produce for buyers, straight from the source.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="gradient-hero">
              <Link to="/marketplace">Explore Marketplace <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/architecture"><Network className="mr-2 h-4 w-4" /> View Architecture</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="container py-12">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Features</h2>
          <p className="text-muted-foreground">Everything Kisan Seva offers — built with care.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card className="p-6 h-full hover-scale border-2 hover:border-primary/30 transition-all">
                <div className={`h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground">From crop listing to delivery — in 5 simple steps.</p>
        </div>
        <div className="max-w-4xl mx-auto space-y-4">
          {workflow.map((w, i) => (
            <motion.div
              key={w.step}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Card className="p-5 flex items-center gap-5 hover:shadow-lg transition-all">
                <div className="h-14 w-14 shrink-0 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-display font-bold text-2xl">
                  {w.step}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{w.title}</h3>
                  <p className="text-sm text-muted-foreground">{w.desc}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="container py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Technology Stack</h2>
          <p className="text-muted-foreground">Modern, reliable, and built for scale.</p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
          {techStack.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
            >
              <div className="p-4 rounded-xl border-2 border-border bg-card hover:border-primary/40 transition-all">
                <div className="text-xs text-muted-foreground mb-1">{t.category}</div>
                <div className="font-semibold text-sm">{t.name}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16">
        <Card className="p-10 md:p-14 text-center gradient-hero text-primary-foreground">
          <Heart className="h-12 w-12 mx-auto mb-4" />
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Built with love for Indian farmers
          </h2>
          <p className="text-primary-foreground/90 mb-6 max-w-xl mx-auto">
            Join the movement to bring fairness, transparency, and dignity to agriculture.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/auth">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </Card>
      </section>
    </Layout>
  );
}
