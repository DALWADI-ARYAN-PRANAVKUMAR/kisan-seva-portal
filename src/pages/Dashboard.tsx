import { useEffect, useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Wallet, Package, Star, Plus, LayoutGrid, History, Tractor, BarChart3, IndianRupee, Eye, Trash2, ShieldCheck, ShoppingBasket, Receipt } from "lucide-react";
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

type TabKey = "dashboard" | "orders" | "listings" | "earnings" | "analytics";

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [postOpen, setPostOpen] = useState(false);
  const [tab, setTab] = useState<TabKey>("dashboard");

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const [l, o] = await Promise.all([
      supabase.from("listings").select("*").eq("seller_id", user.id).order("created_at", { ascending: false }),
      supabase.from("orders").select("id, total_amount, status, created_at, delivery_name").order("created_at", { ascending: false }).limit(20),
    ]);
    setListings((l.data || []) as Listing[]);
    setOrders((o.data || []) as Order[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // Realtime: refresh when any order/order_item changes (RLS filters to this seller)
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("seller-orders-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "listings", filter: `seller_id=eq.${user.id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, load]);

  const totalSales = orders.filter((o) => o.status === "completed").reduce((s, o) => s + Number(o.total_amount), 0);
  const pendingSales = orders.filter((o) => o.status !== "completed").reduce((s, o) => s + Number(o.total_amount), 0);
  const totalStock = listings.reduce((s, l) => s + (l.stock_kg || 0), 0);
  const totalViews = listings.reduce((s, l) => s + (l.views || 0), 0);
  const avgRating = listings.length ? (listings.reduce((s, l) => s + (Number(l.rating) || 0), 0) / listings.length).toFixed(1) : "—";

  const stats = [
    { icon: Wallet, label: t("dashboard.totalSales"), value: `₹${totalSales.toLocaleString("en-IN")}`, sub: t("dashboard.totalSalesSub"), color: "text-secondary bg-secondary/10" },
    { icon: Package, label: t("dashboard.currentStock"), value: `${totalStock}`, sub: t("dashboard.currentStockSub"), color: "text-primary bg-primary/10" },
    { icon: Star, label: t("dashboard.avgRating"), value: String(avgRating), sub: t("dashboard.avgRatingSub"), color: "text-amber-600 bg-amber-500/10 dark:text-amber-400" },
  ];

  const navItems: { icon: typeof Wallet; key: TabKey }[] = [
    { icon: LayoutGrid, key: "dashboard" },
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

  const ListingsGrid = ({ items }: { items: Listing[] }) => (
    items.length === 0 ? (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border-2 border-dashed border-border p-10 text-center">
        <Tractor className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
        <p className="font-semibold mb-1">No listings yet</p>
        <p className="text-sm text-muted-foreground mb-4">Post your first crop and reach buyers in minutes.</p>
        <Button onClick={handlePostClick} className="bg-primary hover:bg-primary/90"><Plus className="h-4 w-4 mr-1.5" />{t("dashboard.post")}</Button>
      </motion.div>
    ) : (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((l, i) => (
          <motion.div key={l.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="rounded-2xl bg-card border border-border overflow-hidden hover-lift shadow-soft">
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
    )
  );

  const OrdersTable = ({ items }: { items: Order[] }) => (
    <div className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
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
            {items.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">No orders yet — your sales will appear here.</td></tr>
            ) : items.map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="p-4 font-mono text-xs">#{o.id.slice(0, 8).toUpperCase()}</td>
                <td className="p-4">{o.delivery_name || "—"}</td>
                <td className="p-4 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="p-4 font-semibold"><span className="inline-flex items-center gap-1"><IndianRupee className="h-3 w-3" />{Number(o.total_amount).toLocaleString("en-IN")}</span></td>
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
  );

  // LOGGED-OUT GATE — show sidebar shell but no info; prompt to sign in
  if (!authLoading && !user) {
    const lockedNav: { icon: typeof Wallet; key: TabKey }[] = [
      { icon: LayoutGrid, key: "dashboard" },
      { icon: History, key: "orders" },
      { icon: Tractor, key: "listings" },
      { icon: Wallet, key: "earnings" },
      { icon: BarChart3, key: "analytics" },
    ];
    return (
      <Layout>
        <div className="container py-8">
          <div className="grid lg:grid-cols-[260px_1fr] gap-6">
            <aside className="rounded-2xl bg-card border border-border p-4 h-fit shadow-soft lg:sticky lg:top-20 opacity-90">
              <div className="flex items-center gap-3 px-2 pb-4 mb-3 border-b border-border">
                <div className="h-11 w-11 rounded-full bg-muted flex items-center justify-center text-muted-foreground"><Tractor className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-muted-foreground truncate">Guest</p>
                  <p className="text-xs text-muted-foreground">Not signed in</p>
                </div>
              </div>
              <nav className="space-y-1">
                {lockedNav.map((it) => (
                  <button key={it.key} disabled className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground/60 cursor-not-allowed">
                    <it.icon className="h-4 w-4" />{t(`dashboard.nav.${it.key}`)}
                  </button>
                ))}
              </nav>
              <Button onClick={() => navigate("/auth")} className="w-full mt-5 bg-primary hover:bg-primary/90 shadow-soft">
                Sign in to continue
              </Button>
            </aside>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border-2 border-dashed border-border p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Please sign in to view your dashboard</h2>
              <p className="text-sm text-muted-foreground max-w-md mb-6">Your listings, orders, earnings and analytics are private. Sign in with your mobile number to continue.</p>
              <div className="flex gap-3">
                <Button onClick={() => navigate("/auth")} className="bg-primary hover:bg-primary/90 shadow-soft">Sign in</Button>
                <Button onClick={() => navigate("/auth?from=checkout")} variant="outline">Create account</Button>
              </div>
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }

  // BUYER VIEW — only order history + total spendings
  if (profile?.role === "buyer") {
    const totalSpent = orders.reduce((s, o) => s + Number(o.total_amount), 0);
    return (
      <Layout>
        <div className="container py-10 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <ShoppingBasket className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold">My Account</h1>
                <p className="text-sm text-muted-foreground">Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}!</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              <div className="rounded-2xl bg-gradient-to-br from-secondary/15 to-secondary/5 border border-secondary/20 p-6 shadow-soft">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-9 w-9 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary"><Wallet className="h-5 w-5" /></div>
                  <span className="font-semibold">Total Spendings</span>
                </div>
                <p className="font-display text-4xl font-bold text-secondary">₹{totalSpent.toLocaleString("en-IN")}</p>
                <p className="text-xs text-muted-foreground mt-1">Across {orders.length} {orders.length === 1 ? "order" : "orders"}</p>
              </div>
              <div className="rounded-2xl bg-card border border-border p-6 shadow-soft">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Receipt className="h-5 w-5" /></div>
                  <span className="font-semibold">Orders Placed</span>
                </div>
                <p className="font-display text-4xl font-bold">{orders.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Direct from verified farmers</p>
              </div>
            </div>

            <div className="mt-10">
              <div className="flex items-center gap-2 mb-4">
                <History className="h-5 w-5 text-secondary" />
                <h2 className="font-display text-2xl font-bold">Order History</h2>
              </div>
              {loading ? (
                <div className="rounded-2xl bg-muted h-72 animate-pulse" />
              ) : orders.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center">
                  <ShoppingBasket className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-40" />
                  <p className="font-semibold mb-1">No orders yet</p>
                  <p className="text-sm text-muted-foreground mb-4">Browse the marketplace to place your first order.</p>
                  <Button onClick={() => navigate("/marketplace")} className="bg-primary hover:bg-primary/90">Go to Marketplace</Button>
                </div>
              ) : (
                <OrdersTable items={orders} />
              )}
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

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
              {navItems.map((it) => {
                const active = tab === it.key;
                return (
                  <button key={it.key} onClick={() => setTab(it.key)} className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? "bg-secondary/10 text-secondary" : "hover:bg-muted text-foreground/80"}`}>
                    {active && <span className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-secondary rounded-l-full" />}
                    <it.icon className="h-4 w-4" />{t(`dashboard.nav.${it.key}`)}
                  </button>
                );
              })}
            </nav>
            <Button onClick={handlePostClick} className="w-full mt-5 bg-primary hover:bg-primary/90 shadow-soft">
              <Plus className="h-4 w-4 mr-2" />{t("dashboard.post")}
            </Button>
          </aside>

          {/* Main */}
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold capitalize">{t(`dashboard.nav.${tab}`)}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {user ? `Welcome back${profile?.full_name ? `, ${profile.full_name}` : ""}!` : "Sign in to manage your crops and orders."}
              </p>
            </div>

            {tab === "dashboard" && (
              <>
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
                  ) : <ListingsGrid items={listings.slice(0, 6)} />}
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold mb-3">{t("dashboard.recentOrders")}</h2>
                  <OrdersTable items={orders.slice(0, 5)} />
                </div>
              </>
            )}

            {tab === "listings" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{listings.length} active {listings.length === 1 ? "listing" : "listings"}</p>
                  <Button onClick={handlePostClick} size="sm" className="bg-primary hover:bg-primary/90"><Plus className="h-3.5 w-3.5 mr-1.5" />{t("dashboard.post")}</Button>
                </div>
                {loading ? <div className="rounded-2xl bg-muted h-72 animate-pulse" /> : <ListingsGrid items={listings} />}
              </div>
            )}

            {tab === "orders" && (
              loading ? <div className="rounded-2xl bg-muted h-72 animate-pulse" /> : <OrdersTable items={orders} />
            )}

            {tab === "earnings" && (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-card border border-border p-6 shadow-soft">
                  <div className="flex items-center gap-2 mb-3"><Wallet className="h-5 w-5 text-secondary" /><span className="font-semibold">Completed earnings</span></div>
                  <p className="font-display text-4xl font-bold text-secondary">₹{totalSales.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-muted-foreground mt-1">From {orders.filter(o => o.status === "completed").length} orders</p>
                </div>
                <div className="rounded-2xl bg-card border border-border p-6 shadow-soft">
                  <div className="flex items-center gap-2 mb-3"><IndianRupee className="h-5 w-5 text-amber-600" /><span className="font-semibold">Pending payout</span></div>
                  <p className="font-display text-4xl font-bold text-amber-600">₹{pendingSales.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-muted-foreground mt-1">From {orders.filter(o => o.status !== "completed").length} processing orders</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="font-display font-bold mb-3">Recent transactions</h3>
                  <OrdersTable items={orders.slice(0, 8)} />
                </div>
              </div>
            )}

            {tab === "analytics" && (
              <div className="grid md:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-card border border-border p-6 shadow-soft">
                  <div className="flex items-center gap-2 mb-3"><Eye className="h-5 w-5 text-primary" /><span className="font-semibold">Total views</span></div>
                  <p className="font-display text-4xl font-bold">{totalViews}</p>
                  <p className="text-xs text-muted-foreground mt-1">Across {listings.length} listings</p>
                </div>
                <div className="rounded-2xl bg-card border border-border p-6 shadow-soft">
                  <div className="flex items-center gap-2 mb-3"><Star className="h-5 w-5 text-amber-500" /><span className="font-semibold">Avg rating</span></div>
                  <p className="font-display text-4xl font-bold">{avgRating}</p>
                  <p className="text-xs text-muted-foreground mt-1">Based on buyer feedback</p>
                </div>
                <div className="rounded-2xl bg-card border border-border p-6 shadow-soft">
                  <div className="flex items-center gap-2 mb-3"><Package className="h-5 w-5 text-secondary" /><span className="font-semibold">Stock available</span></div>
                  <p className="font-display text-4xl font-bold">{totalStock}</p>
                  <p className="text-xs text-muted-foreground mt-1">Units across listings</p>
                </div>
                <div className="md:col-span-3 rounded-2xl bg-card border border-border p-6 shadow-soft">
                  <h3 className="font-display font-bold mb-4">Top listings by views</h3>
                  {listings.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No listings yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {[...listings].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5).map((l) => {
                        const pct = totalViews ? Math.round(((l.views || 0) / Math.max(1, totalViews)) * 100) : 0;
                        return (
                          <div key={l.id}>
                            <div className="flex justify-between text-sm mb-1"><span className="font-medium truncate">{l.title}</span><span className="text-muted-foreground">{l.views || 0} views</span></div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <PostCropDialog open={postOpen} onOpenChange={setPostOpen} onCreated={load} />
    </Layout>
  );
};

export default Dashboard;
