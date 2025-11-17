import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

/* ---------- Tipos ---------- */
type Meal = {
  id: string;
  name: string;
  description?: string | null;
  dateTime: string; // ISO
  inDiet: boolean;
};
type Metrics = {
  total: number;
  inside: number;
  outside: number;
  streak: number;
};
type DietFilter = "all" | "inside" | "outside";
type PeriodFilter = "all" | "today" | "last7";

/* ---------- Ícones inline (SVG puros) ---------- */
const EyeIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
    />
    <circle cx="12" cy="12" r="3" strokeWidth="1.8" />
  </svg>
);
const PencilIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 3.487a2.1 2.1 0 0 1 2.971 2.971L8.25 18.04 4 19l.96-4.25L16.862 3.487Z"
    />
  </svg>
);
const SearchIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <circle cx="11" cy="11" r="7" strokeWidth="1.8" />
    <path d="M20 20l-3.2-3.2" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/* ---------- Página ---------- */
export default function Dashboard() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const [meals, setMeals] = useState<Meal[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // filtros
  const [q, setQ] = useState("");
  const [diet, setDiet] = useState<DietFilter>("all");
  const [period, setPeriod] = useState<PeriodFilter>("all");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const [mealsRes, metricsRes] = await Promise.all([
          api.get<Meal[]>("/meals"),
          api.get<Metrics>("/metrics"),
        ]);
        if (!alive) return;
        setMeals(mealsRes.data);
        setMetrics(metricsRes.data);
      } catch {
        setErr("Não foi possível carregar seus dados. Tente novamente.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // helpers de data
  const isToday = (iso: string) => {
    const d = new Date(iso),
      n = new Date();
    return (
      d.getFullYear() === n.getFullYear() &&
      d.getMonth() === n.getMonth() &&
      d.getDate() === n.getDate()
    );
  };
  const isLast7 = (iso: string) =>
    new Date(iso).getTime() >= Date.now() - 7 * 24 * 60 * 60 * 1000;
  const fmtDay = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });

  // aplica filtros + ordena
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return [...meals]
      .filter((m) =>
        diet === "all" ? true : diet === "inside" ? m.inDiet : !m.inDiet
      )
      .filter((m) =>
        period === "all"
          ? true
          : period === "today"
          ? isToday(m.dateTime)
          : isLast7(m.dateTime)
      )
      .filter((m) => (query ? m.name.toLowerCase().includes(query) : true))
      .sort((a, b) => +new Date(b.dateTime) - +new Date(a.dateTime));
  }, [meals, q, diet, period]);

  // agrupa por dia
  const grouped = useMemo(() => {
    const map = new Map<string, Meal[]>();
    for (const m of filtered) {
      const key = fmtDay(m.dateTime);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return Array.from(map.entries());
  }, [filtered]);

  async function handleLogout() {
    await logout();
    nav("/login", { replace: true });
  }
  const initials = (name?: string) =>
    (name ?? "")
      .split(" ")
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase())
      .join("") || "U";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* TOP BAR */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl grid place-items-center bg-slate-900 text-white">
              🥗
            </div>
            <span className="font-bold text-lg">Daily Diet</span>
          </Link>
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                <div className="h-7 w-7 rounded-full bg-slate-900 text-white grid place-items-center text-xs">
                  {initials(user.name)}
                </div>
                <div className="text-sm leading-tight">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-slate-500">{user.email}</div>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 hover:bg-slate-50 text-slate-700 shadow-sm"
              title="Sair da conta"
            >
              ⎋ Sair
            </button>
          </div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* topo */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Minhas Refeições
          </h1>
          <Link
            to="/meals/new"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 hover:bg-slate-50 shadow-sm"
          >
            <span className="text-lg">＋</span> <span>Nova refeição</span>
          </Link>
        </div>

        {/* cards de métricas */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total"
            value={metrics?.total ?? (loading ? "…" : 0)}
            hint="Refeições cadastradas"
          />
          <StatCard
            title="Dentro da dieta"
            value={metrics?.inside ?? (loading ? "…" : 0)}
            hint="Marcadas como ✅"
            color="emerald"
          />
          <StatCard
            title="Fora da dieta"
            value={metrics?.outside ?? (loading ? "…" : 0)}
            hint="Marcadas como ❌"
            color="rose"
          />
          <StatCard
            title="Melhor sequência"
            value={metrics?.streak ?? (loading ? "…" : 0)}
            hint="Dias seguidos ✅"
            color="indigo"
          />
        </section>

        {/* filtros */}
        <section className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-6">
          <div className="relative w-full sm:max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome…"
              className="w-full rounded-2xl border border-slate-200 bg-white/70 pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent shadow-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Selector
              value={diet}
              onChange={(v) => setDiet(v as DietFilter)}
              options={[
                { value: "all", label: "Todas" },
                { value: "inside", label: "Dentro ✅" },
                { value: "outside", label: "Fora ❌" },
              ]}
            />
            <Selector
              value={period}
              onChange={(v) => setPeriod(v as PeriodFilter)}
              options={[
                { value: "all", label: "Período: Todos" },
                { value: "today", label: "Hoje" },
                { value: "last7", label: "Últimos 7 dias" },
              ]}
            />
            <Link
              to="/metrics"
              className="ml-auto inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 hover:bg-slate-50 shadow-sm"
            >
              📈 Ver métricas
            </Link>
          </div>
        </section>

        {/* lista */}
        {loading ? (
          <SkeletonList />
        ) : err ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 p-4">
            {err}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {grouped.map(([day, items]) => (
              <div key={day} className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-500">{day}</h3>
                <ul className="space-y-3">
                  {items.map((m) => (
                    <MealRow key={m.id} meal={m} fmtTime={fmtTime} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------- Linha elegante da refeição ---------- */
function MealRow({
  meal,
  fmtTime,
}: {
  meal: Meal;
  fmtTime: (iso: string) => string;
}) {
  return (
    <li className="group rounded-2xl border border-slate-200 bg-white/70 hover:bg-white transition-all shadow-sm hover:shadow-md ring-1 ring-transparent hover:ring-slate-200">
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium truncate">{meal.name}</div>
          <div className="text-sm text-slate-500">{fmtTime(meal.dateTime)}</div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={
              "inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1 " +
              (meal.inDiet
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200")
            }
          >
            {meal.inDiet ? "✅ Dentro" : "❌ Fora"}
          </span>

          {/* Ações: agora como botões de ícone com tooltip e animação */}
          <Link
            to={`/meals/${meal.id}`}
            className="opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition
                       inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white
                       hover:bg-slate-50 text-slate-700 shadow-sm"
            title="Ver detalhes"
          >
            <EyeIcon className="h-4 w-4" />
          </Link>

          <Link
            to={`/meals/${meal.id}/edit`}
            className="opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition delay-75
                       inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white
                       hover:bg-slate-50 text-slate-700 shadow-sm"
            title="Editar"
          >
            <PencilIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </li>
  );
}

/* ---------- UI helpers ---------- */
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

function Selector({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent shadow-sm"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-16 rounded-2xl border border-slate-200 bg-slate-100 animate-pulse"
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="text-5xl mb-2">🍽️</div>
      <h3 className="text-lg font-semibold">
        Você ainda não cadastrou refeições
      </h3>
      <p className="text-slate-600 mt-1">
        Clique em <span className="font-medium">“Nova refeição”</span> para
        começar.
      </p>
      <div className="mt-4">
        <Link
          to="/meals/new"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 hover:bg-slate-50 shadow-sm"
        >
          ➕ Nova refeição
        </Link>
      </div>
    </div>
  );
}
