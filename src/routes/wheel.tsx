import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { Trophy, Sparkles, Loader2, Gift } from "lucide-react";
import { spinWheel, getMySpins, WHEEL_SECTORS } from "@/lib/wheel.functions";
import { PageHero } from "@/components/site/PageHero";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/wheel")({
  component: WheelPage,
  head: () => ({ meta: [
    { title: "Roue de la chance — PROMOFRAIS Djerba" },
    { name: "description", content: "Tournez la roue PROMOFRAIS et gagnez des coupons, paniers et séjours à Djerba." },
  ] }),
});

const COLORS = ["#b8860b", "#d4a017", "#8a1c1c", "#c9a84c", "#a01818", "#e0b84a", "#6e1212", "#b48030"];

function WheelPage() {
  const { user, isLoading } = useAuth();
  const spin = useServerFn(spinWheel);
  const mine = useServerFn(getMySpins);
  const [rotation, setRotation] = useState(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ label: string; winning: boolean } | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const N = WHEEL_SECTORS.length;
  const sectorDeg = 360 / N;

  useEffect(() => { if (user) mine().then(({ spins }) => setHistory(spins)); }, [user]);

  async function onSpin() {
    if (!user) { toast.error("Connectez-vous pour jouer"); return; }
    setBusy(true); setResult(null);
    try {
      const r = await spin({ data: {} });
      // Aligner le centre du secteur gagnant sous le pointeur (haut),
      // en tenant compte de la rotation courante pour les spins suivants.
      const targetAngle = (360 - (r.index * sectorDeg + sectorDeg / 2)) % 360;
      const current = ((rotation % 360) + 360) % 360;
      const delta = ((targetAngle - current) + 360) % 360;
      const next = rotation + 360 * 6 + delta;
      setRotation(next);
      setTimeout(() => {
        setResult({ label: r.label, winning: r.winning });
        if (r.winning) toast.success(`Vous avez gagné : ${r.label} !`);
        else toast.info(r.label);
        mine().then(({ spins }) => setHistory(spins));
        setBusy(false);
      }, 4200);
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur lors du tirage"); setBusy(false);
    }
  }

  return (
    <>
      <PageHero kicker="Roue de la chance" title="Tournez. Gagnez. Souriez." subtitle="Une participation par jour. Coupons, paniers, séjours et grand prix vous attendent." />
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="relative aspect-square w-full max-w-md mx-auto">
            <div className="absolute -inset-4 rounded-full bg-gradient-gold opacity-30 blur-2xl" />
            <motion.svg
              viewBox="0 0 200 200"
              animate={{ rotate: rotation }}
              transition={{ duration: 4, ease: [0.17, 0.67, 0.18, 1] }}
              className="relative h-full w-full drop-shadow-2xl"
            >
              {WHEEL_SECTORS.map((label, i) => {
                const start = i * sectorDeg - 90;
                const end = start + sectorDeg;
                const x1 = 100 + 100 * Math.cos((start * Math.PI) / 180);
                const y1 = 100 + 100 * Math.sin((start * Math.PI) / 180);
                const x2 = 100 + 100 * Math.cos((end * Math.PI) / 180);
                const y2 = 100 + 100 * Math.sin((end * Math.PI) / 180);
                const mid = start + sectorDeg / 2;
                const tx = 100 + 60 * Math.cos((mid * Math.PI) / 180);
                const ty = 100 + 60 * Math.sin((mid * Math.PI) / 180);
                return (
                  <g key={i}>
                    <path d={`M100,100 L${x1},${y1} A100,100 0 0,1 ${x2},${y2} Z`} fill={COLORS[i % COLORS.length]} stroke="#1a1a1a" strokeWidth="0.5" />
                    <text x={tx} y={ty} fill="#fff" fontSize="7" fontWeight="700" textAnchor="middle" transform={`rotate(${mid + 90} ${tx} ${ty})`}>{label}</text>
                  </g>
                );
              })}
              <circle cx="100" cy="100" r="14" fill="#0a0a0a" stroke="#c9a84c" strokeWidth="2" />
            </motion.svg>
            <div className="absolute left-1/2 -top-2 -translate-x-1/2 h-0 w-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-gold drop-shadow-lg" />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-gold mb-4">
              <Sparkles className="h-3 w-3" /> 1 tour / 24h
            </div>
            <h2 className="font-display text-3xl md:text-4xl mb-4">Votre chance vous attend</h2>
            <p className="text-muted-foreground mb-6">
              Connectez-vous, tournez la roue, et récupérez instantanément votre lot sous forme de coupon QR à présenter en magasin.
            </p>

            {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-gold" /> : user ? (
              <button onClick={onSpin} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-gradient-red px-7 py-4 text-sm font-semibold text-primary-foreground shadow-red transition-transform hover:scale-[1.02] disabled:opacity-50">
                {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> En cours…</> : <><Trophy className="h-4 w-4" /> Lancer la roue</>}
              </button>
            ) : (
              <Link to="/login" className="inline-flex items-center gap-2 rounded-full bg-gradient-red px-7 py-4 text-sm font-semibold text-primary-foreground shadow-red">
                Se connecter pour jouer
              </Link>
            )}

            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-6 rounded-2xl border p-5 ${result.winning ? "border-gold/40 bg-gold/5" : "border-border bg-surface"}`}>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Résultat</div>
                <div className="flex items-center gap-2 font-display text-xl">
                  {result.winning && <Gift className="h-5 w-5 text-gold" />} {result.label}
                </div>
                {result.winning && <p className="mt-2 text-sm text-muted-foreground">Votre lot est enregistré dans votre compte. Présentez votre identifiant en caisse.</p>}
              </motion.div>
            )}

            {history.length > 0 && (
              <div className="mt-8">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Historique</div>
                <ul className="space-y-1 text-sm">
                  {history.slice(0, 5).map((h) => (
                    <li key={h.id} className="flex justify-between border-b border-border/50 py-1.5">
                      <span className={h.is_winning ? "text-gold" : "text-muted-foreground"}>{h.prize_label}</span>
                      <span className="text-xs text-muted-foreground">{new Date(h.spun_at).toLocaleDateString("fr-FR")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
