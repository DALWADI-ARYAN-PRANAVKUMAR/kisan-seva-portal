import { useEffect, useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Wallet, Package, Star, Plus, LayoutGrid, History, Tractor, BarChart3, IndianRupee, Eye, Trash2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PostCropDialog } from "@/components/PostCropDialog";
import { toast } from "sonner";

type Listing = {
  id: string; title: string; price_per_kg: number; stock_kg: number; views: number | null;
  image_url: string | null; status: string; rating: number | null; unit: string;
};
type Order = {
  id: string; total_amount: number; status: string; created_at: string;
  delivery_name: string | null;
};

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [postOpen, setPostOpen] = useState(false);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const [l, o] = await Promise.all([
      supabase.from("listings").select("*").eq("seller_id", user.id).order("created_at", { ascending: false }),
      supabase.from("orders").select("id, total_amount, status, created_at, delivery_name").order("created_at", { ascending: false }).limit(10),
    ]);
    setListings((l.data || []) as Listing[]);
    setOrders((o.data || []) as Order[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const totalSales = orders.filter((o) => o.status === "completed").reduce((s, o) => s + Number(o.total_amount), 0);
  const totalStock = listings.reduce((s, l) => s + (l.stock_kg || 0), 0);
  const avgRating = listings.length ? (listings.reduce((s, l) => s + (Number(l.rating) || 0), 0) / listings.length).toFixed(1) : "—";

  const stats = [
    { icon: Wallet, label: t("dashboard.totalSales"), value: `₹${totalSales.toLocaleString("en-IN")}`, sub: t("dashboard.totalSalesSub"), color: "text-secondary bg-secondary/10" },
    { icon: Package, label: t("dashboard.currentStock"), value: `${totalStock}`, sub: t("dashboard.currentStockSub"), color: "text-primary bg-primary/10" },
    { icon: Star, label: t("dashboard.avgRating"), value: String(avgRating), sub: t("dashboard.avgRatingSub"), color: "text-amber-600 bg-amber-500/10 dark:text-amber-400" },
  ];

  const navItems = [
    { icon: LayoutGrid, key: "dashboard", active: true },
    { icon: History, key: "orders" },
    { icon: Tractor, key: "listings" },
    { icon: Wallet, key: "earnings" },
    { icon: BarChart3, key: "analytics" },
  ];

  const deleteListing = async (id: string) => {
    if (!confirm("Remove this listing?")) return;
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Listing removed");
    load();
  };

  const handlePostClick = () => {
    if (!user) {
      sessionStorage.setItem("ks_post_auth", "/dashboard");
      navigate("/auth?from=dashboard");
      return;
    }
    setPostOpen(true);
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="rounded-2xl bg-card border border-border p-4 h-fit shadow-soft lg:sticky lg:top-20">
            <div className="flex items-center gap-3 px-2 pb-4 mb-3 border-b border-border">
              <div className="h-11 w-11 rounded-full bg-secondary/10 flex items-center justify-center text-secondary"><Tractor className="h-5 w-5" /></div>
              <div className="min-w-0">
                <p className="font-display font-bold text-secondary truncate">{profile?.full_name || t("dashboard.portal")}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><ShieldCheck className="h-3 w-3" />{t("dashboard.verifiedSeller")}</p>
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
            <Button onClick={handlePostClick} className="w-full mt-5 bg-primary hover:bg-primary/90 shadow-soft">
              <Plus className="h-4 w-4 mr-2" />{t("dashboard.post")}
            </Button>
          </aside>

          {/* Main */}
          <div className="space-y-6">
            <div>
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl md:text-4xl font-bold">{t("dashboard.overview")}</motion.h1>
              <p className="text-sm text-muted-foreground mt-1">
                {user ? `Welcome back${profile?.full_name ? `, ${profile.full_name}` : ""}!` : "Sign in to manage your crops and orders."}
              </p>
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

            {/* My Listings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold">{t("dashboard.myListings")}</h2>
                  <p className="text-xs text-muted-foreground">{t("dashboard.myListingsSub")}</p>
                </div>
                <Button onClick={handlePostClick} size="sm" variant="outline"><Plus className="h-3.5 w-3.5 mr-1.5" />{t("dashboard.post")}</Button>
              </div>

              {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => <div key={i} className="rounded-2xl bg-muted h-72 animate-pulse" />)}
                </div>
              ) : listings.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border-2 border-dashed border-border p-10 text-center">
                  <Tractor className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
                  <p className="font-semibold mb-1">No listings yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Post your first crop and reach buyers in minutes.</p>
                  <Button onClick={handlePostClick} className="bg-primary hover:bg-primary/90"><Plus className="h-4 w-4 mr-1.5" />{t("dashboard.post")}</Button>
                </motion.div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {listings.map((l, i) => (
                    <motion.div key={l.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }} className="rounded-2xl bg-card border border-border overflow-hidden hover-lift shadow-soft">
                      <div className="relative h-36 bg-muted">
                        {l.image_url ? (
                          <img src={l.image_url} alt={l.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-muted-foreground"><Tractor className="h-10 w-10 opacity-30" /></div>
                        )}
                        <span className={`absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${l.status === "in_stock" ? "bg-secondary text-secondary-foreground" : "bg-amber-500 text-white"}`}>
                          {l.status === "in_stock" ? "IN STOCK" : "HARVESTING"}
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2 gap-2">
                          <p className="font-semibold truncate">{l.title}</p>
                          <p className="font-bold text-secondary shrink-0">₹{l.price_per_kg}/{l.unit || "kg"}</p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1"><Package className="h-3 w-3" />{l.stock_kg} {l.unit || "kg"} left</span>
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{l.views || 0}</span>
                        </div>
                        <Button onClick={() => deleteListing(l.id)} variant="outline" className="w-full h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30">
                          <Trash2 className="h-3 w-3 mr-1.5" />Remove
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Orders */}
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
                      {[t("dashboard.orderId"), t("dashboard.buyer"), "Date", t("dashboard.amount"), t("dashboard.status")].map((h) => (
                        <th key={h} className="text-left p-4 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">No orders yet — your sales will appear here.</td></tr>
                    ) : orders.map((o) => (
                      <tr key={o.id} className="border-t border-border">
                        <td className="p-4 font-mono text-xs">#{o.id.slice(0, 8).toUpperCase()}</td>
                        <td className="p-4">{o.delivery_name || "—"}</td>
                        <td className="p-4 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                        <td className="p-4 font-semibold flex items-center gap-1"><IndianRupee className="h-3 w-3" />{Number(o.total_amount).toLocaleString("en-IN")}</td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${o.status === "completed" ? "bg-secondary/10 text-secondary" : "bg-amber-500/10 text-amber-700 dark:text-amber-400"}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PostCropDialog open={postOpen} onOpenChange={setPostOpen} onCreated={load} />
    </Layout>
  );
};

export default Dashboard;
