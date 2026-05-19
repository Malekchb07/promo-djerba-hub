import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Pencil, Trash2, Loader2, Star } from "lucide-react";
import { listProducts, upsertProduct, deleteProduct } from "@/lib/admin.functions";
import { AdminShell, Field, inputCls, btnPrimary, btnGhost } from "@/components/admin/AdminShell";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({ component: ProductsAdmin });

type P = any;

function ProductsAdmin() {
  const list = useServerFn(listProducts);
  const upsert = useServerFn(upsertProduct);
  const del = useServerFn(deleteProduct);
  const [items, setItems] = useState<P[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<P | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const { items } = await list();
      setItems(items);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { refresh(); }, []);

  async function onSave(p: P) {
    try {
      await upsert({ data: p });
      toast.success("Enregistré");
      setEditing(null);
      refresh();
    } catch (e: any) { toast.error(e.message); }
  }
  async function onDelete(id: string) {
    if (!confirm("Supprimer ?")) return;
    try { await del({ data: { id } }); toast.success("Supprimé"); refresh(); } catch (e: any) { toast.error(e.message); }
  }

  return (
    <AdminShell
      title="Produits"
      description="Gérez votre catalogue produits, prix et badges promo."
      actions={<button onClick={() => setEditing({ name: "", price: 0, stock: 0, is_active: true, is_featured: false })} className={btnPrimary}><Plus className="h-4 w-4" /> Nouveau</button>}
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin text-gold" /> : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="p-3 text-left">Produit</th><th className="p-3">Prix</th><th className="p-3">Stock</th><th className="p-3">Statut</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {p.image_url && <img src={p.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                      <div>
                        <div className="font-medium flex items-center gap-2">{p.name} {p.is_featured && <Star className="h-3 w-3 text-gold" />}</div>
                        {p.promo_badge && <div className="text-xs text-gold">{p.promo_badge}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div>{Number(p.price).toFixed(2)} DT</div>
                    {p.old_price && <div className="text-xs text-muted-foreground line-through">{Number(p.old_price).toFixed(2)}</div>}
                  </td>
                  <td className="p-3 text-center">{p.stock}</td>
                  <td className="p-3 text-center"><span className={`text-xs ${p.is_active ? "text-emerald-400" : "text-muted-foreground"}`}>{p.is_active ? "Actif" : "Inactif"}</span></td>
                  <td className="p-3 text-right">
                    <button onClick={() => setEditing(p)} className="mr-1 inline-grid h-8 w-8 place-items-center rounded-lg hover:bg-surface-2"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => onDelete(p.id)} className="inline-grid h-8 w-8 place-items-center rounded-lg text-primary hover:bg-primary/10"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={5} className="p-12 text-center text-sm text-muted-foreground">Aucun produit. Cliquez sur Nouveau.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setEditing(null)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => { e.preventDefault(); onSave(editing); }}
            className="w-full max-w-2xl rounded-3xl border border-gold/20 bg-card p-6 md:p-8 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="font-display text-2xl mb-6">{editing.id ? "Modifier" : "Nouveau"} produit</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2"><Field label="Nom"><input required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputCls} /></Field></div>
              <Field label="Prix (DT)"><input type="number" step="0.01" required value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} className={inputCls} /></Field>
              <Field label="Ancien prix (optionnel)"><input type="number" step="0.01" value={editing.old_price ?? ""} onChange={(e) => setEditing({ ...editing, old_price: e.target.value ? Number(e.target.value) : null })} className={inputCls} /></Field>
              <Field label="Stock"><input type="number" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} className={inputCls} /></Field>
              <Field label="Badge promo"><input value={editing.promo_badge ?? ""} onChange={(e) => setEditing({ ...editing, promo_badge: e.target.value || null })} className={inputCls} placeholder="-20%, Nouveau..." /></Field>
              <div className="md:col-span-2"><Field label="Description"><textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={inputCls} /></Field></div>
              <div className="md:col-span-2"><ImageUpload bucket="product-images" value={editing.image_url} onChange={(url) => setEditing({ ...editing, image_url: url })} /></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Actif</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_featured} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} /> Mis en avant</label>
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
