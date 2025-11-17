import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const schema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
});
type Form = z.infer<typeof schema>;

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const { login, loading } = useAuth();
  const nav = useNavigate();

  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(data: Form) {
    setErr("");
    const email = data.email.trim().toLowerCase();
    const ok = await login(email, data.password);
    if (ok) nav("/", { replace: true });
    else setErr("Credenciais inválidas. Verifique e tente novamente.");
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
            <h1 className="text-2xl font-bold">Entrar</h1>
            <p className="text-sm text-slate-600">
              Acesse sua conta para gerenciar suas refeições
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
            <label className="text-sm font-medium text-slate-700">E-mail</label>
            <input
              type="email"
              autoComplete="email"
              placeholder="seuemail@exemplo.com"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-600 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Senha</label>
            <div className="flex gap-2">
              <input
                type={show ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="inline-flex items-center justify-center px-3 rounded-xl border border-slate-300 hover:bg-slate-50 transition"
              >
                {show ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 text-sm">{errors.password.message}</p>
            )}
          </div>

          <button
            disabled={loading || isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold bg-slate-900 text-white hover:bg-slate-800 transition disabled:opacity-60"
          >
            {loading || isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-sm text-slate-600 text-center">
          Não tem conta?{" "}
          <Link to="/register" className="underline text-slate-900">
            Cadastrar
          </Link>
        </p>
      </div>

      <p className="text-sm text-slate-500 mt-6">
        © {new Date().getFullYear()} Daily Diet
      </p>
    </div>
  );
}
