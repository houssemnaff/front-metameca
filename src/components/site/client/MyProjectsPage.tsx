// src/components/site/client/MyProjectsPage.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";

type Project = {
  id: string;
  name: string;
  status: "in_progress" | "delivered" | "on_hold";
  startDate: string;
  description: string;
};

const STATUS_LABEL: Record<Project["status"], string> = {
  in_progress: "En cours",
  delivered:   "Livré",
  on_hold:     "En pause",
};

const STATUS_COLOR: Record<Project["status"], string> = {
  in_progress: "bg-blue-100 text-blue-700",
  delivered:   "bg-emerald-100 text-emerald-700",
  on_hold:     "bg-amber-100 text-amber-700",
};

export default function MyProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("mm_token");
    const base = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
    fetch(`${base}/projects?clientId=${user.id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data) => setProjects(data as Project[]))
      .catch(() => setError("Impossible de charger vos projets."))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="min-h-screen bg-[#f9f9f9] pt-28 pb-20 px-6 md:px-10 lg:px-16">
      <div className="max-w-3xl mx-auto">

        <div className="mb-10">
          <p className="text-[11px] tracking-[0.22em] uppercase text-[#999] mb-2">
            Espace client
          </p>
          <h1 className="text-3xl font-light text-[#1a1a1a] tracking-tight">
            Mes projets
          </h1>
          {user && (
            <p className="mt-1 text-sm text-[#aaa]">{user.name} · {user.email}</p>
          )}
        </div>

        {loading && (
          <div className="flex items-center gap-3 text-[#999] text-sm py-12">
            <span className="w-4 h-4 rounded-full border-2 border-[#ccc] border-t-[#1a1a1a] animate-spin" />
            Chargement…
          </div>
        )}

        {!loading && error && (
          <div className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="text-center py-20 text-[#bbb]">
            <p className="text-4xl mb-4">🔧</p>
            <p className="text-sm tracking-wide">Aucun projet pour le moment.</p>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <ul className="flex flex-col gap-4">
            {projects.map((p) => (
              <li
                key={p.id}
                className="bg-white border border-[#ebebeb] rounded-xl px-6 py-5
                           flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3
                           hover:shadow-sm transition-shadow"
              >
                <div>
                  <p className="text-[#1a1a1a] font-medium">{p.name}</p>
                  <p className="text-xs text-[#aaa] mt-0.5">{p.description}</p>
                  <p className="text-xs text-[#bbb] mt-1">Démarré le {p.startDate}</p>
                </div>
                <span
                  className={`self-start sm:self-center text-[11px] font-semibold
                              tracking-[0.12em] uppercase px-3 py-1.5 rounded-full
                              ${STATUS_COLOR[p.status]}`}
                >
                  {STATUS_LABEL[p.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}