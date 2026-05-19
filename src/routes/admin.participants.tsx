import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";
export const Route = createFileRoute("/admin/participants")({
  component: () => (
    <div className="p-6 md:p-10">
      <h1 className="font-display text-3xl md:text-4xl mb-2">Participants</h1>
      <p className="text-sm text-muted-foreground mb-8">Module en cours de construction.</p>
      <div className="rounded-3xl border border-gold/20 bg-card p-12 grid place-items-center text-center">
        <Construction className="h-10 w-10 text-gold mb-4" />
        <p className="text-sm text-muted-foreground max-w-md">Liste des participants, export CSV et désignation des gagnants — à venir.</p>
      </div>
    </div>
  ),
});
