import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Globe, Moon, Sun, ShoppingCart, User as UserIcon, LogOut } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useCart } from "@/providers/CartProvider";
import { LANGUAGES } from "@/i18n";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.png";
import { motion } from "framer-motion";

export const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggle } = useTheme();
  const { user, profile, signOut } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { to: "/marketplace", label: t("nav.marketplace") },
    { to: "/dashboard", label: t("nav.dashboard") },
    { to: "/#community", label: t("nav.community") },
    { to: "/#about", label: t("nav.about") },
  ];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border"
    >
      <div className="container flex items-center justify-between h-16 gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="Kisan Seva" className="h-9 w-9 rounded-full object-contain" />
          <span className="font-display font-bold text-lg hidden sm:inline">
            <span className="text-primary">Kisan</span> <span className="text-secondary">Seva</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium story-link transition-colors ${
                location.pathname === l.to ? "text-primary" : "text-foreground/80 hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t("common.language")}><Globe className="h-5 w-5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-[60]">
              <DropdownMenuLabel>{t("common.language")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {LANGUAGES.map((l) => (
                <DropdownMenuItem key={l.code} onClick={() => i18n.changeLanguage(l.code)} className={i18n.language === l.code ? "bg-accent/10 font-semibold" : ""}>
                  {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Button variant="ghost" size="icon" onClick={() => navigate("/checkout")} className="relative" aria-label={t("nav.cart")}>
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                {count}
              </span>
            )}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t("nav.account")}>
                  <div className="h-7 w-7 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold text-xs">
                    {(profile?.full_name?.[0] || user.email?.[0] || "U").toUpperCase()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-[60] w-48">
                <DropdownMenuLabel className="truncate">{profile?.full_name || user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard")}><UserIcon className="h-4 w-4 mr-2" />{t("nav.dashboard")}</DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}><LogOut className="h-4 w-4 mr-2" />{t("nav.signout")}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
              <UserIcon className="h-4 w-4 mr-1.5" />{t("nav.signin")}
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
};
