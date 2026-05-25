import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Pencil, Trash2, Loader2, Trophy, Dices, Download } from "lucide-react";
import { listCompetitions, upsertCompetition, deleteCompetition, drawWinner, exportWinners } from "@/lib/admin.functions";
import { AdminShell, Field, inputCls, btnPrimary, btnGhost } from "@/components/admin/AdminShell";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/competitions")({ component: CompAdmin });

function CompAdmin() {
  const list = useServerFn(listCompetitions);
  const upsert = useServerFn(upsertCompetition);
  const del = useServerFn(deleteCompetition);
  const draw = useServerFn(drawWinner);
  const exportW = useServerFn(exportWinners);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  async function refresh() { setLoading(true); try { setItems((await list()).items); } finally { setLoading(false); } }
  useEffect(() => { refresh(); }, []);

  const blank = () => ({ title: "", type: "lottery", starts_at: new Date().toISOString(), is_active: true });

  async function onSave(p: any) {
    try { await upsert({ data: p }); toast.success("Enregistré"); setEditing(null); refresh(); }
    catch (e: any) { toast.error(e.message); }
  }
  async function onDelete(id: string) {
    if (!confirm("Supprimer ?")) return;
    try { await del({ data: { id } }); toast.success("Supprimé"); refresh(); } catch (e: any) { toast.error(e.message); }
  }
  async function onDraw(id: string) {
    try {
      const { winner } = await draw({ data: { competition_id: id } });
      toast.success(`Gagnant tiré : ${winner.full_name} (${winner.email})`);
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <AdminShell title="Concours" description="Créez et gérez vos jeux concours et tirages." actions={<button onClick={() => setEditing(blank())} className={btnPrimary}><Plus className="h-4 w-4" /> Nouveau</button>}>
      {loading ? <Loader2 className="h-5 w-5 animate-spin text-gold" /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((c) => (
            <div key={c.id} className="rounded-2xl border border-gold/20 bg-card overflow-hidden">
              {c.image_url && <img src={c.image_url} alt="" className="aspect-video w-full object-cover" />}
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <h3 className="font-display text-xl flex items-center gap-2"><Trophy className="h-4 w-4 text-gold" /> {c.title}</h3>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{c.type}</span>
                </div>
                {c.description && <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>}
                <div className="mt-3 text-xs text-muted-foreground">
                  Du {new Date(c.starts_at).toLocaleDateString("fr-FR")} {c.ends_at && `au ${new Date(c.ends_at).toLocaleDateString("fr-FR")}`}
                </div>
                <div className="mt-4 flex justify-end gap-1">
                  <button onClick={() => onDraw(c.id)} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-gold px-4 py-2 text-xs font-bold text-gold-foreground"><Dices className="h-3.5 w-3.5" /> Tirer un gagnant</button>
                  <button onClick={() => setEditing(c)} className="inline-grid h-8 w-8 place-items-center rounded-lg hover:bg-surface-2"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => onDelete(c.id)} className="inline-grid h-8 w-8 place-items-center rounded-lg text-primary hover:bg-primary/10"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="md:col-span-2 rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">Aucun concours.</div>}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setEditing(null)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSave(editing); }} className="w-full max-w-2xl rounded-3xl border border-gold/20 bg-card p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-2xl mb-6">{editing.id ? "Modifier" : "Nouveau"} concours</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2"><Field label="Titre"><input required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={inputCls} /></Field></div>
              <Field label="Type"><select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })} className={inputCls}>
                <option value="lottery">Tirage au sort</option>
                <option value="instant">Gain instantané</option>
                <option value="quiz">Quiz</option>
              </select></Field>
              <label className="flex items-center gap-2 text-sm self-end pb-3"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Actif</label>
              <Field label="Début"><input type="datetime-local" value={editing.starts_at ? editing.starts_at.slice(0, 16) : ""} onChange={(e) => setEditing({ ...editing, starts_at: new Date(e.target.value).toISOString() })} className={inputCls} /></Field>
              <Field label="Fin"><input type="datetime-local" value={editing.ends_at ? editing.ends_at.slice(0, 16) : ""} onChange={(e) => setEditing({ ...editing, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })} className={inputCls} /></Field>
              <div className="md:col-span-2"><Field label="Description"><textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={inputCls} /></Field></div>
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
