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

// helpers p/ converter ISO ⇄ datetime-local (sem fuso bugado)
function isoToLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}
function localInputToIso(local: string) {
  // interpreta como horário local do usuário
  const d = new Date(local);
  return d.toISOString();
}

export default function MealEdit() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dateLocal, setDateLocal] = useState(""); // yyyy-MM-ddTHH:mm
  const [inDiet, setInDiet] = useState(false);

  const [saving, setSaving] = useState(false);
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
        setName(data.name);
        setDescription(data.description ?? "");
        setDateLocal(isoToLocalInput(data.dateTime));
        setInDiet(data.inDiet);
      } catch {
        setErr("Não foi possível carregar a refeição para edição.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !dateLocal) {
      alert("Preencha nome e data/hora.");
      return;
    }
    try {
      setSaving(true);
      await api.put(`/meals/${id}`, {
        name: name.trim(),
        description: description.trim() || null,
        dateTime: localInputToIso(dateLocal),
        inDiet,
      });
      nav(`/meals/${id}`, { replace: true });
    } catch {
      setSaving(false);
      alert("Falha ao salvar. Tente novamente.");
    }
  }

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
            <Link to={`/meals/${id}`} className="btn-secondary">
              ← Voltar
            </Link>
          </div>
        </Card>
      </PageWrap>
    );

  return (
    <PageWrap>
      <div className="flex items-center justify-between max-w-2xl mx-auto mb-4">
        <Link
          to={`/meals/${id}`}
          className="text-slate-600 hover:text-slate-900 underline"
        >
          ← Voltar
        </Link>
      </div>

      <Card>
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Editar refeição</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* nome */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              placeholder="Ex.: Salada de frango"
            />
          </div>

          {/* descrição */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              placeholder="Notas, porções, etc."
            />
          </div>

          {/* data/hora + status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Data e hora
              </label>
              <input
                type="datetime-local"
                value={dateLocal}
                onChange={(e) => setDateLocal(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">
                Status
              </label>
              <div className="h-[42px] inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3">
                <input
                  id="inDiet"
                  type="checkbox"
                  checked={inDiet}
                  onChange={(e) => setInDiet(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="inDiet" className="text-slate-800 select-none">
                  Dentro da dieta
                </label>
              </div>
            </div>
          </div>

          {/* ações */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 font-semibold transition border bg-slate-900 text-white border-slate-900 hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>

            <Link
              to={`/meals/${id}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 font-semibold transition border bg-white text-slate-900 border-slate-300 hover:bg-slate-50"
            >
              Cancelar
            </Link>

            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 font-semibold transition border bg-rose-600 text-white border-rose-600 hover:bg-rose-500"
            >
              Apagar
            </button>
          </div>
        </form>
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
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 font-semibold transition border bg-white text-slate-900 border-slate-300 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 font-semibold transition border bg-rose-600 text-white border-rose-600 hover:bg-rose-500 disabled:opacity-50"
              disabled={deleting}
            >
              {deleting ? "Apagando..." : "Apagar"}
            </button>
          </div>
        </Dialog>
      )}
    </PageWrap>
  );
}

/* ===== util components (mesmo padrão do show/dashboard) ===== */

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
      <div className="h-6 w-48 bg-slate-100 rounded mb-4 animate-pulse" />
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="h-8 w-64 bg-slate-100 rounded mb-3 animate-pulse" />
        <div className="h-20 w-full bg-slate-100 rounded mb-6 animate-pulse" />
        <div className="h-10 w-56 bg-slate-100 rounded animate-pulse" />
      </div>
    </div>
  );
}
