import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

type Metrics = {
  total: number;
  inside: number;
  outside: number;
  streak: number; // melhor sequência dentro da dieta (dias)
};

export default function MetricsPage() {
  const [data, setData] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const { data } = await api.get<Metrics>("/metrics");
        if (!alive) return;
        setData(data);
      } catch {
        setErr("Não foi possível carregar as métricas.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const pctInside = useMemo(() => {
    if (!data || data.total === 0) return 0;
    return Math.round((data.inside / data.total) * 100);
  }, [data]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* back + title */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="text-slate-600 hover:text-slate-900 underline"
          >
            ← Voltar
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">Métricas</h1>
          <div className="w-[64px]" /> {/* spacer */}
        </div>

        {loading ? (
          <Skeleton />
        ) : err ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 p-4">
            {err}
          </div>
        ) : !data ? null : (
          <>
            {/* topo com cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Total"
                value={data.total}
                hint="Refeições cadastradas"
              />
              <StatCard
                title="Dentro da dieta"
                value={data.inside}
                color="emerald"
                hint="Marcadas como ✅"
              />
              <StatCard
                title="Fora da dieta"
                value={data.outside}
                color="rose"
                hint="Marcadas como ❌"
              />
              <StatCard
                title="Melhor sequência"
                value={data.streak}
                color="indigo"
                hint="Dias seguidos ✅"
              />
            </section>

            {/* anel de progresso + resumo */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h2 className="text-lg font-semibold mb-4">
                  Percentual dentro da dieta
                </h2>
                <div className="flex items-center gap-6">
                  <ProgressRing percent={pctInside} />

                  <div className="space-y-2 text-sm">
                    <Row
                      label="Dentro da dieta"
                      value={`${data.inside} (${pctInside}%)`}
                      color="emerald"
                    />
                    <Row
                      label="Fora da dieta"
                      value={`${data.outside} (${
                        data.total === 0 ? 0 : 100 - pctInside
                      }%)`}
                      color="rose"
                    />
                    <div className="h-px bg-slate-200 my-2" />
                    <Row label="Total" value={data.total} />
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="text-lg font-semibold mb-2">Insights rápidos</h2>
                {data.total === 0 ? (
                  <p className="text-slate-600">
                    Você ainda não cadastrou refeições. Comece agora mesmo!
                  </p>
                ) : (
                  <ul className="space-y-2 text-slate-700">
                    <li>
                      ✅ Você manteve uma sequência máxima de{" "}
                      <b>{data.streak}</b> dia(s) dentro da dieta.
                    </li>
                    <li>
                      📈 Sua taxa atual de adesão é <b>{pctInside}%</b>.
                    </li>
                    <li>
                      🧮 Para atingir <b>80%</b>, você precisa que as próximas
                      refeições fiquem dentro da dieta.
                    </li>
                  </ul>
                )}

                <div className="mt-4 flex items-center gap-2">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 hover:bg-slate-50 shadow-sm"
                  >
                    Ver refeições
                  </Link>
                  <Link
                    to="/meals/new"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 hover:bg-slate-50 shadow-sm"
                  >
                    ➕ Nova refeição
                  </Link>
                </div>
              </Card>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- componentes ---------- */

function StatCard({
  title,
  value,
  hint,
  color,
}: {
  title: string;
  value: number | string;
  hint?: string;
  color?: "emerald" | "rose" | "indigo";
}) {
  const palette: Record<string, string> = {
    emerald: "from-emerald-50/80 to-white border-emerald-200",
    rose: "from-rose-50/80 to-white border-rose-200",
    indigo: "from-indigo-50/80 to-white border-indigo-200",
    default: "from-slate-50/80 to-white border-slate-200",
  };
  const clazz = palette[color ?? "default"];
  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${clazz} border p-4 shadow-sm`}
    >
      <div className="text-sm text-slate-600">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  color,
}: {
  label: string;
  value: React.ReactNode;
  color?: "emerald" | "rose";
}) {
  const dot =
    color === "emerald"
      ? "bg-emerald-500"
      : color === "rose"
      ? "bg-rose-500"
      : "bg-slate-400";
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-slate-600">
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        {label}
      </div>
      <div className="font-medium text-slate-800">{value}</div>
    </div>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const pct = Math.max(0, Math.min(100, percent));
  return (
    <div className="relative h-40 w-40">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(#10b981 ${pct}%, #e5e7eb ${pct}% 100%)`,
        }}
      />
      <div className="absolute inset-2 rounded-full bg-white border border-slate-200" />
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-3xl font-bold">{pct}%</div>
        <div className="text-xs text-slate-500 -mt-1">dentro da dieta</div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-24 rounded-2xl border border-slate-200 bg-slate-100 animate-pulse"
        />
      ))}
      <div className="lg:col-span-2 h-64 rounded-2xl border border-slate-200 bg-slate-100 animate-pulse" />
      <div className="lg:col-span-2 h-64 rounded-2xl border border-slate-200 bg-slate-100 animate-pulse" />
    </div>
  );
}
