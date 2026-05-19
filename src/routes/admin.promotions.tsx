import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { listPromotions, upsertPromotion, deletePromotion } from "@/lib/admin.functions";
import { AdminShell, Field, inputCls, btnPrimary, btnGhost } from "@/components/admin/AdminShell";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/promotions")({ component: PromotionsAdmin });

function PromotionsAdmin() {
  const list = useServerFn(listPromotions);
  const upsert = useServerFn(upsertPromotion);
  const del = useServerFn(deletePromotion);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  async function refresh() { setLoading(true); try { setItems((await list()).items); } finally { setLoading(false); } }
  useEffect(() => { refresh(); }, []);

  function blank() {
    const now = new Date().toISOString();
    return { title: "", subtitle: "", discount_percent: 10, starts_at: now, ends_at: null, is_active: true };
  }

  async function onSave(p: any) {
    try { await upsert({ data: p }); toast.success("Enregistré"); setEditing(null); refresh(); } catch (e: any) { toast.error(e.message); }
  }
  async function onDelete(id: string) {
    if (!confirm("Supprimer ?")) return;
    try { await del({ data: { id } }); toast.success("Supprimé"); refresh(); } catch (e: any) { toast.error(e.message); }
  }

  return (
    <AdminShell title="Promotions" description="Gérez vos campagnes promotionnelles." actions={<button onClick={() => setEditing(blank())} className={btnPrimary}><Plus className="h-4 w-4" /> Nouvelle</button>}>
      {loading ? <Loader2 className="h-5 w-5 animate-spin text-gold" /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-card overflow-hidden">
              {p.image_url && <img src={p.image_url} alt="" className="aspect-video w-full object-cover" />}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-lg">{p.title}</h3>
                    {p.subtitle && <p className="text-xs text-muted-foreground mt-1">{p.subtitle}</p>}
                  </div>
                  {p.discount_percent != null && <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">-{p.discount_percent}%</span>}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Du {new Date(p.starts_at).toLocaleDateString("fr-FR")} {p.ends_at && `au ${new Date(p.ends_at).toLocaleDateString("fr-FR")}`}
                </div>
                <div className="mt-3 flex justify-end gap-1">
                  <button onClick={() => setEditing(p)} className="inline-grid h-8 w-8 place-items-center rounded-lg hover:bg-surface-2"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => onDelete(p.id)} className="inline-grid h-8 w-8 place-items-center rounded-lg text-primary hover:bg-primary/10"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="md:col-span-2 lg:col-span-3 rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">Aucune promotion.</div>}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setEditing(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSave({ ...editing, starts_at: editing.starts_at || new Date().toISOString() }); }} className="w-full max-w-2xl rounded-3xl border border-gold/20 bg-card p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-2xl mb-6">{editing.id ? "Modifier" : "Nouvelle"} promotion</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2"><Field label="Titre"><input required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={inputCls} /></Field></div>
              <div className="md:col-span-2"><Field label="Sous-titre"><input value={editing.subtitle ?? ""} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} className={inputCls} /></Field></div>
              <Field label="Remise (%)"><input type="number" min={0} max={100} value={editing.discount_percent ?? ""} onChange={(e) => setEditing({ ...editing, discount_percent: e.target.value ? Number(e.target.value) : null })} className={inputCls} /></Field>
              <Field label="Début"><input type="datetime-local" value={editing.starts_at ? editing.starts_at.slice(0, 16) : ""} onChange={(e) => setEditing({ ...editing, starts_at: new Date(e.target.value).toISOString() })} className={inputCls} /></Field>
              <Field label="Fin"><input type="datetime-local" value={editing.ends_at ? editing.ends_at.slice(0, 16) : ""} onChange={(e) => setEditing({ ...editing, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })} className={inputCls} /></Field>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Active</label>
              <div className="md:col-span-2"><ImageUpload bucket="promotion-images" value={editing.image_url} onChange={(url) => setEditing({ ...editing, image_url: url })} /></div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(null)} className={btnGhost}>Annuler</button>
              <button type="submit" className={btnPrimary}>Enregistrer</button>
            </div>
          </form>
        </div>
      )}
    </AdminShell>
  );
}
