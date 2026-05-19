import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Pencil, Trash2, Loader2, FileText, ExternalLink } from "lucide-react";
import { listCatalogues, upsertCatalogue, deleteCatalogue } from "@/lib/admin.functions";
import { AdminShell, Field, inputCls, btnPrimary, btnGhost } from "@/components/admin/AdminShell";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/catalogues")({ component: CataloguesAdmin });

function CataloguesAdmin() {
  const list = useServerFn(listCatalogues);
  const upsert = useServerFn(upsertCatalogue);
  const del = useServerFn(deleteCatalogue);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  async function refresh() { setLoading(true); try { setItems((await list()).items); } finally { setLoading(false); } }
  useEffect(() => { refresh(); }, []);

  const blank = () => ({ title: "", pdf_url: "", is_active: true, published_at: new Date().toISOString() });

  async function onSave(p: any) {
    if (!p.pdf_url) { toast.error("Veuillez uploader un PDF"); return; }
    try { await upsert({ data: p }); toast.success("Enregistré"); setEditing(null); refresh(); }
    catch (e: any) { toast.error(e.message); }
  }
  async function onDelete(id: string) {
    if (!confirm("Supprimer ?")) return;
    try { await del({ data: { id } }); toast.success("Supprimé"); refresh(); } catch (e: any) { toast.error(e.message); }
  }

  return (
    <AdminShell title="Catalogues" description="Publiez vos catalogues PDF avec couverture et badge." actions={<button onClick={() => setEditing(blank())} className={btnPrimary}><Plus className="h-4 w-4" /> Nouveau</button>}>
      {loading ? <Loader2 className="h-5 w-5 animate-spin text-gold" /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="aspect-[3/4] bg-surface relative">
                {c.cover_url ? <img src={c.cover_url} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full grid place-items-center text-muted-foreground"><FileText className="h-10 w-10" /></div>}
                {c.badge && <span className="absolute top-3 left-3 rounded-full glass px-3 py-1 text-[10px] uppercase tracking-wider text-gold">{c.badge}</span>}
              </div>
              <div className="p-4">
                <h3 className="font-display text-lg">{c.title}</h3>
                <div className="mt-1 text-xs text-muted-foreground">{c.page_count ? `${c.page_count} pages · ` : ""}{new Date(c.published_at).toLocaleDateString("fr-FR")}</div>
                <div className="mt-3 flex justify-between">
                  <a href={c.pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-gold hover:underline">Voir PDF <ExternalLink className="h-3 w-3" /></a>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(c)} className="inline-grid h-8 w-8 place-items-center rounded-lg hover:bg-surface-2"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => onDelete(c.id)} className="inline-grid h-8 w-8 place-items-center rounded-lg text-primary hover:bg-primary/10"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="md:col-span-2 lg:col-span-3 rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">Aucun catalogue.</div>}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setEditing(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSave(editing); }} className="w-full max-w-2xl rounded-3xl border border-gold/20 bg-card p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-2xl mb-6">{editing.id ? "Modifier" : "Nouveau"} catalogue</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2"><Field label="Titre"><input required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={inputCls} /></Field></div>
              <Field label="Badge"><input value={editing.badge ?? ""} onChange={(e) => setEditing({ ...editing, badge: e.target.value || null })} className={inputCls} placeholder="En cours, Limité..." /></Field>
              <Field label="Nombre de pages"><input type="number" min={1} value={editing.page_count ?? ""} onChange={(e) => setEditing({ ...editing, page_count: e.target.value ? Number(e.target.value) : null })} className={inputCls} /></Field>
              <div><ImageUpload bucket="catalogue-covers" label="Couverture" value={editing.cover_url} onChange={(url) => setEditing({ ...editing, cover_url: url })} /></div>
              <div><ImageUpload bucket="catalogue-pdfs" label="Fichier PDF" accept="application/pdf" value={editing.pdf_url} onChange={(url) => setEditing({ ...editing, pdf_url: url || "" })} /></div>
              <div className="md:col-span-2"><Field label="Description"><textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={inputCls} /></Field></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Publié</label>
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
