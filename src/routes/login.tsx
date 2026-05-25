import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Logo } from "@/components/site/Logo";
import { Loader2, Lock, Mail } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Connexion — PROMOFRAIS" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: window.location.origin + "/admin",
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Compte créé. Vérifiez votre email pour confirmer.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Connecté");
        navigate({ to: "/admin" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }
  async function signInWithGoogle() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/admin" });
      if (result.error) throw new Error(result.error.message || "Erreur Google");
      if (result.redirected) return;
      navigate({ to: "/admin" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erreur");
      setLoading(false);
    }
  }


  return (
    <div className="min-h-[calc(100vh-8rem)] grid place-items-center px-4 py-16 bg-gradient-hero relative">
      <div className="absolute inset-0 grain pointer-events-none" />
      <div className="relative w-full max-w-md rounded-3xl border border-gold/20 bg-card/80 backdrop-blur-xl p-8 shadow-glow">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <h1 className="font-display text-3xl text-center mb-2">{mode === "signin" ? "Connexion" : "Créer un compte"}</h1>
        <p className="text-center text-sm text-muted-foreground mb-8">
          Espace admin & client PROMOFRAIS Djerba
        </p>
        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <input
              type="text" placeholder="Nom complet" required value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          )}
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-background/60 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
            <input type="password" placeholder="Mot de passe" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-background/60 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-red px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-red disabled:opacity-50">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Se connecter" : "Créer le compte"}
          </button>
        </form>
        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 w-full text-sm text-muted-foreground hover:text-gold">
          {mode === "signin" ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
        </button>
        <Link to="/" className="mt-2 block text-center text-xs text-muted-foreground hover:text-foreground">← Retour à l'accueil</Link>
      </div>
    </div>
  );
}
