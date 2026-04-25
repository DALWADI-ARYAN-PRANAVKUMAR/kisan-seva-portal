import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Bell, MapPin, Star, ShoppingCart, BadgeCheck, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/providers/CartProvider";
import { toast } from "sonner";

type Listing = {
  id: string; title: string; description: string | null; category: string;
  price_per_kg: number; min_order_kg: number; stock_kg: number; location: string | null;
  distance_km: number | null; status: string; image_url: string | null; rating: number | null;
};

const Marketplace = () => {
  const { t } = useTranslation();
  const { add } = useCart();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cats, setCats] = useState<string[]>([]);
  const [maxKm, setMaxKm] = useState(100);
  const [sort, setSort] = useState("recommended");
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: "", max: "" });

  useEffect(() => {
    supabase.from("listings").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setListings((data || []) as Listing[]);
      setLoading(false);
    });
  }, []);

  const toggleCat = (c: string) => setCats((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c]);

  let filtered = listings.filter((l) => {
    if (search && !l.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (cats.length && !cats.includes(l.category)) return false;
    if (l.distance_km != null && l.distance_km > maxKm) return false;
    if (priceRange.min && l.price_per_kg < +priceRange.min) return false;
    if (priceRange.max && l.price_per_kg > +priceRange.max) return false;
    return true;
  });
  if (sort === "priceLow") filtered = [...filtered].sort((a, b) => a.price_per_kg - b.price_per_kg);
  if (sort === "priceHigh") filtered = [...filtered].sort((a, b) => b.price_per_kg - a.price_per_kg);
  if (sort === "rating") filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));

  const statusBadge = (s: string) => {
    if (s === "in_stock") return { c: "bg-secondary/10 text-secondary border-secondary/30", icon: BadgeCheck, label: t("market.inStock") };
    if (s === "harvesting_soon") return { c: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30", icon: Clock, label: t("market.harvestingSoon") };
    return { c: "bg-muted text-muted-foreground border-border", icon: Clock, label: t("market.outOfStock") };
  };

  const handleAdd = (l: Listing) => {
    add({ listing_id: l.id, title: l.title, price_per_kg: Number(l.price_per_kg), image_url: l.image_url, seller_name: "Kisan Seva Verified" }, l.min_order_kg);
    toast.success(t("market.added"), { description: l.title });
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* search bar */}
        <div className="mb-6 max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("market.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-full h-11" />
          </div>
        </div>

        {/* notification banner */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-xl bg-secondary/10 border border-secondary/30 px-4 py-3 flex items-center gap-3 text-sm">
          <Bell className="h-4 w-4 text-secondary shrink-0" />
          <span><span className="font-semibold text-secondary">{t("market.newPosting")}</span> {t("market.newPostingMsg")}</span>
        </motion.div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          {/* filters */}
          <aside className="rounded-2xl bg-card border border-border p-5 h-fit shadow-soft lg:sticky lg:top-20">
            <h3 className="font-display font-bold text-lg mb-4">{t("market.filters")}</h3>
            <div className="space-y-2 mb-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t("market.category")}</p>
              {(["grains", "vegetables", "fruits"] as const).map((c) => (
                <label key={c} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox checked={cats.includes(c)} onCheckedChange={() => toggleCat(c)} />
                  <span className="text-sm">{t(`cats.${c}`)}</span>
                </label>
              ))}
            </div>
            <div className="mb-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t("market.price")}</p>
              <div className="flex gap-2">
                <Input placeholder={t("market.min")} value={priceRange.min} onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })} className="h-9" />
                <Input placeholder={t("market.max")} value={priceRange.max} onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })} className="h-9" />
              </div>
            </div>
            <div className="mb-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t("market.distance")}</p>
              <Slider value={[maxKm]} onValueChange={([v]) => setMaxKm(v)} max={200} step={5} />
              <div className="flex justify-between text-xs text-muted-foreground mt-2"><span>0</span><span className="font-semibold text-foreground">{maxKm}km</span><span>200+</span></div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => { setCats([]); setMaxKm(100); setPriceRange({ min: "", max: "" }); setSearch(""); }}>{t("market.reset")}</Button>
          </aside>

          {/* grid */}
          <div>
            <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold">{t("market.title")}</h1>
                <p className="text-muted-foreground text-sm mt-1">{t("market.showing", { n: filtered.length })}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t("market.sort")}</span>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">{t("market.recommended")}</SelectItem>
                    <SelectItem value="priceLow">{t("market.priceLow")}</SelectItem>
                    <SelectItem value="priceHigh">{t("market.priceHigh")}</SelectItem>
                    <SelectItem value="rating">{t("market.rating")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="rounded-2xl bg-muted h-96 animate-pulse" />)}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((l, i) => {
                  const sb = statusBadge(l.status);
                  const Icon = sb.icon;
                  const outOfStock = l.status !== "in_stock";
                  return (
                    <motion.div
                      key={l.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-2xl bg-card border border-border overflow-hidden hover-lift shadow-soft flex flex-col"
                    >
                      <div className="relative h-48 bg-muted">
                        {l.image_url && <img src={l.image_url} alt={l.title} className="h-full w-full object-cover" loading="lazy" />}
                        <span className={`absolute top-3 left-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${sb.c}`}>
                          <Icon className="h-3 w-3" />{sb.label}
                        </span>
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-display font-semibold text-lg leading-tight">{l.title}</h3>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-primary text-lg">₹{l.price_per_kg}</p>
                            <p className="text-[10px] text-muted-foreground">{t("market.perKg")}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{l.description}</p>
                        <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1.5 mb-4 mt-auto">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{l.location}</span>
                            <span className="flex items-center gap-1 text-secondary font-semibold"><Star className="h-3 w-3 fill-current" />{l.rating}</span>
                          </div>
                          <p className="text-muted-foreground">{t("market.minOrder", { n: l.min_order_kg })}</p>
                        </div>
                        <Button
                          onClick={() => handleAdd(l)}
                          disabled={outOfStock && l.status !== "harvesting_soon"}
                          className={l.status === "harvesting_soon" ? "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground" : "bg-primary hover:bg-primary/90"}
                          variant={l.status === "harvesting_soon" ? "outline" : "default"}
                        >
                          {l.status === "harvesting_soon" ? t("market.prebook") : (<><ShoppingCart className="h-4 w-4 mr-2" />{t("market.addToCart")}</>)}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Marketplace;
