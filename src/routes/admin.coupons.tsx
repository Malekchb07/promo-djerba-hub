import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Pencil, Trash2, Loader2, Ticket } from "lucide-react";
import { listCoupons, upsertCoupon, deleteCoupon } from "@/lib/admin.functions";
import { AdminShell, Field, inputCls, btnPrimary, btnGhost } from "@/components/admin/AdminShell";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/coupons")({ component: CouponsAdmin });

function CouponsAdmin() {
  const list = useServerFn(listCoupons);
  const upsert = useServerFn(upsertCoupon);
  const del = useServerFn(deleteCoupon);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  async function refresh() { setLoading(true); try { setItems((await list()).items); } finally { setLoading(false); } }
  useEffect(() => { refresh(); }, []);

  const blank = () => ({ code: "", label: "", discount_percent: 10, is_active: true });

  async function onSave(p: any) {
    try { await upsert({ data: { ...p, code: p.code.toUpperCase() } }); toast.success("Enregistré"); setEditing(null); refresh(); }
    catch (e: any) { toast.error(e.message); }
  }
  async function onDelete(id: string) {
    if (!confirm("Supprimer ?")) return;
    try { await del({ data: { id } }); toast.success("Supprimé"); refresh(); } catch (e: any) { toast.error(e.message); }
  }

  return (
    <AdminShell title="Coupons" description="Gérez vos coupons de réduction et limites d'usage." actions={<button onClick={() => setEditing(blank())} className={btnPrimary}><Plus className="h-4 w-4" /> Nouveau</button>}>
      {loading ? <Loader2 className="h-5 w-5 animate-spin text-gold" /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <div key={c.id} className="relative rounded-2xl border border-gold/20 bg-gradient-to-br from-card to-surface-2 p-5">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-background" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-6 w-6 rounded-full bg-background" />
              <div className="flex items-start justify-between mb-3">
                <Ticket className="h-5 w-5 text-gold" />
                <span className="font-display text-2xl text-gold">{c.discount_percent ? `-${c.discount_percent}%` : `-${c.discount_amount} DT`}</span>
              </div>
              <h3 className="font-display text-lg">{c.label}</h3>
              <div className="my-3 border-t border-dashed border-gold/30" />
              <div className="font-display text-xl tracking-wider text-gold">{c.code}</div>
              <div className="mt-2 text-xs text-muted-foreground">
                Utilisé {c.used_count ?? 0}{c.usage_limit ? ` / ${c.usage_limit}` : ""}
                {c.expires_at && ` · Exp. ${new Date(c.expires_at).toLocaleDateString("fr-FR")}`}
              </div>
              <div className="mt-3 flex justify-end gap-1">
                <button onClick={() => setEditing(c)} className="inline-grid h-8 w-8 place-items-center rounded-lg hover:bg-surface-2"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => onDelete(c.id)} className="inline-grid h-8 w-8 place-items-center rounded-lg text-primary hover:bg-primary/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="md:col-span-2 lg:col-span-3 rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">Aucun coupon.</div>}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setEditing(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSave(editing); }} className="w-full max-w-xl rounded-3xl border border-gold/20 bg-card p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-2xl mb-6">{editing.id ? "Modifier" : "Nouveau"} coupon</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Code (A-Z, 0-9, _, -)"><input required value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} className={inputCls} placeholder="FRAIS20" /></Field>
              <Field label="Libellé"><input required value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} className={inputCls} /></Field>
              <Field label="Remise (%)"><input type="number" min={0} max={100} value={editing.discount_percent ?? ""} onChange={(e) => setEditing({ ...editing, discount_percent: e.target.value ? Number(e.target.value) : null })} className={inputCls} /></Field>
              <Field label="Remise (DT)"><input type="number" step="0.01" value={editing.discount_amount ?? ""} onChange={(e) => setEditing({ ...editing, discount_amount: e.target.value ? Number(e.target.value) : null })} className={inputCls} /></Field>
              <Field label="Achat min (DT)"><input type="number" step="0.01" value={editing.min_purchase ?? ""} onChange={(e) => setEditing({ ...editing, min_purchase: e.target.value ? Number(e.target.value) : null })} className={inputCls} /></Field>
              <Field label="Quota d'utilisation"><input type="number" value={editing.usage_limit ?? ""} onChange={(e) => setEditing({ ...editing, usage_limit: e.target.value ? Number(e.target.value) : null })} className={inputCls} /></Field>
              <Field label="Expire le"><input type="datetime-local" value={editing.expires_at ? editing.expires_at.slice(0, 16) : ""} onChange={(e) => setEditing({ ...editing, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null })} className={inputCls} /></Field>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Actif</label>
              <div className="md:col-span-2"><Field label="Description"><textarea rows={2} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={inputCls} /></Field></div>
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
