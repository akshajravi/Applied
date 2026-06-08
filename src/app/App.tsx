import { useState } from "react";
import {
  Plus,
  X,
  Briefcase,
  MapPin,
  Search,
  Zap,
  CheckCircle2,
  Trophy,
  Calendar,
} from "lucide-react";

type Status = "wishlist" | "applied" | "phone_screen" | "interview" | "offer" | "rejected";
type WorkType = "Remote" | "Hybrid" | "On-site";
type Priority = "high" | "medium" | "low";

interface Application {
  id: string;
  company: string;
  role: string;
  location: string;
  salary?: string;
  dateAdded: string;
  tags: WorkType[];
  status: Status;
  priority?: Priority;
}

const COLUMNS: {
  id: Status;
  label: string;
  accent: string;
  glow: string;
  dim: string;
}[] = [
  { id: "wishlist",     label: "Wishlist",      accent: "#818cf8", glow: "rgba(129,140,248,0.25)", dim: "rgba(129,140,248,0.1)"  },
  { id: "applied",      label: "Applied",       accent: "#fbbf24", glow: "rgba(251,191,36,0.25)",  dim: "rgba(251,191,36,0.1)"   },
  { id: "phone_screen", label: "Phone Screen",  accent: "#c084fc", glow: "rgba(192,132,252,0.25)", dim: "rgba(192,132,252,0.1)"  },
  { id: "interview",    label: "Interview",     accent: "#38bdf8", glow: "rgba(56,189,248,0.25)",  dim: "rgba(56,189,248,0.1)"   },
  { id: "offer",        label: "Offer",         accent: "#4ade80", glow: "rgba(74,222,128,0.25)",  dim: "rgba(74,222,128,0.1)"   },
  { id: "rejected",     label: "Rejected",      accent: "#64748b", glow: "rgba(100,116,139,0.2)",  dim: "rgba(100,116,139,0.07)" },
];

const WORK_TYPE_STYLES: Record<WorkType, { bg: string; color: string }> = {
  "Remote":   { bg: "rgba(74,222,128,0.12)",  color: "#4ade80" },
  "Hybrid":   { bg: "rgba(56,189,248,0.12)",  color: "#38bdf8" },
  "On-site":  { bg: "rgba(251,191,36,0.12)",  color: "#fbbf24" },
};

const AVATAR_PALETTE = [
  "#6366f1","#f59e0b","#ec4899","#14b8a6",
  "#f97316","#8b5cf6","#06b6d4","#84cc16",
  "#ef4444","#0ea5e9","#a855f7","#d97706",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (name.charCodeAt(i) + ((hash << 5) - hash)) | 0;
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const SEED: Application[] = [
  { id: "1",  company: "Stripe",    role: "Software Engineering Intern",  location: "San Francisco, CA", salary: "$60/hr", dateAdded: "2026-04-28", tags: ["Remote"],   status: "applied",      priority: "high"   },
  { id: "2",  company: "Figma",     role: "Product Design Intern",        location: "New York, NY",      salary: "$55/hr", dateAdded: "2026-05-01", tags: ["On-site"],  status: "interview",    priority: "high"   },
  { id: "3",  company: "Linear",    role: "Frontend Engineering Intern",  location: "Remote",            salary: "$50/hr", dateAdded: "2026-04-15", tags: ["Remote"],   status: "offer",        priority: "high"   },
  { id: "4",  company: "Notion",    role: "Product Management Intern",    location: "San Francisco, CA", dateAdded: "2026-05-05",                    tags: ["Hybrid"],   status: "wishlist",     priority: "medium" },
  { id: "5",  company: "Vercel",    role: "Developer Relations Intern",   location: "Remote",            salary: "$45/hr", dateAdded: "2026-04-20", tags: ["Remote"],   status: "applied",      priority: "medium" },
  { id: "6",  company: "Airbnb",    role: "Data Science Intern",          location: "San Francisco, CA", salary: "$58/hr", dateAdded: "2026-04-10", tags: ["Hybrid"],   status: "rejected"                         },
  { id: "7",  company: "Arc",       role: "Growth Intern",                location: "New York, NY",      salary: "$48/hr", dateAdded: "2026-05-08", tags: ["On-site"],  status: "phone_screen", priority: "high"   },
  { id: "8",  company: "GitHub",    role: "Backend Engineering Intern",   location: "Remote",            salary: "$52/hr", dateAdded: "2026-04-25", tags: ["Remote"],   status: "wishlist",     priority: "medium" },
  { id: "9",  company: "Dropbox",   role: "Design Intern",                location: "San Francisco, CA", salary: "$50/hr", dateAdded: "2026-04-30", tags: ["Hybrid"],   status: "applied"                          },
  { id: "10", company: "Loom",      role: "iOS Engineering Intern",       location: "San Francisco, CA",               dateAdded: "2026-05-10",   tags: ["On-site"],  status: "phone_screen"                     },
  { id: "11", company: "Retool",    role: "Software Engineering Intern",  location: "San Francisco, CA", salary: "$55/hr", dateAdded: "2026-05-12", tags: ["Hybrid"],   status: "wishlist",     priority: "medium" },
  { id: "12", company: "Planetscale", role: "Database Engineering Intern", location: "Remote",           salary: "$47/hr", dateAdded: "2026-05-02", tags: ["Remote"],   status: "applied"                          },
];

const EMPTY_FORM = {
  company: "",
  role: "",
  location: "",
  salary: "",
  tags: ["Remote"] as WorkType[],
  status: "wishlist" as Status,
};

export default function App() {
  const [apps, setApps] = useState<Application[]>(SEED);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropCol, setDropCol] = useState<Status | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDefault, setModalDefault] = useState<Status>("wishlist");
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");

  const totalApplied   = apps.filter((a) => a.status !== "wishlist").length;
  const activeCount    = apps.filter((a) => a.status === "interview" || a.status === "phone_screen").length;
  const offerCount     = apps.filter((a) => a.status === "offer").length;

  const filtered = apps.filter(
    (a) =>
      search === "" ||
      a.company.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase())
  );

  function openModal(defaultStatus: Status) {
    setModalDefault(defaultStatus);
    setForm({ ...EMPTY_FORM, status: defaultStatus });
    setModalOpen(true);
  }

  function submitForm() {
    if (!form.company.trim() || !form.role.trim()) return;
    setApps((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        company: form.company.trim(),
        role: form.role.trim(),
        location: form.location.trim(),
        salary: form.salary.trim() || undefined,
        dateAdded: new Date().toISOString().split("T")[0],
        tags: form.tags,
        status: form.status,
      },
    ]);
    setModalOpen(false);
    setForm(EMPTY_FORM);
  }

  function removeApp(id: string) {
    setApps((prev) => prev.filter((a) => a.id !== id));
  }

  function handleDragStart(id: string) {
    setDragId(id);
  }

  function handleDragEnd() {
    setDragId(null);
    setDropCol(null);
  }

  function handleDragOver(e: React.DragEvent, colId: Status) {
    e.preventDefault();
    setDropCol(colId);
  }

  function handleDrop(e: React.DragEvent, colId: Status) {
    e.preventDefault();
    if (dragId) {
      setApps((prev) => prev.map((a) => (a.id === dragId ? { ...a, status: colId } : a)));
    }
    setDragId(null);
    setDropCol(null);
  }

  function toggleWorkType(tag: WorkType) {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag)
        ? f.tags.filter((t) => t !== tag)
        : [...f.tags, tag],
    }));
  }

  return (
    <div
      className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-6 py-3.5 border-b border-border"
        style={{ backgroundColor: "rgba(14,14,20,0.95)", backdropFilter: "blur(12px)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#b4ff57" }}
          >
            <Briefcase size={13} color="#08080c" strokeWidth={2.5} />
          </div>
          <span
            className="text-sm font-semibold tracking-widest text-foreground/90"
            style={{ fontFamily: "'DM Mono', monospace", letterSpacing: "0.14em" }}
          >
            INTERNTRACK
          </span>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-5">
          <StatPill icon={<Zap size={12} />} label="Applied" value={totalApplied} color="#fbbf24" />
          <StatPill icon={<CheckCircle2 size={12} />} label="Interviewing" value={activeCount} color="#38bdf8" />
          <StatPill icon={<Trophy size={12} />} label="Offers" value={offerCount} color="#4ade80" />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-muted border border-border rounded-lg pl-8 pr-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all w-44"
              style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px" }}
            />
          </div>
          <button
            onClick={() => openModal("wishlist")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "#b4ff57", color: "#08080c" }}
          >
            <Plus size={14} strokeWidth={2.5} />
            Add Application
          </button>
        </div>
      </header>

      {/* ── Board ──────────────────────────────────────── */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-3 h-full p-5" style={{ minWidth: "max-content", alignItems: "stretch" }}>
          {COLUMNS.map((col) => {
            const colApps = filtered.filter((a) => a.status === col.id);
            const isTarget = dropCol === col.id;

            return (
              <div
                key={col.id}
                className="flex flex-col w-64 flex-shrink-0"
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                {/* Column header */}
                <div className="flex items-center justify-between mb-2.5 px-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: col.accent }}
                    />
                    <span className="text-xs font-semibold tracking-wide uppercase text-foreground/80"
                      style={{ fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}
                    >
                      {col.label}
                    </span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: col.dim,
                        color: col.accent,
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "10px",
                        lineHeight: "1",
                        paddingTop: "3px",
                        paddingBottom: "3px",
                      }}
                    >
                      {colApps.length}
                    </span>
                  </div>
                  <button
                    onClick={() => openModal(col.id)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors hover:bg-white/5"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Cards drop zone */}
                <div
                  className="flex-1 flex flex-col gap-2 rounded-xl p-2 transition-all duration-150 overflow-y-auto"
                  style={{
                    backgroundColor: isTarget ? col.dim : "rgba(255,255,255,0.02)",
                    boxShadow: isTarget ? `0 0 0 1.5px ${col.accent}` : "none",
                    maxHeight: "calc(100vh - 130px)",
                    scrollbarWidth: "none",
                  }}
                >
                  {colApps.map((app) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      colAccent={col.accent}
                      isDragging={dragId === app.id}
                      onDragStart={() => handleDragStart(app.id)}
                      onDragEnd={handleDragEnd}
                      onRemove={() => removeApp(app.id)}
                    />
                  ))}

                  {colApps.length === 0 && !isTarget && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-1 py-8 opacity-30">
                      <span className="text-xs text-muted-foreground">Empty</span>
                    </div>
                  )}

                  {isTarget && colApps.length === 0 && (
                    <div className="flex-1 flex items-center justify-center py-8">
                      <span className="text-xs" style={{ color: col.accent }}>
                        Drop here
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Add Application Modal ──────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl"
            style={{ backgroundColor: "#111118" }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-foreground">New Application</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Track a new internship opportunity</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
              >
                <X size={15} />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Company *">
                  <input
                    autoFocus
                    placeholder="e.g. Stripe"
                    value={form.company}
                    onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </Field>
                <Field label="Role *">
                  <input
                    placeholder="e.g. SWE Intern"
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Location">
                  <div className="relative">
                    <MapPin size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      placeholder="SF or Remote"
                      value={form.location}
                      onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                      className="w-full bg-muted border border-border rounded-lg pl-8 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </Field>
                <Field label="Salary">
                  <input
                    placeholder="$50/hr"
                    value={form.salary}
                    onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px" }}
                  />
                </Field>
              </div>

              <Field label="Stage">
                <div className="grid grid-cols-3 gap-1.5">
                  {COLUMNS.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => setForm((f) => ({ ...f, status: col.id }))}
                      className="py-1.5 px-2 rounded-lg text-xs font-medium transition-all border"
                      style={
                        form.status === col.id
                          ? { backgroundColor: col.dim, borderColor: col.accent, color: col.accent }
                          : { backgroundColor: "transparent", borderColor: "rgba(255,255,255,0.07)", color: "#6b6b82" }
                      }
                    >
                      {col.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Work Type">
                <div className="flex gap-2">
                  {(["Remote", "Hybrid", "On-site"] as WorkType[]).map((tag) => {
                    const active = form.tags.includes(tag);
                    const style = WORK_TYPE_STYLES[tag];
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleWorkType(tag)}
                        className="flex-1 py-2 rounded-lg text-xs font-medium transition-all border"
                        style={
                          active
                            ? { backgroundColor: style.bg, borderColor: style.color + "50", color: style.color }
                            : { backgroundColor: "transparent", borderColor: "rgba(255,255,255,0.07)", color: "#6b6b82" }
                        }
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 rounded-lg text-sm text-muted-foreground border border-border hover:border-white/15 hover:text-foreground transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitForm}
                disabled={!form.company.trim() || !form.role.trim()}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.99]"
                style={{ backgroundColor: "#b4ff57", color: "#08080c" }}
              >
                Add Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ─────────────────────────────── */

function StatPill({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-6 h-6 rounded-md flex items-center justify-center"
        style={{ backgroundColor: color + "18", color }}
      >
        {icon}
      </div>
      <div>
        <div
          className="text-sm font-semibold leading-none"
          style={{ color, fontFamily: "'DM Mono', monospace" }}
        >
          {value}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 leading-none">{label}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1.5 font-medium">{label}</label>
      {children}
    </div>
  );
}

function AppCard({
  app,
  colAccent,
  isDragging,
  onDragStart,
  onDragEnd,
  onRemove,
}: {
  app: Application;
  colAccent: string;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onRemove: () => void;
}) {
  const initials = getInitials(app.company);
  const avatarColor = getAvatarColor(app.company);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="group relative rounded-xl p-3 border border-border cursor-grab active:cursor-grabbing transition-all duration-150 select-none"
      style={{
        backgroundColor: "#1a1a24",
        opacity: isDragging ? 0.35 : 1,
        borderLeftColor: colAccent,
        borderLeftWidth: "2px",
        transform: isDragging ? "scale(1.02)" : "scale(1)",
      }}
      onMouseEnter={(e) => {
        if (!isDragging) {
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.14)";
          (e.currentTarget as HTMLDivElement).style.borderLeftColor = colAccent;
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
        (e.currentTarget as HTMLDivElement).style.borderLeftColor = colAccent;
      }}
    >
      {/* Remove */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute top-2.5 right-2.5 p-0.5 rounded text-muted-foreground hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
      >
        <X size={11} />
      </button>

      {/* Company + avatar */}
      <div className="flex items-center gap-2.5 pr-4">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0"
          style={{ backgroundColor: avatarColor, fontSize: "10px", fontWeight: 700 }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-foreground truncate">{app.company}</div>
          <div
            className="text-muted-foreground truncate mt-0.5"
            style={{ fontSize: "11px", lineHeight: "1.3" }}
          >
            {app.role}
          </div>
        </div>
      </div>

      {/* Location */}
      {app.location && (
        <div className="flex items-center gap-1 mt-2.5">
          <MapPin size={9} className="text-muted-foreground flex-shrink-0" />
          <span
            className="text-muted-foreground truncate"
            style={{ fontSize: "10px", fontFamily: "'DM Mono', monospace" }}
          >
            {app.location}
          </span>
        </div>
      )}

      {/* Tags + date */}
      <div className="flex items-center justify-between mt-2 gap-1">
        <div className="flex items-center gap-1 flex-wrap">
          {app.tags.map((tag) => (
            <span
              key={tag}
              className="px-1.5 rounded"
              style={{
                backgroundColor: WORK_TYPE_STYLES[tag]?.bg || "rgba(255,255,255,0.07)",
                color: WORK_TYPE_STYLES[tag]?.color || "#fff",
                fontSize: "9px",
                fontFamily: "'DM Mono', monospace",
                paddingTop: "2px",
                paddingBottom: "2px",
              }}
            >
              {tag}
            </span>
          ))}
          {app.salary && (
            <span
              className="px-1.5 rounded"
              style={{
                backgroundColor: "rgba(74,222,128,0.1)",
                color: "#4ade80",
                fontSize: "9px",
                fontFamily: "'DM Mono', monospace",
                paddingTop: "2px",
                paddingBottom: "2px",
              }}
            >
              {app.salary}
            </span>
          )}
        </div>
        <span
          className="flex items-center gap-1 flex-shrink-0 px-1.5 rounded"
          style={{
            backgroundColor: "rgba(255,255,255,0.07)",
            color: "#d4d4e4",
            fontSize: "10px",
            fontFamily: "'DM Mono', monospace",
            paddingTop: "3px",
            paddingBottom: "3px",
          }}
        >
          <Calendar size={9} style={{ opacity: 0.7 }} />
          {formatDate(app.dateAdded)}
        </span>
      </div>
    </div>
  );
}
