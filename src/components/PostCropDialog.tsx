import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

const UNITS = ["kg", "g", "dozen", "piece", "quintal", "litre"];

export const PostCropDialog = ({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [f, setF] = useState({
    title: "", category: "grains", description: "", unit: "kg",
    price_per_kg: "", stock_kg: "", min_order_kg: "1",
    location: "", image_url: "", status: "in_stock",
  });

  const reset = () => setF({
    title: "", category: "grains", description: "", unit: "kg",
    price_per_kg: "", stock_kg: "", min_order_kg: "1",
    location: "", image_url: "", status: "in_stock",
  });

  const submit = async () => {
    if (!user) { toast.error(t("postCrop.loginFirst")); return; }
    if (!f.title.trim() || !f.price_per_kg || !f.stock_kg) {
      toast.error("Please fill in name, price, and total stock");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("listings").insert({
      seller_id: user.id,
      title: f.title.trim(),
      category: f.category,
      description: f.description.trim() || null,
      unit: f.unit,
      price_per_kg: Number(f.price_per_kg),
      stock_kg: Math.max(1, parseInt(f.stock_kg) || 1),
      min_order_kg: Math.max(1, parseInt(f.min_order_kg) || 1),
      location: f.location.trim() || null,
      image_url: f.image_url.trim() || null,
      status: f.status,
    });
    setSubmitting(false);
    if (error) { toast.error(t("postCrop.failed"), { description: error.message }); return; }
    toast.success(t("postCrop.success"));
    reset();
    onOpenChange(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl">
            <Sparkles className="h-5 w-5 text-primary" />{t("postCrop.title")}
          </DialogTitle>
          <DialogDescription>{t("postCrop.subtitle")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div>
            <Label>{t("postCrop.cropName")}</Label>
            <Input className="mt-1.5" placeholder={t("postCrop.cropNamePh")} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t("postCrop.category")}</Label>
              <Select value={f.category} onValueChange={(v) => setF({ ...f, category: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="grains">{t("cats.grains")}</SelectItem>
                  <SelectItem value="vegetables">{t("cats.vegetables")}</SelectItem>
                  <SelectItem value="fruits">{t("cats.fruits")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("postCrop.unit")}</Label>
              <Select value={f.unit} onValueChange={(v) => setF({ ...f, unit: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => <SelectItem key={u} value={u}>{t(`unit.${u}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>{t("postCrop.price")}</Label>
              <Input className="mt-1.5" type="number" min="1" placeholder="0" value={f.price_per_kg} onChange={(e) => setF({ ...f, price_per_kg: e.target.value })} />
              <p className="text-[10px] text-muted-foreground mt-1">₹ per 1 {f.unit}</p>
            </div>
            <div>
              <Label>{t("postCrop.stock")}</Label>
              <Input className="mt-1.5" type="number" min="1" placeholder="0" value={f.stock_kg} onChange={(e) => setF({ ...f, stock_kg: e.target.value })} />
              <p className="text-[10px] text-muted-foreground mt-1">in {f.unit}</p>
            </div>
            <div>
              <Label>{t("postCrop.minOrder")}</Label>
              <Input className="mt-1.5" type="number" min="1" placeholder="1" value={f.min_order_kg} onChange={(e) => setF({ ...f, min_order_kg: e.target.value })} />
              <p className="text-[10px] text-muted-foreground mt-1">in {f.unit}</p>
            </div>
          </div>

          <div>
            <Label>{t("postCrop.description")}</Label>
            <Textarea className="mt-1.5" rows={3} placeholder={t("postCrop.descriptionPh")} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t("postCrop.location")}</Label>
              <Input className="mt-1.5" placeholder={t("postCrop.locationPh")} value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} />
            </div>
            <div>
              <Label>{t("postCrop.status")}</Label>
              <Select value={f.status} onValueChange={(v) => setF({ ...f, status: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_stock">{t("postCrop.statusInStock")}</SelectItem>
                  <SelectItem value="harvesting_soon">{t("postCrop.statusHarvesting")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>{t("postCrop.image")}</Label>
            <Input className="mt-1.5" placeholder="https://..." value={f.image_url} onChange={(e) => setF({ ...f, image_url: e.target.value })} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button onClick={submit} disabled={submitting} className="bg-primary hover:bg-primary/90">
            {submitting ? t("common.saving") : t("postCrop.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
