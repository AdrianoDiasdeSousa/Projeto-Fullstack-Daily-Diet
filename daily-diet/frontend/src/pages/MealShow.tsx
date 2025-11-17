import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";

type Meal = {
  id: string;
  name: string;
  description?: string | null;
  dateTime: string; // ISO
  inDiet: boolean;
};

export default function MealShow() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const { data } = await api.get<Meal>(`/meals/${id}`);
        if (!alive) return;
        setMeal(data);
      } catch {
        setErr("Não foi possível carregar a refeição.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  async function handleDelete() {
    try {
      setDeleting(true);
      await api.delete(`/meals/${id}`);
      nav("/", { replace: true });
    } catch {
      setDeleting(false);
      alert("Falha ao apagar. Tente novamente.");
    }
  }

  if (loading)
    return (
      <PageWrap>
        <Skeleton />
      </PageWrap>
    );
  if (err)
    return (
      <PageWrap>
        <Card className="border-rose-200 bg-rose-50 text-rose-800">
          {err}
          <div className="mt-4">
            <Link to="/" className="btn-secondary">
              ← Voltar
            </Link>
          </div>
        </Card>
      </PageWrap>
    );
  if (!meal)
    return (
      <PageWrap>
        <Card>
          <h1 className="text-xl font-semibold">Refeição não encontrada</h1>
          <p className="text-slate-600 mt-1">Ela pode ter sido removida.</p>
          <div className="mt-4">
            <Link to="/" className="btn-secondary">
              ← Voltar
            </Link>
          </div>
        </Card>
      </PageWrap>
    );

  const date = new Date(meal.dateTime);
  const dayStr = date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <PageWrap>
      {/* Cabeçalho com ação voltar */}
      <div className="flex items-center justify-between max-w-2xl mx-auto mb-4">
        <Link to="/" className="text-slate-600 hover:text-slate-900 underline">
          ← Voltar
        </Link>
      </div>

      <Card>
        {/* título + badge */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">
            {meal.name}
          </h1>
          <span
            className={
              "inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-1 " +
              (meal.inDiet
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200")
            }
            title={meal.inDiet ? "Dentro da dieta" : "Fora da dieta"}
          >
            {meal.inDiet ? "✅ Dentro" : "❌ Fora"}
          </span>
        </div>

        {/* data/hora */}
        <div className="text-slate-600 mt-2">
          {dayStr}, {timeStr}
        </div>

        {/* descrição */}
        {meal.description && (
          <div className="mt-4 border-t border-slate-200 pt-4 text-slate-700">
            {meal.description}
          </div>
        )}

        {/* ações */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link to={`/meals/${meal.id}/edit`} className="btn-primary">
            ✏️ Editar
          </Link>
          <button onClick={() => setConfirmOpen(true)} className="btn-danger">
            {deleting ? "Apagando..." : "🗑️ Apagar"}
          </button>
          <Link to="/" className="btn-secondary">
            ← Voltar
          </Link>
        </div>
      </Card>

      {/* modal de confirmação */}
      {confirmOpen && (
        <Dialog onClose={() => setConfirmOpen(false)}>
          <h3 className="text-lg font-semibold">Apagar refeição?</h3>
          <p className="text-slate-600 mt-1">
            Esta ação não pode ser desfeita.
          </p>
          <div className="mt-5 flex items-center gap-2 justify-end">
            <button
              onClick={() => setConfirmOpen(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button onClick={handleDelete} className="btn-danger">
              {deleting ? "Apagando..." : "Apagar"}
            </button>
          </div>
        </Dialog>
      )}
    </PageWrap>
  );
}

/* ======== Componentes utilitários ======== */

function PageWrap({ children }: { children: React.ReactNode }) {
  return <div className="max-w-2xl mx-auto px-4 py-8">{children}</div>;
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

function Dialog({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-[92%] max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        {children}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="h-6 w-40 bg-slate-100 rounded mb-4 animate-pulse" />
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="h-8 w-64 bg-slate-100 rounded mb-3 animate-pulse" />
        <div className="h-4 w-40 bg-slate-100 rounded mb-6 animate-pulse" />
        <div className="h-20 w-full bg-slate-100 rounded mb-6 animate-pulse" />
        <div className="h-10 w-56 bg-slate-100 rounded animate-pulse" />
      </div>
    </div>
  );
}

/* ======== Classes utilitárias para botões (reutilize em outros arquivos se quiser) ======== */
declare global {
  // Apenas para o TS não reclamar se você quiser usar as classes em outros arquivos
  interface Window {}
}

const baseBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 font-semibold transition border";

const styles = {
  primary: `${baseBtn} bg-slate-900 text-white border-slate-900 hover:bg-slate-800`,
  secondary: `${baseBtn} bg-white text-slate-900 border-slate-300 hover:bg-slate-50`,
  danger: `${baseBtn} bg-rose-600 text-white border-rose-600 hover:bg-rose-500`,
};

// Atalhos via classes utilitárias + @apply (se preferir, copie p/ seu CSS global)
// Mas aqui exporto como classes prontas via tailwind util classes:
const styleEl = document.createElement("style");
styleEl.innerHTML = `
  .btn-primary { ${toCss(styles.primary)} }
  .btn-secondary { ${toCss(styles.secondary)} }
  .btn-danger { ${toCss(styles.danger)} }
`;
if (
  typeof document !== "undefined" &&
  !document.getElementById("mealshow-btn-styles")
) {
  styleEl.id = "mealshow-btn-styles";
  document.head.appendChild(styleEl);
}

function toCss(cls: string) {
  // converte classes tailwind para inline CSS básico: aqui usamos como "marcadores"
  // (não é necessário se você já tem as utilities do Tailwind no projeto).
  // Como estamos usando só Tailwind, você pode ignorar e remover este bloco,
  // e apenas usar as classes direto nas tags (já está feito nos botões acima).
  return ""; // Mantemos vazio para não conflitar; classes já estão nos elementos.
}
