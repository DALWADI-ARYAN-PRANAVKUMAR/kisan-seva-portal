import { useState, useEffect, useRef } from "react";
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
import { Sparkles, Upload, Camera, X, Image as ImageIcon } from "lucide-react";

const UNITS = ["kg", "g", "dozen", "piece", "quintal", "litre"];

export type EditableListing = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  unit: string;
  price_per_kg: number;
  stock_kg: number;
  min_order_kg: number;
  location: string | null;
  image_url: string | null;
  status: string;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
  /** When provided, dialog is in edit mode. */
  listing?: EditableListing | null;
};

const emptyForm = {
  title: "", category: "grains", description: "", unit: "kg",
  price_per_kg: "", stock_kg: "", min_order_kg: "1",
  location: "", image_url: "", status: "in_stock",
};

export const PostCropDialog = ({ open, onOpenChange, onCreated, listing }: Props) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isEdit = !!listing;
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [f, setF] = useState(emptyForm);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Hydrate form when opening / switching listing
  useEffect(() => {
    if (open && listing) {
      setF({
        title: listing.title,
        category: listing.category,
        description: listing.description || "",
        unit: listing.unit,
        price_per_kg: String(listing.price_per_kg),
        stock_kg: String(listing.stock_kg),
        min_order_kg: String(listing.min_order_kg),
        location: listing.location || "",
        image_url: listing.image_url || "",
        status: listing.status,
      });
    } else if (open && !listing) {
      setF(emptyForm);
    }
  }, [open, listing]);

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return;
    if (!user) { toast.error(t("postCrop.loginFirst")); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB"); return; }
    setUploading(true);
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("crop-images").upload(path, file, {
      cacheControl: "3600", upsert: false, contentType: file.type || "image/jpeg",
    });
    setUploading(false);
    if (upErr) { toast.error("Upload failed", { description: upErr.message }); return; }
    const { data: pub } = supabase.storage.from("crop-images").getPublicUrl(path);
    setF((s) => ({ ...s, image_url: pub.publicUrl }));
    toast.success("Image added");
  };

  const submit = async () => {
    if (!user) { toast.error(t("postCrop.loginFirst")); return; }
    if (!f.title.trim() || !f.price_per_kg || !f.stock_kg) {
      toast.error("Please fill in name, price, and total stock"); return;
    }
    setSubmitting(true);
    const payload = {
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
    };
    const { error } = isEdit
      ? await supabase.from("listings").update(payload).eq("id", listing!.id)
      : await supabase.from("listings").insert({ ...payload, seller_id: user.id });
    setSubmitting(false);
    if (error) { toast.error(isEdit ? "Could not update" : t("postCrop.failed"), { description: error.message }); return; }
    toast.success(isEdit ? "Listing updated" : t("postCrop.success"));
    setF(emptyForm);
    onOpenChange(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl">
            <Sparkles className="h-5 w-5 text-primary" />
            {isEdit ? "Edit Listing" : t("postCrop.title")}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? "Update your crop details and save changes." : t("postCrop.subtitle")}
          </DialogDescription>
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

          {/* IMAGE UPLOAD / CAMERA */}
          <div>
            <Label>Crop Photo</Label>
            <p className="text-[11px] text-muted-foreground mt-1">Upload from your device or take a fresh photo with your camera.</p>

            {f.image_url ? (
              <div className="mt-2 space-y-2">
                <div className="relative rounded-xl overflow-hidden border border-border">
                  <img src={f.image_url} alt="Crop preview" className="w-full h-44 object-cover" />
                  <button
                    type="button"
                    onClick={() => setF({ ...f, image_url: "" })}
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-3.5 w-3.5 mr-1.5" /> Replace from device
                  </Button>
                  <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => cameraInputRef.current?.click()}>
                    <Camera className="h-3.5 w-3.5 mr-1.5" /> Retake photo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-border p-4 flex flex-col items-center gap-1.5 hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                >
                  <Upload className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold">Upload from device</span>
                  <span className="text-[10px] text-muted-foreground">JPG / PNG, up to 5 MB</span>
                </button>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => cameraInputRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-border p-4 flex flex-col items-center gap-1.5 hover:border-secondary hover:bg-secondary/5 transition-colors disabled:opacity-50"
                >
                  <Camera className="h-5 w-5 text-secondary" />
                  <span className="text-sm font-semibold">Take a photo</span>
                  <span className="text-[10px] text-muted-foreground">Opens your camera</span>
                </button>
              </div>
            )}

            {uploading && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                <ImageIcon className="h-3 w-3 animate-pulse" />Uploading…
              </p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0])}
            />

            <div className="mt-3">
              <Label className="text-xs text-muted-foreground">Or paste an image URL</Label>
              <Input className="mt-1" placeholder="https://..." value={f.image_url} onChange={(e) => setF({ ...f, image_url: e.target.value })} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button onClick={submit} disabled={submitting || uploading} className="bg-primary hover:bg-primary/90">
            {submitting ? t("common.saving") : isEdit ? "Save changes" : t("postCrop.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
