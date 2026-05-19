import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Loader2 } from "lucide-react";

export function ImageUpload({
  bucket,
  value,
  onChange,
  accept = "image/*",
  label = "Image",
}: {
  bucket: string;
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  accept?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (e: any) {
      alert(e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-1.5 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      {value ? (
        <div className="relative inline-block">
          {accept.includes("image") ? (
            <img src={value} alt="" className="h-32 w-32 rounded-xl object-cover border border-border" />
          ) : (
            <div className="h-32 w-32 rounded-xl border border-border bg-surface grid place-items-center text-xs text-muted-foreground p-2 text-center break-all">
              {value.split("/").pop()}
            </div>
          )}
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -top-2 -right-2 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground shadow"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <label className="inline-flex h-32 w-32 cursor-pointer items-center justify-center rounded-xl border border-dashed border-border bg-surface text-muted-foreground hover:border-gold/40">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </label>
      )}
    </div>
  );
}
