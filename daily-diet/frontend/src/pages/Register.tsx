import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";

const schema = z.object({
  name: z.string().min(2, "Digite seu nome"),
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
});
type Form = z.infer<typeof schema>;

// força de senha (bem simples, sem libs)
function scorePassword(pw: string) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

export default function Register() {
  const {
    register: reg,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const { register: doRegister, loading } = useAuth();
  const nav = useNavigate();

  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");

  const pw = watch("password") ?? "";
  const pwScore = useMemo(() => scorePassword(pw), [pw]);
  const pwColors = [
    "bg-slate-200",
    "bg-rose-400",
    "bg-amber-400",
    "bg-emerald-500",
    "bg-emerald-600",
  ];
  const pwLabels = ["", "fraca", "ok", "boa", "forte"];

  async function onSubmit(data: Form) {
    setErr("");
    const ok = await doRegister(
      data.name.trim(),
      data.email.trim().toLowerCase(),
      data.password
    );
    if (ok) nav("/", { replace: true });
    else
      setErr(
        "Não foi possível cadastrar. Tente outro e-mail ou tente novamente."
      );
  }

  return (
    <div className="min-h-screen grid place-items-center px-6 py-10 bg-gradient-to-b from-slate-50 to-white">
      <div className="w-full max-w-md bg-white/80 backdrop-blur border border-slate-200 shadow-xl rounded-2xl p-8 space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-900 text-white grid place-items-center text-lg">
            🥗
          </div>
          <div>
            <h1 className="text-2xl font-bold">Cadastrar</h1>
            <p className="text-sm text-slate-600">
              Crie sua conta para começar
            </p>
          </div>
        </div>

        {err && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-800 px-3 py-2">
            {err}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Nome</label>
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              placeholder="Seu nome"
              autoComplete="name"
              {...reg("name")}
            />
            {errors.name && (
              <p className="text-red-600 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">E-mail</label>
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              type="email"
              placeholder="seuemail@exemplo.com"
              autoComplete="email"
              {...reg("email")}
            />
            {errors.email && (
              <p className="text-red-600 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Senha</label>
            <div className="flex gap-2">
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                type={show ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                {...reg("password")}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="inline-flex items-center justify-center px-3 rounded-xl border border-slate-300 hover:bg-slate-50 transition"
              >
                {show ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {/* Barra de força */}
            {pw && (
              <div className="mt-1">
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${pwColors[pwScore]} transition-all`}
                    style={{ width: `${(pwScore / 4) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500">
                  Força: {pwLabels[pwScore] || "—"}
                </span>
              </div>
            )}
            {errors.password && (
              <p className="text-red-600 text-sm">{errors.password.message}</p>
            )}
          </div>

          <button
            disabled={loading || isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-60"
          >
            {loading || isSubmitting ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <p className="text-sm text-slate-600 text-center">
          Já tem conta?{" "}
          <Link to="/login" className="underline text-slate-900">
            Entrar
          </Link>
        </p>
      </div>

      <p className="text-sm text-slate-500 mt-6">
        © {new Date().getFullYear()} Daily Diet
      </p>
    </div>
  );
}
