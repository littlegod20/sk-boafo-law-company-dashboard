"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DUMMY_USERS = [
  { email: "sk.boafo@skboafo.gh",    password: "Chambers2026", name: "S.K. Boafo",      role: "Managing Partner" },
  { email: "k.asare@skboafo.gh",     password: "Chambers2026", name: "Kwabena Asare",   role: "Partner" },
  { email: "k.frimpong@skboafo.gh",  password: "Chambers2026", name: "Kojo Frimpong",   role: "Partner" },
  { email: "k.mensah@skboafo.gh",    password: "Associate2026", name: "Kofi Mensah",    role: "Associate" },
  { email: "a.asante@skboafo.gh",    password: "Associate2026", name: "Abena Asante",   role: "Associate" },
  { email: "a.darko@skboafo.gh",     password: "Paralegal2026", name: "Ama Darko",      role: "Paralegal" },
  { email: "a.twum@skboafo.gh",      password: "Paralegal2026", name: "Akua Twum",      role: "Paralegal" },
  { email: "n.acheampong@skboafo.gh",password: "Admin2026",     name: "Nana Acheampong",role: "Admin" },
  { email: "y.bonsu@skboafo.gh",     password: "HROfficer2026", name: "Yaa Bonsu",      role: "HR Officer" },
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
      className="relative h-screen overflow-hidden flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0B2349 0%, #143a75 60%, #1b4a94 100%)" }}
    >
      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A227' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative w-full max-w-3xl flex flex-col items-center">
        <div className="w-full flex flex-col md:flex-row gap-4 md:gap-5 items-stretch max-h-[calc(100vh-5.5rem)]">
          {/* Login card */}
          <div
            className="w-full md:w-[380px] md:flex-shrink-0 rounded-2xl p-8 flex flex-col justify-center"
            style={{
              background: "white",
              boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
            }}
          >
            <div className="text-center mb-8">
              <div
                className="rounded-xl overflow-hidden mb-4 mx-auto"
              >
                <img
                  src="/SK-Boafo-logo.png"
                  alt="S.K. Boafo & Company"
                  className="w-full h-auto block"
                />
              </div>
              <p className="text-[12px] text-[#94A3B8] tracking-wide uppercase font-medium">
                Gye Nyame Chambers — Practice Dashboard
              </p>
            </div>

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
          </div>

          {/* Demo credentials — beside login, scrolls independently */}
          <div
            className="w-full md:flex-1 rounded-2xl flex flex-col min-h-0 overflow-hidden max-h-[280px] md:max-h-none"
            style={{
              background: "rgba(255,255,255,0.96)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
            }}
          >
            <div className="flex-shrink-0 px-5 pt-5 pb-3 border-b border-[#E2E8F0]">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94A3B8]">
                Demo Credentials
              </p>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                Click any row to autofill the login form
              </p>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3">
              {[
                { role: "Managing Partner", color: "#C9A227" },
                { role: "Partner",          color: "#2260b8" },
                { role: "Associate",        color: "#059669" },
                { role: "Paralegal",        color: "#D97706" },
                { role: "Admin",            color: "#7C3AED" },
                { role: "HR Officer",       color: "#0891b2" },
              ].map(({ role, color }) => {
                const users = DUMMY_USERS.filter((u) => u.role === role);
                if (!users.length) return null;
                return (
                  <div key={role} className="mb-3 last:mb-0">
                    <div className="flex items-center gap-1.5 px-2 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color }}>{role}</span>
                    </div>
                    {users.map((u) => (
                      <button
                        key={u.email}
                        type="button"
                        onClick={() => { setEmail(u.email); setPassword(u.password); setError(""); }}
                        className="w-full text-left rounded-lg px-3 py-2.5 hover:bg-[#F5F7FA] transition-colors"
                      >
                        <p className="text-[13px] font-medium text-[#1e293b]">{u.name}</p>
                        <p className="text-[11px] text-[#94A3B8] font-mono mt-0.5 truncate">{u.email}</p>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] mt-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.4)" }}>
          © 2026 S.K. Boafo & Company. All rights reserved.
        </p>
      </div>
    </div>
  );
}
