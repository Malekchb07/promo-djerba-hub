import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Trophy } from "lucide-react";
import { listParticipants } from "@/lib/admin.functions";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/participants")({ component: ParticipantsAdmin });

function ParticipantsAdmin() {
  const list = useServerFn(listParticipants);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { try { setItems((await list()).items); } finally { setLoading(false); } })(); }, []);

  function exportCsv() {
    const header = ["Nom", "Email", "Téléphone", "Concours", "Gagnant", "Date"];
    const rows = items.map((p) => [p.full_name, p.email, p.phone ?? "", p.competitions?.title ?? "", p.is_winner ? "Oui" : "Non", new Date(p.created_at).toLocaleString("fr-FR")]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `participants-${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <AdminShell
      title="Participants"
      description="Liste des inscrits aux concours et tirages."
      actions={<button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-surface-2">Exporter CSV</button>}
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin text-gold" /> : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="p-3 text-left">Nom</th><th className="p-3 text-left">Email</th><th className="p-3 text-left">Téléphone</th><th className="p-3 text-left">Concours</th><th className="p-3">Statut</th><th className="p-3">Inscrit le</th></tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3">{p.full_name}</td>
                  <td className="p-3 text-muted-foreground">{p.email}</td>
                  <td className="p-3 text-muted-foreground">{p.phone ?? "—"}</td>
                  <td className="p-3">{p.competitions?.title ?? "—"}</td>
                  <td className="p-3 text-center">{p.is_winner ? <span className="inline-flex items-center gap-1 text-gold"><Trophy className="h-3 w-3" /> Gagnant</span> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="p-3 text-center text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={6} className="p-12 text-center text-sm text-muted-foreground">Aucun participant.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
