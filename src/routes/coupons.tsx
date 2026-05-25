import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Scissors, QrCode, Loader2, X, CheckCircle2, Ticket } from "lucide-react";
import QRCode from "qrcode";
import { listPublicCoupons, claimCoupon, listMyRedemptions } from "@/lib/coupons.functions";
import { PageHero } from "@/components/site/PageHero";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/coupons")({
  component: CouponsPage,
  head: () => ({
    meta: [
      { title: "Coupons & QR codes — PROMOFRAIS Djerba" },
      { name: "description", content: "Récupérez vos coupons PROMOFRAIS, générez votre QR code et économisez en magasin." },
    ],
  }),
});

type Coupon = {
  id: string;
  code: string;
  label: string;
  description: string | null;
  expires_at: string | null;
  usage_limit: number | null;
  used_count: number;
};

function CouponsPage() {
  const list = useServerFn(listPublicCoupons);
  const claim = useServerFn(claimCoupon);
  const mine = useServerFn(listMyRedemptions);
  const { user } = useAuth();
  const [items, setItems] = useState<Coupon[]>([]);
  const [claimed, setClaimed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [qrModal, setQrModal] = useState<{ label: string; code: string; dataUrl: string; alreadyClaimed?: boolean } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { items } = await list();
    setItems(items as Coupon[]);
    if (user) {
      const { items: red } = await mine();
      setClaimed(new Set(red.map((r: any) => r.coupon_id)));
    } else {
      setClaimed(new Set());
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  async function onClaim(c: Coupon) {
    if (!user) { toast.error("Connectez-vous pour récupérer ce coupon"); return; }
    setBusyId(c.id);
    try {
      const r = await claim({ data: { coupon_id: c.id } });
      const dataUrl = await QRCode.toDataURL(r.qrPayload, {
        width: 320, margin: 1, color: { dark: "#c9a84c", light: "#0a0a0a" },
      });
      setQrModal({ label: r.label, code: r.code, dataUrl, alreadyClaimed: r.alreadyClaimed });
      setClaimed((s) => new Set(s).add(c.id));
      // refresh counters in background
      list().then(({ items }) => setItems(items as Coupon[]));
    } catch (e: any) { toast.error(e?.message ?? "Erreur"); }
    finally { setBusyId(null); }
  }

  return (
    <>
      <PageHero
        kicker="Programme fidélité"
        title="Vos coupons, vos avantages."
        subtitle="1 récupération par utilisateur et par coupon. Présentez le QR code à la caisse."
      />
      <section className="mx-auto max-w-7xl px-4 py-16">
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin text-gold mx-auto" />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {items.map((c, i) => {
              const remaining = c.usage_limit != null ? Math.max(0, c.usage_limit - (c.used_count ?? 0)) : null;
              const soldOut = remaining === 0;
              const isClaimed = claimed.has(c.id);
              const pct = c.usage_limit ? Math.min(100, ((c.used_count ?? 0) / c.usage_limit) * 100) : 0;
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="group relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-card to-surface-2 p-6 hover-lift"
                >
                  <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gold/10 blur-2xl" />
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-background" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-8 w-8 rounded-full bg-background" />

                  <div className="relative flex items-start justify-between mb-6">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold/10 text-gold">
                      <QrCode className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {c.expires_at && (
                        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          Exp. {new Date(c.expires_at).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                      {isClaimed && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-gold">
                          <CheckCircle2 className="h-3 w-3" /> Récupéré
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-display text-xl mb-2 relative">{c.label}</h3>
                  {c.description && <p className="text-xs text-muted-foreground mb-2 relative">{c.description}</p>}

                  {c.usage_limit != null && (
                    <div className="relative mt-3 mb-1">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
                        <span className="inline-flex items-center gap-1">
                          <Ticket className="h-3 w-3" />
                          {soldOut ? "Épuisé" : `${remaining} restant${remaining! > 1 ? "s" : ""}`}
                        </span>
                        <span>{c.used_count ?? 0} / {c.usage_limit}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                        <div
                          className={`h-full transition-all ${soldOut ? "bg-destructive" : "bg-gradient-gold"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="my-4 border-t border-dashed border-gold/30" />

                  <div className="flex items-center justify-between relative">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Code</div>
                      <div className="font-display text-lg text-gold tracking-wider">{c.code}</div>
                    </div>
                    <button
                      onClick={() => onClaim(c)}
                      disabled={busyId === c.id || (soldOut && !isClaimed)}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-4 py-2 text-xs font-bold text-gold-foreground transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {busyId === c.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : isClaimed ? (
                        <><QrCode className="h-3.5 w-3.5" /> Voir QR</>
                      ) : soldOut ? (
                        <>Épuisé</>
                      ) : (
                        <><Scissors className="h-3.5 w-3.5" /> Récupérer</>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
            {items.length === 0 && (
              <div className="md:col-span-3 text-center text-muted-foreground py-16">
                Aucun coupon actif pour le moment.
              </div>
            )}
          </div>
        )}

        {!user && (
          <div className="mt-10 text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-gold hover:underline">Connectez-vous</Link> pour récupérer vos coupons.
          </div>
        )}
      </section>

      {qrModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" onClick={() => setQrModal(null)}>
          <div onClick={(e) => e.stopPropagation()} className="relative max-w-sm rounded-3xl border border-gold/30 bg-card p-8 text-center">
            <button onClick={() => setQrModal(null)} className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full hover:bg-surface-2">
              <X className="h-4 w-4" />
            </button>
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-2">
              {qrModal.alreadyClaimed ? "Votre coupon (déjà récupéré)" : "Votre coupon"}
            </div>
            <h3 className="font-display text-2xl mb-1">{qrModal.label}</h3>
            <div className="font-display text-lg text-gold tracking-wider mb-6">{qrModal.code}</div>
            <img src={qrModal.dataUrl} alt="QR code" className="mx-auto rounded-2xl border border-gold/20" />
            <p className="mt-4 text-xs text-muted-foreground">
              Présentez ce QR code à la caisse pour bénéficier de la remise. Limite : 1 utilisation par utilisateur.
            </p>
            <a
              href={qrModal.dataUrl}
              download={`coupon-${qrModal.code}.png`}
              className="mt-4 inline-flex rounded-full border border-border px-4 py-2 text-xs hover:bg-surface-2"
            >
              Télécharger
            </a>
          </div>
        </div>
      )}
    </>
  );
}
