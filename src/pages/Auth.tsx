import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingBasket, Tractor, Phone, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { LANGUAGES } from "@/i18n";
import { Globe, Moon, Sun } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/providers/ThemeProvider";

// Phone + password auth. Supabase auth requires an email, so we synthesize a
// stable pseudo-email from the normalized phone number. The real phone is also
// stored on the user metadata + profile so the rest of the app keeps working.
const phoneToEmail = (e164: string) => `${e164.replace(/\D/g, "")}@phone.kisanseva.app`;

const normalizePhone = (raw: string) => {
  const digits = raw.replace(/\D/g, "");
  if (raw.trim().startsWith("+")) return "+" + digits;
  if (digits.length === 10) return "+91" + digits;
  if (digits.length === 12 && digits.startsWith("91")) return "+" + digits;
  return "+" + digits;
};

const Auth = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { theme, toggle } = useTheme();
  const fromCheckout = params.get("from") === "checkout";

  const [tab, setTab] = useState<"signin" | "signup">(fromCheckout ? "signup" : "signin");
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const afterAuth = () => {
    const next = sessionStorage.getItem("ks_post_auth");
    if (next) { sessionStorage.removeItem("ks_post_auth"); navigate(next); return; }
    navigate(role === "seller" && tab === "signup" ? "/dashboard" : "/marketplace");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) { toast.error("Enter your mobile number"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (tab === "signup" && !fullName.trim()) { toast.error("Please enter your full name"); return; }

    setLoading(true);
    const e164 = normalizePhone(phone);
    const email = phoneToEmail(e164);

    if (tab === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: fullName, role, phone: e164 },
        },
      });
      setLoading(false);
      if (error) { toast.error(error.message); return; }
      toast.success("Account created! You're signed in.");
      afterAuth();
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) { toast.error("Invalid mobile number or password"); return; }
      toast.success(t("auth.signedIn"));
      afterAuth();
    }
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) { toast.error("Google sign-in failed"); return; }
    if (result.redirected) return;
    afterAuth();
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="relative hidden md:block overflow-hidden">
        <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200" alt="Farm" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/70 via-primary/40 to-black/50" />
        <div className="relative z-10 h-full flex flex-col p-10 text-white">
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="h-11 w-11 rounded-full bg-white/90 p-0.5" />
            <span className="font-display font-bold text-2xl">Kisan Seva</span>
          </div>
          <div className="mt-auto">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl lg:text-5xl font-bold drop-shadow-lg">{t("auth.kicker")}</motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-4 text-white/90 text-base max-w-md drop-shadow">{t("auth.kickerSub")}</motion.p>
          </div>
        </div>
      </div>

      <div className="flex flex-col bg-background">
        <div className="flex items-center justify-between gap-1 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
            className="gap-1.5"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back</span>
          </Button>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><Globe className="h-5 w-5" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {LANGUAGES.map((l) => <DropdownMenuItem key={l.code} onClick={() => i18n.changeLanguage(l.code)}>{l.label}</DropdownMenuItem>)}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" onClick={toggle}>{theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</Button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <h2 className="font-display text-3xl font-bold">{fromCheckout ? t("auth.welcomeCheckout") : t("auth.welcome")}</h2>
            <p className="text-muted-foreground text-sm mt-2">Sign in with your mobile number and password.</p>

            <div className="grid grid-cols-2 mt-6 border-b border-border">
              {(["signin", "signup"] as const).map((k) => (
                <button key={k} onClick={() => setTab(k)} className={`pb-3 font-semibold text-sm border-b-2 transition-colors ${tab === k ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
                  {k === "signin" ? t("auth.signin") : t("auth.create")}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {tab === "signup" && (
                <>
                  <div>
                    <p className="text-sm font-semibold mb-2">{t("auth.iam")}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {(["buyer", "seller"] as const).map((r) => (
                        <button key={r} type="button" onClick={() => setRole(r)} className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${role === r ? (r === "buyer" ? "border-secondary bg-secondary/10 text-secondary" : "border-primary bg-primary/10 text-primary") : "border-border"}`}>
                          {r === "buyer" ? <ShoppingBasket className="h-5 w-5" /> : <Tractor className="h-5 w-5" />}
                          <span className="text-sm font-semibold">{t(`auth.${r}`)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>{t("auth.fullName")}</Label>
                    <Input className="mt-1.5" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Rajesh Kumar" />
                  </div>
                </>
              )}

              <div>
                <Label>Mobile Number</Label>
                <div className="relative mt-1.5">
                  <Phone className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" type="tel" required placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">Indian numbers default to +91.</p>
              </div>

              <div>
                <Label>Password</Label>
                <div className="relative mt-1.5">
                  <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9 pr-10" type={showPwd ? "text" : "password"} required minLength={6} placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-11 bg-primary hover:bg-primary/90 shadow-soft">
                {loading ? "Please wait..." : tab === "signin" ? "Sign In" : "Create Account"} →
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />{t("auth.or")}<div className="h-px flex-1 bg-border" />
            </div>

            <Button onClick={handleGoogle} variant="outline" className="w-full h-11">
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              {t("auth.google")}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-6">
              {t("auth.terms")} <a className="text-secondary underline">{t("auth.termsLink")}</a> {t("auth.and")} <a className="text-secondary underline">{t("auth.privacyLink")}</a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
