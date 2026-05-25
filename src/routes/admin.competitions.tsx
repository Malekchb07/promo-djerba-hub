import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Pencil, Trash2, Loader2, Trophy, Dices, Download, History, Users, Check, X } from "lucide-react";
import {
  listCompetitions, upsertCompetition, deleteCompetition,
  drawWinner, exportWinners, listDraws, listEligibleParticipants, setWinner,
} from "@/lib/admin.functions";
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
  const getDraws = useServerFn(listDraws);
  const getParts = useServerFn(listEligibleParticipants);
  const toggleWinner = useServerFn(setWinner);

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [drawCount, setDrawCount] = useState<Record<string, number>>({});
  const [historyFor, setHistoryFor] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [selectFor, setSelectFor] = useState<any | null>(null);
  const [parts, setParts] = useState<any[]>([]);
  const [panelLoading, setPanelLoading] = useState(false);

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
    const count = Math.max(1, drawCount[id] ?? 1);
    try {
      const { winners } = await draw({ data: { competition_id: id, count } });
      toast.success(`${winners.length} gagnant(s) tiré(s) : ${winners.map((w: any) => w.full_name).join(", ")}`);
    } catch (e: any) { toast.error(e.message); }
  }
  async function openHistory(c: any) {
    setHistoryFor(c); setPanelLoading(true);
    try { setHistory((await getDraws({ data: { competition_id: c.id } })).items); }
    catch (e: any) { toast.error(e.message); }
    finally { setPanelLoading(false); }
  }
  async function openSelect(c: any) {
    setSelectFor(c); setPanelLoading(true);
    try { setParts((await getParts({ data: { competition_id: c.id } })).items); }
    catch (e: any) { toast.error(e.message); }
    finally { setPanelLoading(false); }
  }
  async function onToggleWinner(p: any) {
    try {
      await toggleWinner({ data: { participant_id: p.id, is_winner: !p.is_winner } });
      setParts((prev) => prev.map((x) => x.id === p.id ? { ...x, is_winner: !x.is_winner } : x));
      toast.success(!p.is_winner ? "Marqué gagnant" : "Retiré des gagnants");
    } catch (e: any) { toast.error(e.message); }
  }
  async function onExportWinners(competitionId: string, competitionTitle: string) {
    try {
      const { items: winners } = await exportW({ data: { competition_id: competitionId } });
      if (!winners.length) { toast.info("Aucun gagnant pour ce concours."); return; }
      const header = ["Nom", "Email", "Téléphone", "ID Participation", "Date d'inscription", "Concours"];
      const rows = winners.map((w: any) => [w.full_name, w.email, w.phone ?? "", w.id, new Date(w.created_at).toLocaleString("fr-FR"), w.competitions?.title ?? competitionTitle]);
      const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `gagnants-${competitionTitle.replace(/\s+/g, "_")}-${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url);
      toast.success(`${winners.length} gagnant(s) exporté(s).`);
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

                <div className="mt-4 flex items-center gap-2 rounded-xl border border-gold/20 bg-surface p-2">
                  <label className="text-xs text-muted-foreground pl-2">Nombre :</label>
                  <input type="number" min={1} max={50} value={drawCount[c.id] ?? 1}
                    onChange={(e) => setDrawCount((p) => ({ ...p, [c.id]: Math.max(1, Number(e.target.value) || 1) }))}
                    className="w-16 rounded-lg bg-background border border-border px-2 py-1 text-sm" />
                  <button onClick={() => onDraw(c.id)} className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-gradient-gold px-4 py-2 text-xs font-bold text-gold-foreground"><Dices className="h-3.5 w-3.5" /> Tirer</button>
                </div>

                <div className="mt-3 flex flex-wrap justify-end gap-2">
                  <button onClick={() => openSelect(c)} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs hover:bg-surface-2"><Users className="h-3.5 w-3.5" /> Sélection manuelle</button>
                  <button onClick={() => openHistory(c)} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs hover:bg-surface-2"><History className="h-3.5 w-3.5" /> Historique</button>
                  <button onClick={() => onExportWinners(c.id, c.title)} className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 px-3 py-2 text-xs font-medium hover:bg-gold/10"><Download className="h-3.5 w-3.5" /> Exporter</button>
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

      {historyFor && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setHistoryFor(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl rounded-3xl border border-gold/20 bg-card p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h2 className="font-display text-2xl flex items-center gap-2"><History className="h-5 w-5 text-gold" /> Historique — {historyFor.title}</h2>
              <button onClick={() => setHistoryFor(null)} className="rounded-full p-2 hover:bg-surface-2"><X className="h-4 w-4" /></button>
            </div>
            {panelLoading ? <Loader2 className="h-5 w-5 animate-spin text-gold" /> : (
              <div className="rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                    <tr><th className="p-3 text-left">Gagnant</th><th className="p-3 text-left">Contact</th><th className="p-3 text-left">Tiré le</th></tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id} className="border-t border-border">
                        <td className="p-3">{h.participants?.full_name ?? "—"}</td>
                        <td className="p-3 text-muted-foreground text-xs">{h.participants?.email}{h.participants?.phone ? ` · ${h.participants.phone}` : ""}</td>
                        <td className="p-3 text-xs text-muted-foreground">{new Date(h.drawn_at).toLocaleString("fr-FR")}</td>
                      </tr>
                    ))}
                    {history.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-sm text-muted-foreground">Aucun tirage enregistré.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {selectFor && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setSelectFor(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl rounded-3xl border border-gold/20 bg-card p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h2 className="font-display text-2xl flex items-center gap-2"><Users className="h-5 w-5 text-gold" /> Sélection — {selectFor.title}</h2>
              <button onClick={() => setSelectFor(null)} className="rounded-full p-2 hover:bg-surface-2"><X className="h-4 w-4" /></button>
            </div>
            {panelLoading ? <Loader2 className="h-5 w-5 animate-spin text-gold" /> : (
              <div className="rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                    <tr><th className="p-3 text-left">Participant</th><th className="p-3 text-left">Contact</th><th className="p-3 text-center">Action</th></tr>
                  </thead>
                  <tbody>
                    {parts.map((p) => (
                      <tr key={p.id} className="border-t border-border">
                        <td className="p-3">{p.full_name}</td>
                        <td className="p-3 text-muted-foreground text-xs">{p.email}{p.phone ? ` · ${p.phone}` : ""}</td>
                        <td className="p-3 text-center">
                          <button onClick={() => onToggleWinner(p)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${p.is_winner ? "bg-gold/20 text-gold" : "border border-border hover:bg-surface-2"}`}>
                            {p.is_winner ? <><Check className="h-3 w-3" /> Gagnant</> : <>Marquer gagnant</>}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {parts.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-sm text-muted-foreground">Aucun participant.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
