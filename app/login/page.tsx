"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DUMMY_USERS = [
  { email: "sk.boafo@skboafo.gh",      password: "Chambers2026", name: "S.K. Boafo",     role: "Managing Partner" },
  { email: "a.mensah@skboafo.gh",      password: "Chambers2026", name: "Abena Mensah",   role: "Partner" },
  { email: "admin@skboafo.gh",         password: "Admin2026",    name: "Yaa Bonsu",       role: "Admin" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const user = DUMMY_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      if (user) {
        localStorage.setItem("sk_boafo_auth", "true");
        localStorage.setItem("sk_boafo_user", JSON.stringify({ name: user.name, role: user.role, email: user.email }));
        router.replace("/");
      } else {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #0B2349 0%, #143a75 60%, #1b4a94 100%)" }}
    >
      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A227' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative w-full max-w-sm mx-4">
        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "white",
            boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
          }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold mx-auto mb-4"
              style={{ background: "#0B2349", color: "#C9A227" }}
            >
              SK
            </div>
            <h1
              className="text-2xl font-bold text-[#0B2349] mb-1"
              style={{ fontFamily: '"Baskerville", "Baskerville Old Face", "Palatino Linotype", Georgia, serif' }}
            >
              S.K. Boafo & Company
            </h1>
            <p className="text-[12px] text-[#94A3B8] tracking-wide uppercase font-medium">
              Gye Nyame Chambers — Practice Dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wide mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@skboafo.gh"
                className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-[13px] text-[#1e293b] outline-none focus:border-[#0B2349] transition-colors"
                style={{ fontFamily: "Roboto, sans-serif" }}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-[13px] text-[#1e293b] outline-none focus:border-[#0B2349] transition-colors pr-10"
                  style={{ fontFamily: "Roboto, sans-serif" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                  tabIndex={-1}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPass ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg px-3 py-2 text-[12px] text-[#DC2626]" style={{ background: "#FFF5F5", border: "1px solid #FCA5A5" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-2.5 text-[13px] font-semibold text-white transition-opacity"
              style={{ background: "#0B2349", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div
            className="mt-6 rounded-xl p-4"
            style={{ background: "#F5F7FA", border: "1px solid #E2E8F0" }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8] mb-2">
              Demo Credentials
            </p>
            <div className="space-y-1.5">
              {DUMMY_USERS.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => { setEmail(u.email); setPassword(u.password); setError(""); }}
                  className="w-full text-left rounded-lg px-3 py-2 hover:bg-white transition-colors"
                >
                  <p className="text-[12px] font-medium text-[#1e293b]">{u.name} <span className="text-[#94A3B8] font-normal">— {u.role}</span></p>
                  <p className="text-[11px] text-[#64748B] font-mono">{u.email}</p>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[#C4C9D4] mt-2 text-center">Click any row to autofill credentials</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] mt-6" style={{ color: "rgba(255,255,255,0.4)" }}>
          © 2026 S.K. Boafo & Company. All rights reserved.
        </p>
      </div>
    </div>
  );
}
