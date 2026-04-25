import { Layout } from "@/components/Layout";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Wallet, Package, Star, Plus, LayoutGrid, History, Tractor, BarChart3, IndianRupee, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { t } = useTranslation();

  const stats = [
    { icon: Wallet, label: t("dashboard.totalSales"), value: "₹45,200", sub: t("dashboard.totalSalesSub"), color: "text-secondary bg-secondary/10" },
    { icon: Package, label: t("dashboard.currentStock"), value: "1,250 kg", sub: t("dashboard.currentStockSub"), color: "text-primary bg-primary/10" },
    { icon: Star, label: t("dashboard.avgRating"), value: "4.8", sub: t("dashboard.avgRatingSub"), color: "text-amber-600 bg-amber-500/10 dark:text-amber-400" },
  ];

  const listings = [
    { title: "Premium Sharbati Wheat", price: 32, kg: 500, views: 124, img: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600" },
    { title: "Organic Green Peas", price: 85, kg: 150, views: 89, img: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=600" },
  ];

  const inquiries = [
    { name: "Anil Kumar", msg: "Interested in bulk order fo...", time: "2h ago", color: "bg-tertiary-500 bg-indigo-500" },
    { name: "Mandi Traders", msg: "What is the latest price for...", time: "5h ago", color: "bg-orange-500" },
    { name: "Rahul Sharma", msg: "Can you arrange transport...", time: "1d ago", color: "bg-secondary" },
  ];

  const orders = [
    { id: "#ORD-8924", crop: "Premium Sharbati Wheat", buyer: "Gopal Krishnan", qty: "200 kg", amt: "6,400", status: "completed" },
    { id: "#ORD-8912", crop: "Organic Green Peas", buyer: "Suresh Meena", qty: "50 kg", amt: "4,250", status: "processing" },
  ];

  const navItems = [
    { icon: LayoutGrid, key: "dashboard", active: true },
    { icon: History, key: "orders" },
    { icon: Tractor, key: "listings" },
    { icon: Wallet, key: "earnings" },
    { icon: BarChart3, key: "analytics" },
  ];

  return (
    <Layout>
      <div className="container py-8">
        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="rounded-2xl bg-card border border-border p-4 h-fit shadow-soft lg:sticky lg:top-20">
            <div className="flex items-center gap-3 px-2 pb-4 mb-3 border-b border-border">
              <div className="h-11 w-11 rounded-full bg-secondary/10 flex items-center justify-center text-secondary"><Tractor className="h-5 w-5" /></div>
              <div>
                <p className="font-display font-bold text-secondary">{t("dashboard.portal")}</p>
                <p className="text-xs text-muted-foreground">{t("dashboard.verifiedSeller")}</p>
              </div>
            </div>
            <nav className="space-y-1">
              {navItems.map((it) => (
                <button key={it.key} className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${it.active ? "bg-secondary/10 text-secondary" : "hover:bg-muted text-foreground/80"}`}>
                  {it.active && <span className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-secondary rounded-l-full" />}
                  <it.icon className="h-4 w-4" />{t(`dashboard.nav.${it.key}`)}
                </button>
              ))}
            </nav>
            <Button className="w-full mt-5 bg-primary hover:bg-primary/90 shadow-soft"><Plus className="h-4 w-4 mr-2" />{t("dashboard.post")}</Button>
          </aside>

          {/* Main */}
          <div className="space-y-6">
            <div>
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl md:text-4xl font-bold">{t("dashboard.overview")}</motion.h1>
              <p className="text-sm text-muted-foreground mt-1">{t("dashboard.overviewSub")}</p>
            </div>

            {/* Stat cards */}
            <div className="grid md:grid-cols-3 gap-4">
              {stats.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="rounded-2xl bg-card border border-border p-5 hover-lift shadow-soft">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${s.color}`}><s.icon className="h-4 w-4" /></div>
                    <span className="text-sm font-semibold">{s.label}</span>
                  </div>
                  <p className="font-display text-3xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-[1fr_280px] gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-xl font-bold">{t("dashboard.myListings")}</h2>
                    <p className="text-xs text-muted-foreground">{t("dashboard.myListingsSub")}</p>
                  </div>
                  <button className="text-sm text-secondary font-semibold hover:underline">{t("dashboard.viewAll")} →</button>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {listings.map((l, i) => (
                    <motion.div key={l.title} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }} className="rounded-2xl bg-card border border-border overflow-hidden hover-lift shadow-soft">
                      <div className="relative h-36 bg-muted">
                        <img src={l.img} alt={l.title} className="h-full w-full object-cover" />
                        <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-secondary text-secondary-foreground">IN STOCK</span>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold">{l.title}</p>
                          <p className="font-bold text-secondary">₹{l.price}/kg</p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1"><Package className="h-3 w-3" />{t("dashboard.kgLeft", { n: l.kg })}</span>
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{t("dashboard.views", { n: l.views })}</span>
                        </div>
                        <Button variant="outline" className="w-full h-8 text-xs">{t("dashboard.edit")}</Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Inquiries */}
              <div className="rounded-2xl bg-card border border-border p-5 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold">{t("dashboard.recentInquiries")}</h3>
                  <span className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">3</span>
                </div>
                <div className="space-y-3">
                  {inquiries.map((q, i) => (
                    <motion.div key={q.name} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-start gap-3">
                      <div className={`shrink-0 h-9 w-9 rounded-full ${q.color} text-white font-bold flex items-center justify-center text-sm`}>{q.name[0]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold truncate">{q.name}</p>
                          <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{q.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{q.msg}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <button className="text-sm text-secondary font-semibold mt-4 hover:underline">{t("dashboard.viewMessages")}</button>
              </div>
            </div>

            {/* Orders table */}
            <div className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
              <div className="p-5 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold">{t("dashboard.recentOrders")}</h2>
                  <p className="text-xs text-muted-foreground">{t("dashboard.recentOrdersSub")}</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      {[t("dashboard.orderId"), t("dashboard.crop"), t("dashboard.buyer"), t("dashboard.quantity"), t("dashboard.amount"), t("dashboard.status"), t("dashboard.action")].map((h) => (
                        <th key={h} className="text-left p-4 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-t border-border">
                        <td className="p-4 font-mono text-xs">{o.id}</td>
                        <td className="p-4">{o.crop}</td>
                        <td className="p-4">{o.buyer}</td>
                        <td className="p-4">{o.qty}</td>
                        <td className="p-4 font-semibold flex items-center gap-1"><IndianRupee className="h-3 w-3" />{o.amt}</td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${o.status === "completed" ? "bg-secondary/10 text-secondary" : "bg-amber-500/10 text-amber-700 dark:text-amber-400"}`}>
                            {o.status === "completed" ? t("dashboard.completed") : t("dashboard.processing")}
                          </span>
                        </td>
                        <td className="p-4"><button className="text-primary text-sm font-semibold hover:underline">{t("dashboard.details")}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
