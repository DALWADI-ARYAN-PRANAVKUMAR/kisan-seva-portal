import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/providers/AuthProvider";
import { useCart } from "@/providers/CartProvider";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Lock, Truck, Wallet, QrCode, Banknote, CreditCard, Plus, Minus, ShieldCheck, BadgeCheck, Tractor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const STATES = ["Andhra Pradesh", "Bihar", "Delhi", "Gujarat", "Haryana", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu", "Uttar Pradesh", "West Bengal"];

const Checkout = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { items, setQty, remove, clear, subtotal } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", phone: "", pin: "", flat: "", area: "", city: "", state: "" });
  const [payment, setPayment] = useState<"upi" | "cod" | "card">("upi");
  const [submitting, setSubmitting] = useState(false);

  const transport = items.length ? 150 : 0;
  const subsidy = items.length ? 50 : 0;
  const total = subtotal + transport - subsidy;

  const handleProceed = async () => {
    if (!items.length) return;
    if (!user) {
      // Save intent and redirect to auth
      sessionStorage.setItem("ks_post_auth", "/checkout");
      navigate("/auth?from=checkout");
      return;
    }
    if (!form.name || !form.phone || !form.flat || !form.city || !form.state) {
      toast.error("Please fill all delivery fields");
      return;
    }
    setSubmitting(true);
    const { data: order, error } = await supabase.from("orders").insert({
      buyer_id: user.id,
      total_amount: total,
      delivery_name: form.name,
      delivery_phone: form.phone,
      delivery_address: `${form.flat}, ${form.area}, ${form.city}, ${form.state} - ${form.pin}`,
      payment_method: payment,
    }).select().single();

    if (error || !order) { toast.error(error?.message || "Order failed"); setSubmitting(false); return; }

    const { error: itemErr } = await supabase.from("order_items").insert(
      items.map((i) => ({
        order_id: order.id,
        listing_id: i.listing_id,
        title: i.title,
        quantity_kg: i.quantity,
        price_per_kg: i.price_per_kg,
        subtotal: i.quantity * i.price_per_kg,
      }))
    );
    if (itemErr) { toast.error(itemErr.message); setSubmitting(false); return; }

    toast.success(t("checkout.success"));
    clear();
    setSubmitting(false);
    navigate("/dashboard");
  };

  return (
    <Layout hideFooter>
      <div className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container flex items-center justify-between h-14">
          <button onClick={() => navigate("/marketplace")} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />{t("checkout.back")}
          </button>
          <div className="flex items-center gap-2">
            <img src={logo} className="h-7 w-7 rounded-full" alt="" />
            <span className="font-display font-bold text-secondary">Kisan Seva</span>
          </div>
          <Lock className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="container py-8 max-w-6xl">
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl md:text-4xl font-bold mb-6">{t("checkout.title")}</motion.h1>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground mb-4">{t("checkout.empty")}</p>
            <Button onClick={() => navigate("/marketplace")} className="bg-primary hover:bg-primary/90">{t("checkout.browse")}</Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_400px] gap-6">
            {/* LEFT */}
            <div className="space-y-6">
              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <h2 className="font-display text-xl font-bold mb-5 flex items-center gap-2"><Truck className="h-5 w-5 text-secondary" />{t("checkout.delivery")}</h2>
                <div className="space-y-4">
                  <div>
                    <Label>{t("checkout.fullName")}</Label>
                    <Input className="mt-1.5" placeholder="e.g., Ramesh Kumar" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t("checkout.mobile")}</Label>
                      <div className="mt-1.5 flex">
                        <span className="px-3 flex items-center bg-muted border border-r-0 border-input rounded-l-md text-sm">+91</span>
                        <Input className="rounded-l-none" placeholder="10-digit" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <Label>{t("checkout.pin")}</Label>
                      <Input className="mt-1.5" placeholder="6 digits" value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label>{t("checkout.flat")}</Label>
                    <Input className="mt-1.5" value={form.flat} onChange={(e) => setForm({ ...form, flat: e.target.value })} />
                  </div>
                  <div>
                    <Label>{t("checkout.area")}</Label>
                    <Input className="mt-1.5" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t("checkout.city")}</Label>
                      <Input className="mt-1.5" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                    </div>
                    <div>
                      <Label>{t("checkout.state")}</Label>
                      <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
                        <SelectTrigger className="mt-1.5"><SelectValue placeholder={t("checkout.selectState")} /></SelectTrigger>
                        <SelectContent>{STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </motion.section>

              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <h2 className="font-display text-xl font-bold mb-5 flex items-center gap-2"><Wallet className="h-5 w-5 text-secondary" />{t("checkout.payment")}</h2>
                <div className="space-y-3">
                  {[
                    { id: "upi", icon: QrCode, label: t("checkout.upi"), desc: t("checkout.upiDesc") },
                    { id: "cod", icon: Banknote, label: t("checkout.cod"), desc: t("checkout.codDesc") },
                    { id: "card", icon: CreditCard, label: t("checkout.card"), desc: t("checkout.cardDesc") },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPayment(p.id as any)}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left transition-all ${payment === p.id ? "border-secondary bg-secondary/5" : "border-border hover:border-input"}`}
                    >
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${payment === p.id ? "border-secondary" : "border-muted-foreground"}`}>
                        {payment === p.id && <div className="h-2.5 w-2.5 rounded-full bg-secondary" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{p.label}</p>
                        <p className="text-xs text-muted-foreground">{p.desc}</p>
                      </div>
                      <p.icon className="h-5 w-5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </motion.section>
            </div>

            {/* RIGHT — Summary */}
            <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl border border-border bg-card p-6 shadow-card h-fit lg:sticky lg:top-20">
              <h2 className="font-display text-xl font-bold">{t("checkout.summary")}</h2>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><BadgeCheck className="h-3 w-3 text-secondary" />{t("checkout.items", { n: items.length })}</p>

              <div className="border-t border-border mt-4 pt-4 space-y-4">
                <AnimatePresence>
                  {items.map((i) => (
                    <motion.div key={i.listing_id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex gap-3">
                      <div className="h-14 w-14 rounded-lg bg-muted overflow-hidden shrink-0">
                        {i.image_url && <img src={i.image_url} alt={i.title} className="h-full w-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{i.title}</p>
                        <p className="text-[10px] text-secondary flex items-center gap-1 mt-0.5"><Tractor className="h-3 w-3" />{i.seller_name}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-border rounded-md">
                            <button onClick={() => i.quantity > 1 ? setQty(i.listing_id, i.quantity - 1) : remove(i.listing_id)} className="px-2 py-1 hover:bg-muted"><Minus className="h-3 w-3" /></button>
                            <span className="px-2 text-sm font-semibold min-w-[2rem] text-center">{i.quantity}</span>
                            <button onClick={() => setQty(i.listing_id, i.quantity + 1)} className="px-2 py-1 hover:bg-muted"><Plus className="h-3 w-3" /></button>
                          </div>
                          <p className="text-sm font-bold">₹{(i.quantity * i.price_per_kg).toFixed(0)}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="border-t border-border mt-5 pt-5 space-y-2 text-sm">
                <div className="flex justify-between"><span>{t("checkout.subtotal")}</span><span>₹{subtotal.toFixed(0)}</span></div>
                <div className="flex justify-between"><span>{t("checkout.transport")}</span><span>₹{transport}</span></div>
                <div className="flex justify-between text-secondary font-semibold"><span>{t("checkout.subsidy")}</span><span>-₹{subsidy}</span></div>
              </div>

              <div className="border-t border-border mt-4 pt-4 flex items-end justify-between">
                <div>
                  <p className="font-semibold">{t("checkout.total")}</p>
                  <p className="text-[10px] text-muted-foreground">{t("checkout.inclusive")}</p>
                </div>
                <p className="font-display text-3xl font-bold">₹{total.toFixed(0)}</p>
              </div>

              <Button onClick={handleProceed} disabled={submitting} className="w-full mt-5 h-12 bg-primary hover:bg-primary/90 text-base shadow-glow">
                <Lock className="h-4 w-4 mr-2" />{t("checkout.proceed")} ₹{total.toFixed(0)}
              </Button>
              <p className="text-xs text-secondary text-center mt-3 flex items-center justify-center gap-1">
                <ShieldCheck className="h-3 w-3" />{t("checkout.secure")}
              </p>
            </motion.aside>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Checkout;
