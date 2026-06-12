import { useState } from "react";
import { Briefcase } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setConfirmed(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }

    setLoading(false);
  }

  return (
    <div
      className="min-h-screen bg-background text-foreground flex items-center justify-center"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <div className="w-full max-w-sm px-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#b4ff57" }}
          >
            <Briefcase size={13} color="#08080c" strokeWidth={2.5} />
          </div>
          <span
            className="text-sm font-semibold tracking-widest text-foreground/90"
            style={{ fontFamily: "'DM Mono', monospace", letterSpacing: "0.14em" }}
          >
            APPLIED
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border border-border p-6"
          style={{
            backgroundColor: "#111118",
            boxShadow: isSignUp
              ? "0 25px 50px -12px rgba(0,0,0,0.25), 0 0 40px rgba(180,255,87,0.08)"
              : "0 25px 50px -12px rgba(0,0,0,0.25)",
            borderTop: isSignUp ? "2px solid #b4ff57" : undefined,
          }}
        >
          {confirmed ? (
            <div className="text-center py-2">
              <p className="text-sm font-semibold text-foreground mb-1">Check your email</p>
              <p className="text-xs text-muted-foreground">
                We sent a confirmation link to <span className="text-foreground">{email}</span>.
                Click it to activate your account.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-base font-semibold text-foreground mb-1 text-center">
                {isSignUp ? "Create account" : "Welcome back"}
              </h2>
              <p className={`text-xs text-muted-foreground ${isSignUp ? "mb-3" : "mb-5"} text-center`}>
                {isSignUp ? "Start tracking your applications" : "Sign in to your account"}
              </p>

              {isSignUp && (
                <div className="flex flex-col gap-1.5 mb-5">
                  {[
                    "Kanban pipeline from wishlist to offer",
                    "Track salary, location & work type",
                    "Free forever — no credit card needed",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: "#b4ff57" }}>✓</span>
                      <span className="text-xs text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5 font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5 font-medium">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>

                {error && <p className="text-xs text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
                  style={{ backgroundColor: "#b4ff57", color: "#08080c" }}
                >
                  {loading ? "Loading…" : isSignUp ? "Create account" : "Sign in"}
                </button>
              </form>

              <p className="text-xs text-muted-foreground text-center mt-4">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                  }}
                  className="text-xs text-foreground underline p-0"
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
