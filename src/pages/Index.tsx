import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBasket, Tractor, Wheat, Apple, Carrot, Sparkles, Truck, IndianRupee, ShieldCheck, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import logo from "@/assets/logo.png";

const fade = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Layout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-warm opacity-60" />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
        <div className="container relative pt-6 md:pt-10 pb-16 md:pb-24">
          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="flex justify-center mb-4 md:mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-3xl scale-110" />
              <img src={logo} alt="Kisan Seva" className="relative h-40 w-40 sm:h-52 sm:w-52 md:h-72 md:w-72 lg:h-80 lg:w-80 animate-float drop-shadow-2xl" />
            </div>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-center text-secondary font-semibold tracking-widest text-xs uppercase mb-3">
            {t("hero.kicker")}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-center text-balance max-w-3xl mx-auto leading-tight">
            {t("hero.title")}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center text-muted-foreground mt-4 max-w-2xl mx-auto text-sm md:text-lg">
            {t("hero.subtitle")}
          </motion.p>

          <div className="mt-12 grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {[
              { icon: ShoppingBasket, title: t("hero.buyer"), desc: t("hero.buyerDesc"), btn: t("hero.toMarket"), to: "/marketplace", color: "primary" as const },
              { icon: Tractor, title: t("hero.seller"), desc: t("hero.sellerDesc"), btn: t("hero.toDashboard"), to: "/dashboard", color: "secondary" as const },
            ].map((c, i) => (
              <motion.div key={c.title} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.15 }} className="rounded-2xl bg-card border border-border p-7 hover-lift shadow-soft">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${c.color === "primary" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>
                  <c.icon className="h-6 w-6" />
                </div>
                <h2 className="font-display text-2xl font-bold mb-2">{c.title}</h2>
                <p className="text-muted-foreground mb-5 text-sm leading-relaxed">{c.desc}</p>
                <Button onClick={() => navigate(c.to)} className={c.color === "primary" ? "bg-primary hover:bg-primary/90" : "bg-secondary hover:bg-secondary/90"}>
                  {c.btn} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container py-20">
        <motion.div {...fade} className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold">{t("sections.fresh")}</h2>
          <p className="text-muted-foreground mt-2">{t("sections.freshSub")}</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Wheat, key: "grains", color: "bg-primary/10 text-primary" },
            { icon: Apple, key: "fruits", color: "bg-secondary/10 text-secondary" },
            { icon: Carrot, key: "vegetables", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
          ].map((c, i) => (
            <motion.button key={c.key} {...fade} transition={{ delay: i * 0.1 }} onClick={() => navigate("/marketplace")} className="rounded-2xl bg-card border border-border p-8 text-center hover-lift">
              <div className={`h-16 w-16 rounded-2xl ${c.color} mx-auto flex items-center justify-center mb-4`}><c.icon className="h-8 w-8" /></div>
              <h3 className="font-display text-xl font-semibold">{t(`cats.${c.key}`)}</h3>
              <p className="text-sm text-muted-foreground mt-2">{t(`catsDesc.${c.key}`)}</p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-surface-low py-20">
        <div className="container">
          <motion.div {...fade} className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold">{t("sections.how")}</h2>
            <p className="text-muted-foreground mt-2">{t("sections.howSub")}</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {(["buyers", "farmers"] as const).map((g) => (
              <motion.div key={g} {...fade} className="space-y-4">
                <h3 className={`font-display text-xl font-semibold flex items-center gap-2 ${g === "buyers" ? "text-primary" : "text-secondary"}`}>
                  {g === "buyers" ? <ShoppingBasket className="h-5 w-5" /> : <Tractor className="h-5 w-5" />}
                  {t(`${g}.title`)}
                </h3>
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex gap-4">
                    <div className={`shrink-0 h-8 w-8 rounded-full font-bold text-sm flex items-center justify-center ${s === 3 ? (g === "buyers" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground") : "bg-muted text-muted-foreground"}`}>{s}</div>
                    <div>
                      <p className="font-semibold">{t(`${g}.s${s}`)}</p>
                      <p className="text-sm text-muted-foreground">{t(`${g}.s${s}d`)}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section id="about" className="container py-20">
        <motion.div {...fade} className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold">{t("sections.why")}</h2>
          <p className="text-muted-foreground mt-2">{t("sections.whySub")}</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { icon: Sparkles, title: t("why.fresh"), desc: t("why.freshDesc"), color: "text-primary" },
            { icon: IndianRupee, title: t("why.prices"), desc: t("why.pricesDesc"), color: "text-secondary" },
            { icon: Truck, title: t("why.direct"), desc: t("why.directDesc"), color: "text-amber-600 dark:text-amber-400" },
            { icon: ShieldCheck, title: t("why.agmark"), desc: t("why.agmarkDesc"), color: "text-emerald-600 dark:text-emerald-400" },
          ].map((w, i) => (
            <motion.div key={w.title} {...fade} transition={{ delay: i * 0.1 }} className="rounded-2xl bg-card border border-border p-6 hover-lift">
              <w.icon className={`h-8 w-8 ${w.color} mb-3`} />
              <h3 className="font-display font-semibold text-lg">{w.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{w.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="bg-[hsl(220_25%_10%)] text-white py-14">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { v: "40%", k: "stats.profit", c: "text-primary" },
            { v: "24h", k: "stats.time", c: "text-secondary-soft" },
            { v: "10k+", k: "stats.farmers", c: "text-white" },
            { v: "50k+", k: "stats.consumers", c: "text-white" },
          ].map((s, i) => (
            <motion.div key={s.k} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <p className={`font-display text-4xl md:text-5xl font-bold ${s.c}`}>{s.v}</p>
              <p className="text-xs uppercase tracking-wider mt-2 text-white/60">{t(s.k)}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
