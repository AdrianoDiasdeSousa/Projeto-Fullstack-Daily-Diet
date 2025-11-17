import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

// helpers p/ converter ISO ⇄ datetime-local (sem bugs de fuso)
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
  const d = new Date(local); // interpreta como horário local
  return d.toISOString();
}

export default function MealNew() {
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dateLocal, setDateLocal] = useState(
    isoToLocalInput(new Date().toISOString())
  );
  const [inDiet, setInDiet] = useState(true);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    if (!name.trim() || !dateLocal) {
      setErr("Preencha nome e data/hora.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        dateTime: localInputToIso(dateLocal),
        inDiet,
      };

      // se sua API retorna a refeição criada com id, você pode redirecionar para /meals/:id
      const { data } = await api.post("/meals", payload);

      // tenta ir para o detalhe se veio id; senão volta ao dashboard
      if (data?.id) nav(`/meals/${data.id}`, { replace: true });
      else nav("/", { replace: true });
    } catch {
      setSaving(false);
      setErr("Falha ao salvar. Tente novamente.");
    }
  }

  return (
    <PageWrap>
      <div className="flex items-center justify-between max-w-2xl mx-auto mb-4">
        <Link to="/" className="text-slate-600 hover:text-slate-900 underline">
          ← Voltar
        </Link>
      </div>

      <Card>
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Nova refeição</h1>

        {err && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 px-3 py-2">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {/* nome */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
              placeholder="Ex.: Salada de frango"
              autoFocus
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
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 font-semibold transition border bg-white text-slate-900 border-slate-300 hover:bg-slate-50"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </Card>
    </PageWrap>
  );
}

/* ===== util components para manter o mesmo padrão ===== */

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
