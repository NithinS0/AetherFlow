import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useStore } from "../stores/store";
import { AuthInput } from "../components/AuthInput";
import { BrandLogo } from "../components/BrandLogo";
import { CloudLightning, Lock, Mail, UserPlus, LogIn, KeyRound, ShieldCheck, Server, Check } from "lucide-react";
import { toast } from "sonner";

export function Login() {
  const navigate = useNavigate();
  const [formMode, setFormMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const setAuthenticated = useStore((state) => state.setAuthenticated);
  const setUser = useStore((state) => state.setUser);
  const fetchOrgs = useStore((state) => state.fetchOrgs);

  const completeAuth = async (accessToken: string) => {
    localStorage.setItem("aetherflow_token", accessToken);
    const me = await api.getMe();
    setUser(me);
    setAuthenticated(true);
    navigate("/dashboard", { replace: true });
    void fetchOrgs();
    toast.success(`Welcome back, ${me.full_name || me.email}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (formMode === "signup") {
        await api.register({ email, password, full_name: fullName });
        toast.success("Account registered. Authenticating...");
        const loginRes = await api.login(email, password);
        await completeAuth(loginRes.access_token);
      } else if (formMode === "login") {
        const loginRes = await api.login(email, password);
        if (rememberMe) {
          localStorage.setItem("aetherflow_remember", "true");
        } else {
          localStorage.removeItem("aetherflow_remember");
        }
        await completeAuth(loginRes.access_token);
      } else {
        await api.forgotPassword(email);
        toast.success("Password reset instructions dispatched via email.");
        setFormMode("login");
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen flex flex-col md:flex-row bg-background overflow-hidden">
      
      {/* Dynamic Ambient Background Mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      {/* LEFT SIDE: Branding Showcase & Telemetry Stats */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-center p-12 relative z-10 border-r border-white/5 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex w-full items-center justify-center">
          <BrandLogo variant="full" className="h-24 lg:h-28 w-auto object-contain" />
        </div>

        <div className="my-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Distributed Job <br />
              Scheduling Platform
            </h1>
            <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
              Log in to manage queues, jobs, workers, retries, and dead-letter recovery powered by Postgres SKIP LOCKED scheduling primitives.
            </p>
          </div>

          <div className="glass-panel border border-white/10 p-5 rounded-2xl bg-zinc-950/80 font-mono text-[11px] text-zinc-400 space-y-2 max-w-lg shadow-card-glow">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">AF_TELEMETRY_SHELL</span>
            </div>
            <div className="flex gap-2 text-zinc-500">
              <span>$</span>
              <span className="text-zinc-300">aetherflow cluster status --nodes</span>
            </div>
            <div className="text-emerald-400 flex items-center gap-2">
              <Server size={10} />
              <span>AF_NODE_01 (10.0.4.15) ➔ ONLINE (CPU: 14.5% | MEM: 41%)</span>
            </div>
            <div className="text-emerald-400 flex items-center gap-2">
              <Server size={10} />
              <span>AF_NODE_02 (10.0.4.16) ➔ ONLINE (CPU: 18.2% | MEM: 38%)</span>
            </div>
            <div className="text-zinc-500 flex gap-2">
              <span>$</span>
              <span className="text-zinc-300">aetherflow queues verify --skip-locked</span>
            </div>
            <div className="text-indigo-400">➔ Claim validation: ATOMIC. 0 lock contention detected.</div>
          </div>
        </div>

      </div>

      {/* RIGHT SIDE: Authentication Card Layout */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="absolute top-1/4 right-1/4 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[110px] pointer-events-none" />

        <div className="w-full max-w-md p-8 rounded-3xl glass-panel border border-white/10 shadow-card-glow relative overflow-hidden">
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          
          <div className="flex flex-col items-center mb-8 text-center relative z-10">
            <BrandLogo variant="icon" className="md:hidden w-20 h-20 object-contain mb-4" />
            <h2 className="text-2xl font-black tracking-tight text-primary">
              {formMode === "signup" ? "Platform Registration" :
               formMode === "login" ? "Scheduler Control Plane" :
               "Password Recovery"}
            </h2>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mt-2">
              {formMode === "login" ? "Enter your platform credentials" : "Set up your platform profile"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono flex items-start gap-2 shadow-[inset_0_0_20px_rgba(244,63,94,0.05)]">
               <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
               <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs font-sans relative z-10">
            {formMode === "signup" && (
              <AuthInput
                label="Full Name"
                type="text"
                required
                placeholder="e.g. Administrator"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                icon={<UserPlus className="w-5 h-5" />}
              />
            )}

            <AuthInput
              label="Email Address"
              type="email"
              required
              placeholder="operator@aetherflow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-5 h-5" />}
            />

            {formMode !== "forgot" && (
              <AuthInput
                label="Password"
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-5 h-5" />}
              />
            )}

            {formMode === "login" && (
              <div className="flex items-center justify-between py-1 text-[11px] px-1">
                <label className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors select-none cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer appearance-none w-4 h-4 border border-white/20 rounded bg-zinc-900/50 checked:bg-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
                    />
                    <Check className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                  </div>
                  Remember Me
                </label>
                <button
                  type="button"
                  onClick={() => setFormMode("forgot")}
                  className="text-zinc-500 hover:text-primary transition-colors cursor-pointer font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] cursor-pointer disabled:opacity-50 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : formMode === "login" ? (
                <>
                  <LogIn className="w-4.5 h-4.5" /> Open Scheduler Console
                </>
              ) : formMode === "signup" ? (
                <>
                  <UserPlus className="w-4.5 h-4.5" /> Register New Account
                </>
              ) : (
                <>
                  <KeyRound className="w-4.5 h-4.5" /> Dispatch Recovery Instructions
                </>
              )}
            </button>
          </form>

          {formMode === "login" && (
            <div className="mt-8 pt-6 border-t border-white/5 space-y-3 relative z-10">
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 justify-center">
                <CloudLightning className="w-3.5 h-3.5 text-primary" />
                <span>Quick-Access Demo Accounts</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("admin@aetherflow.com");
                    setPassword("enterprise2026");
                  }}
                  className="px-3 py-2.5 bg-white/[0.02] hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/30 text-indigo-300 hover:text-indigo-200 rounded-xl text-left transition-all duration-300 flex items-center justify-between group"
                >
                  Administrator
                  <Check className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setEmail("operator@aetherflow.com");
                    setPassword("enterprise2026");
                  }}
                  className="px-3 py-2.5 bg-white/[0.02] hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30 text-emerald-400 hover:text-emerald-300 rounded-xl text-left transition-all duration-300 flex items-center justify-between group"
                >
                  Operator
                  <Check className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setEmail("viewer@aetherflow.com");
                    setPassword("enterprise2026");
                  }}
                  className="px-3 py-2.5 bg-white/[0.02] hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/30 text-amber-400 hover:text-amber-300 rounded-xl text-left transition-all duration-300 flex items-center justify-between group"
                >
                  Viewer
                  <Check className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setEmail("admin@aetherflow.io");
                    setPassword("enterprise2026");
                  }}
                  className="px-3 py-2.5 bg-white/[0.02] hover:bg-zinc-100/10 border border-white/5 hover:border-zinc-400/30 text-zinc-400 hover:text-zinc-200 rounded-xl text-left transition-all duration-300 flex items-center justify-between group"
                >
                  Legacy Admin
                  <Check className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center text-[11px] space-x-3 relative z-10">
            {formMode === "login" ? (
              <button
                type="button"
                onClick={() => setFormMode("signup")}
                className="text-zinc-500 hover:text-primary transition-colors font-medium"
              >
                Need an account? Register
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setFormMode("login")}
                className="text-zinc-500 hover:text-primary transition-colors font-medium"
              >
                Return to Login Screen
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
