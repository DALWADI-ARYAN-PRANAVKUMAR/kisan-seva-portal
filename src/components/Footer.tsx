import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-[hsl(220_25%_10%)] text-white/80 mt-20">
      <div className="container py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-display font-bold text-white text-lg">
            <span className="text-primary">Kisan</span> <span className="text-secondary">Seva</span>
          </h3>
          <p className="text-sm mt-2 text-white/60">© 2026 {t("footer.tagline")}</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3 text-sm">{t("footer.platform")}</h4>
          <ul className="space-y-2 text-sm">
            <li><a className="hover:text-white" href="#">{t("footer.mission")}</a></li>
            <li><a className="hover:text-white" href="#">{t("footer.privacy")}</a></li>
            <li><a className="hover:text-white" href="#">{t("footer.terms")}</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3 text-sm">{t("footer.involved")}</h4>
          <ul className="space-y-2 text-sm">
            <li><a className="hover:text-white" href="#">{t("footer.partner")}</a></li>
            <li><a className="hover:text-white" href="#">{t("footer.help")}</a></li>
            <li><a className="hover:text-white" href="#">{t("footer.careers")}</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3 text-sm">{t("footer.connect")}</h4>
          <p className="text-sm text-white/60">hello@kisanseva.in</p>
        </div>
      </div>
    </footer>
  );
};
