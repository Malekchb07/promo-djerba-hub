import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Scissors, QrCode, Loader2, X } from "lucide-react";
import QRCode from "qrcode";
import { listPublicCoupons, claimCoupon } from "@/lib/coupons.functions";
import { PageHero } from "@/components/site/PageHero";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/coupons")({
  component: CouponsPage,
  head: () => ({ meta: [
    { title: "Coupons & QR codes — PROMOFRAIS Djerba" },
    { name: "description", content: "Récupérez vos coupons PROMOFRAIS, générez votre QR code et économisez en magasin." },
  ] }),
});

function CouponsPage() {
  const list = useServerFn(listPublicCoupons);
  const claim = useServerFn(claimCoupon);
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrModal, setQrModal] = useState<{ label: string; code: string; dataUrl: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => { list().then(({ items }) => { setItems(items); setLoading(false); }); }, []);

  async function onClaim(c: any) {
    if (!user) { toast.error("Connectez-vous pour récupérer ce coupon"); return; }
    setBusyId(c.id);
    try {
      const r = await claim({ data: { coupon_id: c.id } });
      const dataUrl = await QRCode.toDataURL(r.qrPayload, { width: 320, margin: 1, color: { dark: "#c9a84c", light: "#0a0a0a" } });
      setQrModal({ label: r.label, code: r.code, dataUrl });
    } catch (e: any) { toast.error(e.message); }
    finally { setBusyId(null); }
  }

  return (
    <>
      <PageHero kicker="Programme fidélité" title="Vos coupons, vos avantages." subtitle="Récupérez vos coupons en un clic. Présentez le QR code à la caisse." />
      <section className="mx-auto max-w-7xl px-4 py-16">
        {loading ? <Loader2 className="h-6 w-6 animate-spin text-gold mx-auto" /> : (
          <div className="grid gap-4 md:grid-cols-3">
            {items.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-card to-surface-2 p-6 hover-lift">
                <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gold/10 blur-2xl" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-background" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-8 w-8 rounded-full bg-background" />
                <div className="relative flex items-start justify-between mb-6">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold/10 text-gold"><QrCode className="h-5 w-5" /></div>
                  {c.expires_at && <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Exp. {new Date(c.expires_at).toLocaleDateString("fr-FR")}</span>}
                </div>
                <h3 className="font-display text-xl mb-2">{c.label}</h3>
                {c.description && <p className="text-xs text-muted-foreground mb-2">{c.description}</p>}
                <div className="my-4 border-t border-dashed border-gold/30" />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Code</div>
                    <div className="font-display text-lg text-gold tracking-wider">{c.code}</div>
                  </div>
                  <button onClick={() => onClaim(c)} disabled={busyId === c.id} className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-4 py-2 text-xs font-bold text-gold-foreground transition-transform hover:scale-105 disabled:opacity-50">
                    {busyId === c.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Scissors className="h-3.5 w-3.5" />} Récupérer
                  </button>
                </div>
              </motion.div>
            ))}
            {items.length === 0 && <div className="md:col-span-3 text-center text-muted-foreground py-16">Aucun coupon actif pour le moment.</div>}
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
            <button onClick={() => setQrModal(null)} className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full hover:bg-surface-2"><X className="h-4 w-4" /></button>
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Votre coupon</div>
            <h3 className="font-display text-2xl mb-1">{qrModal.label}</h3>
            <div className="font-display text-lg text-gold tracking-wider mb-6">{qrModal.code}</div>
            <img src={qrModal.dataUrl} alt="QR code" className="mx-auto rounded-2xl border border-gold/20" />
            <p className="mt-4 text-xs text-muted-foreground">Présentez ce QR code à la caisse pour bénéficier de la remise.</p>
            <a href={qrModal.dataUrl} download={`coupon-${qrModal.code}.png`} className="mt-4 inline-flex rounded-full border border-border px-4 py-2 text-xs hover:bg-surface-2">Télécharger</a>
          </div>
        </div>
      )}
    </>
  );
}
