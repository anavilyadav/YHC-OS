import { useState, useEffect, useCallback } from "react";
import { supabase } from "./src/lib/supabase";

// ─── Brand Tokens ────────────────────────────────────────────────────────────
const C = {
  cream: "#F5DEB3", navy: "#1A2A41", amber: "#D4A04A", green: "#5B8A2D",
  red: "#C0392B", white: "#FFFFFF", lightCream: "#FDF6E3",
  cardBg: "#FFFDF5", textMuted: "#6B5E4E", border: "#E8D5A3",
};

// ─── Types ───────────────────────────────────────────────────────────────────
type Screen =
  | "queue" | "register" | "search" | "tasks" | "payment" | "followup"
  | "leads" | "delivery" | "patient_profile" | "appointments"
  | "daily_summary" | "success";

type Patient = {
  id: string; token: string; name: string; complaint: string;
  branch: string; status: string; waitTime: string;
  age: number; gender: string; mobile: string; blood: string;
  address: string; visits: number; lastVisit: string; balance: number;
  visitId?: string; patientId?: string;
};

type Lead = {
  id: string; name: string; mobile: string; source: string;
  status: "HOT" | "Warm" | "Cold" | "Converted" | "Lost"; daysSince: number;
};
type Delivery = { id: string; patient: string; token: string; partner: string; step: number; area: string; note: string; };
type Appointment = { id: string; time: string; name: string; mobile: string; reason: string; branch: string; status: "Confirmed" | "Pending" | "Cancelled"; };

// ─── Dummy Data (Leads, Delivery, Appointments — Phase 4 mein connect honge) ─
const LEADS: Lead[] = [
  { id: "L001", name: "Arun Mehta", mobile: "98XXXX1111", source: "JustDial", status: "HOT", daysSince: 1 },
  { id: "L002", name: "Kavita Singh", mobile: "97XXXX2222", source: "Instagram", status: "Warm", daysSince: 3 },
  { id: "L003", name: "Deepak Joshi", mobile: "96XXXX3333", source: "Google", status: "HOT", daysSince: 0 },
  { id: "L004", name: "Ritu Agarwal", mobile: "95XXXX4444", source: "Referral", status: "Cold", daysSince: 8 },
];
const DELIVERIES: Delivery[] = [
  { id: "D001", patient: "Ramesh Sharma", token: "T-01", partner: "Swiggy", step: 2, area: "Bajaj Nagar", note: "" },
  { id: "D002", patient: "Mohan Lal", token: "T-05", partner: "Porter", step: 3, area: "Jagatpura", note: "" },
];
const APPOINTMENTS: Appointment[] = [
  { id: "A001", time: "10:00 AM", name: "Anita Sharma", mobile: "98XXXX1234", reason: "Thyroid follow-up", branch: "Bajaj Nagar", status: "Confirmed" },
  { id: "A002", time: "11:30 AM", name: "Vijay Kumar", mobile: "97XXXX5678", reason: "Skin rash", branch: "Jagatpura", status: "Pending" },
];
const DELIVERY_STEPS = ["Packed", "Dispatched", "Out for Delivery", "Delivered"];

// ─── Supabase Helpers ─────────────────────────────────────────────────────────
function mapStatus(s: string): string {
  const m: Record<string, string> = {
    REGISTERED: "Registered", CASE_TAKING: "Case Taking",
    WAITING: "Waiting", CONSULTATION: "In Consult",
    PHARMACY: "Pharmacy", PAYMENT: "Pay Due", DONE: "Done", CANCELLED: "Cancelled",
  };
  return m[s] || s;
}
function mapBranch(b: string): string {
  return b === "BAJAJ_NAGAR" ? "Bajaj Nagar" : "Jagatpura";
}
function toBranch(b: string): string {
  return b === "Bajaj Nagar" ? "BAJAJ_NAGAR" : "JAGATPURA";
}
function calcWait(createdAt: string): string {
  const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
function todayStr(): string { return new Date().toISOString().split("T")[0]; }
function today(): string {
  return new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
const TopBar = ({ title, sub, onBack, action }: { title: string; sub?: string; onBack?: () => void; action?: React.ReactNode }) => (
  <div style={{ background: C.navy, padding: "16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
    {onBack && <button onClick={onBack} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 10, width: 36, height: 36, color: C.white, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>}
    {!onBack && <div style={{ width: 40, height: 40, borderRadius: 12, background: C.amber, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: C.navy, fontSize: 18 }}>Y</div>}
    <div style={{ flex: 1 }}>
      <div style={{ color: C.white, fontWeight: 700, fontSize: 17 }}>{title}</div>
      {sub && <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{sub}</div>}
    </div>
    {action}
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const cfg: Record<string, [string, string]> = {
    "In Consult": [C.navy, C.white], "Waiting": [C.amber, C.navy],
    "Pharmacy": ["#6B3FA0", C.white], "Pay Due": [C.red, C.white],
    "Done": [C.green, C.white], "Registered": ["#888", C.white],
    "Case Taking": ["#2980b9", C.white],
  };
  const [bg, col] = cfg[status] || ["#ccc", C.navy];
  return <span style={{ background: bg, color: col, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{status}</span>;
};
const StatCard = ({ value, label, color = C.navy }: { value: string | number; label: string; color?: string }) => (
  <div style={{ flex: 1, background: C.cardBg, borderRadius: 14, padding: "12px 10px", border: `1px solid ${C.border}`, textAlign: "center" }}>
    <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{label}</div>
  </div>
);
const Chip = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
  <button onClick={onClick} style={{ padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${selected ? C.navy : C.border}`, background: selected ? C.navy : C.cardBg, color: selected ? C.white : C.navy, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>{label}</button>
);
const Btn = ({ label, onClick, bg, color = C.white, style: s }: { label: string; onClick: () => void; bg: string; color?: string; style?: React.CSSProperties }) => (
  <button onClick={onClick} style={{ background: bg, color, border: "none", borderRadius: 12, padding: "12px 16px", fontWeight: 700, fontSize: 14, cursor: "pointer", ...s }}>{label}</button>
);
const NAV = [
  { key: "queue", icon: "🏠", label: "Queue" }, { key: "register", icon: "➕", label: "Register" },
  { key: "search", icon: "🔍", label: "Search" }, { key: "tasks", icon: "☑️", label: "Tasks" },
];
const BottomNav = ({ current, onNav }: { current: Screen; onNav: (s: Screen) => void }) => (
  <div style={{ display: "flex", background: C.white, borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
    {NAV.map(n => {
      const active = current === n.key;
      return (
        <button key={n.key} onClick={() => onNav(n.key as Screen)} style={{ flex: 1, padding: "10px 0", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: active ? C.amber : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{n.icon}</div>
          <span style={{ fontSize: 11, color: active ? C.amber : C.textMuted, fontWeight: active ? 700 : 500 }}>{n.label}</span>
        </button>
      );
    })}
  </div>
);

// ─── Screen: Queue ────────────────────────────────────────────────────────────
const QueueScreen = ({ onNav, onPatient, patients, loading, onRefresh }: {
  onNav: (s: Screen) => void; onPatient: (p: Patient) => void;
  patients: Patient[]; loading: boolean; onRefresh: () => void;
}) => {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Waiting", "Consultation", "Done", "New Patients"];
  const visible = patients.filter(p => {
    if (filter === "All") return true;
    if (filter === "Waiting") return p.status === "Waiting";
    if (filter === "Consultation") return p.status === "In Consult";
    if (filter === "Done") return p.status === "Done";
    if (filter === "New Patients") return p.visits <= 1;
    return true;
  });
  const waiting = patients.filter(p => p.status === "Waiting").length;
  const done = patients.filter(p => p.status === "Done").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Yadav Homeo Clinic" sub={`Jaipur • ${today()}`} action={
        <button onClick={() => onNav("register")} style={{ background: C.amber, border: "none", borderRadius: 20, padding: "8px 16px", color: C.navy, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ New</button>
      } />
      <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <StatCard value={patients.length} label="Total" />
          <StatCard value={waiting} label="Waiting" />
          <StatCard value={done} label="Done" color={C.green} />
          <StatCard value="Live" label="Status" color={C.amber} />
        </div>
        <div style={{ background: C.cardBg, borderRadius: 14, padding: "10px 12px", border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, letterSpacing: 1, marginBottom: 8 }}>PATIENT FLOW</div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, overflowX: "auto", fontSize: 12 }}>
            {["RECP1", "Case Dr", "Wait", "Rx Doctor", "Pharmacy", "Payment"].map((s, i, arr) => (
              <span key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ background: C.lightCream, border: `1px solid ${C.border}`, borderRadius: 8, padding: "4px 8px", whiteSpace: "nowrap", fontWeight: 600, color: C.navy }}>{s}</span>
                {i < arr.length - 1 && <span style={{ color: C.textMuted }}>→</span>}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {filters.map(f => <Chip key={f} label={f} selected={filter === f} onClick={() => setFilter(f)} />)}
        </div>

        {loading && <div style={{ textAlign: "center", color: C.textMuted, padding: 32 }}>Queue load ho rahi hai...</div>}

        {!loading && visible.length === 0 && (
          <div style={{ textAlign: "center", padding: 32 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🏥</div>
            <div style={{ color: C.textMuted, fontSize: 14 }}>Aaj koi patient nahi aaya abhi</div>
            <Btn label="Refresh karo" onClick={onRefresh} bg={C.navy} style={{ marginTop: 16 }} />
          </div>
        )}

        {!loading && visible.map(p => (
          <div key={p.visitId || p.id} onClick={() => onPatient(p)} style={{ background: C.cardBg, borderRadius: 16, padding: "14px", border: `1px solid ${C.border}`, cursor: "pointer" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ background: C.navy, borderRadius: 12, padding: "8px", textAlign: "center", minWidth: 52 }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>TOKEN</div>
                <div style={{ color: C.white, fontWeight: 800, fontSize: 16 }}>{p.token}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: C.navy }}>{p.name}</span>
                  <span style={{ fontSize: 12, color: C.textMuted }}>{p.waitTime}</span>
                </div>
                <div style={{ color: C.textMuted, fontSize: 13, margin: "2px 0" }}>{p.complaint || "—"}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: C.textMuted }}>{p.branch}</span>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <BottomNav current="queue" onNav={onNav} />
    </div>
  );
};

// ─── Screen: Register ─────────────────────────────────────────────────────────
const RegisterScreen = ({ onNav, onSuccess }: { onNav: (s: Screen) => void; onSuccess: (token: string, code: string) => void }) => {
  const [form, setForm] = useState({
    name: "", mobile: "", age: "", gender: "", blood: "", address: "",
    city: "", pincode: "", complaint: "", branch: "", source: "", whatsapp: true,
  });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const ChipGroup = ({ field, options }: { field: string; options: string[] }) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map(o => (
        <button key={o} onClick={() => set(field, o)} style={{ padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${(form as any)[field] === o ? C.navy : C.border}`, background: (form as any)[field] === o ? C.navy : C.cardBg, color: (form as any)[field] === o ? C.white : C.navy, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{o}</button>
      ))}
    </div>
  );
  const Label = ({ text }: { text: string }) => <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>{text}</div>;
  const Input = ({ placeholder, field, type = "text" }: { placeholder: string; field: string; type?: string }) => (
    <input placeholder={placeholder} type={type} value={(form as any)[field]} onChange={e => set(field, e.target.value)}
      style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.cardBg, fontSize: 14, color: C.navy, outline: "none", boxSizing: "border-box" }} />
  );

  const submit = async () => {
    if (!form.name || !form.mobile || !form.age || !form.gender || !form.branch) {
      alert("Naam, mobile, age, gender aur branch required hai!"); return;
    }
    setSaving(true);
    try {
      // 1. Get patient count for code
      const { count: pCount } = await supabase.from("patients").select("id", { count: "exact", head: true });
      const patientCode = `YHC-${String((pCount || 0) + 1001).padStart(4, "0")}`;

      // 2. Insert patient
      const { data: patient, error: pErr } = await supabase.from("patients").insert({
        patient_code: patientCode,
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        age: parseInt(form.age),
        gender: form.gender,
        blood_group: form.blood || null,
        city: form.city || null,
        pincode: form.pincode || null,
        primary_disease: form.complaint || null,
        wa_consent: form.whatsapp,
        branch: toBranch(form.branch),
        lifetime_visits: 1,
      }).select().single();

      if (pErr) throw pErr;

      // 3. Generate token
      const { count: vCount } = await supabase.from("visits").select("id", { count: "exact", head: true }).eq("visit_date", todayStr());
      const tokenNumber = `T-${String((vCount || 0) + 1).padStart(2, "0")}`;

      // 4. Insert visit
      const { error: vErr } = await supabase.from("visits").insert({
        patient_id: patient.id,
        visit_date: todayStr(),
        visit_type: "OPD",
        visit_status: "REGISTERED",
        token_number: tokenNumber,
        chief_complaint: form.complaint || null,
        branch: toBranch(form.branch),
      });

      if (vErr) throw vErr;

      onSuccess(tokenNumber, patientCode);
    } catch (e: any) {
      alert("Error: " + (e.message || "Registration fail hua"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="New Patient Registration" sub="Reception" onBack={() => onNav("queue")} />
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        <div><Label text="Full Name *" /><Input placeholder="e.g. Ramesh Sharma" field="name" /></div>
        <div><Label text="Mobile Number *" /><Input placeholder="98XXXXXXXX" field="mobile" type="tel" />
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>10 digits</div></div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}><Label text="Age *" /><Input placeholder="e.g. 32" field="age" type="number" /></div>
          <div style={{ flex: 1 }}><Label text="Blood Group" />
            <select value={form.blood} onChange={e => set("blood", e.target.value)} style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.cardBg, fontSize: 14, color: C.navy }}>
              <option value="">Select</option>
              {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "Not Known"].map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <div><Label text="Gender *" /><ChipGroup field="gender" options={["Male", "Female", "Other"]} /></div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}><Label text="City" /><Input placeholder="Jaipur" field="city" /></div>
          <div style={{ flex: 1 }}><Label text="Pincode" /><Input placeholder="302001" field="pincode" type="number" /></div>
        </div>
        <div><Label text="Chief Complaint" /><Input placeholder="Patient ki main problem" field="complaint" /></div>
        <div><Label text="Branch *" /><ChipGroup field="branch" options={["Bajaj Nagar", "Jagatpura"]} /></div>
        <div><Label text="Aapko YHC kaise pata chala?" /><ChipGroup field="source" options={["Walk-in", "Patient Referral", "Google", "Instagram", "YouTube", "JustDial", "WhatsApp"]} /></div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.cardBg, borderRadius: 14, padding: "14px", border: `1px solid ${C.border}` }}>
          <div>
            <div style={{ fontWeight: 700, color: C.navy }}>WhatsApp Consent *</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>Updates aur reminders bhejne ki permission</div>
          </div>
          <div onClick={() => set("whatsapp", !form.whatsapp)} style={{ width: 52, height: 28, borderRadius: 14, background: form.whatsapp ? C.green : "#ccc", cursor: "pointer", position: "relative" }}>
            <div style={{ position: "absolute", top: 3, left: form.whatsapp ? 26 : 3, width: 22, height: 22, borderRadius: 11, background: C.white, transition: "left 0.2s" }} />
          </div>
        </div>
        <Btn label={saving ? "Save ho raha hai..." : "Register & Generate Token"} onClick={submit} bg={saving ? "#aaa" : C.green} style={{ width: "100%", padding: "16px" }} />
        <div style={{ height: 16 }} />
      </div>
      <BottomNav current="register" onNav={onNav} />
    </div>
  );
};

// ─── Screen: Success ──────────────────────────────────────────────────────────
const SuccessScreen = ({ onNav, token, patientCode }: { onNav: (s: Screen) => void; token: string; patientCode: string }) => (
  <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.cream }}>
    <TopBar title="Token Generated" onBack={() => onNav("queue")} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 20 }}>
      <div style={{ width: 80, height: 80, borderRadius: 40, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>✓</div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: C.navy }}>{token}</div>
        <div style={{ fontSize: 16, color: C.textMuted, marginTop: 4 }}>Patient ID: {patientCode}</div>
        <div style={{ fontSize: 13, color: C.green, marginTop: 4 }}>Supabase mein save ho gaya ✓</div>
      </div>
      <div style={{ background: C.cardBg, borderRadius: 16, padding: 20, width: "100%", border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, marginBottom: 10 }}>WHATSAPP MESSAGE (Coming soon)</div>
        <div style={{ background: "#E8F5E0", borderRadius: 12, padding: 14, fontSize: 14, color: "#2D5016", lineHeight: 1.6 }}>
          "Namaste! Aapka token <strong>{token}</strong> confirm hua. Dr. Yadav OPD chal raha hai. — YHC Jaipur 🌿"
        </div>
      </div>
      <Btn label="Wapas Queue Pe Jaao" onClick={() => onNav("queue")} bg={C.navy} style={{ width: "100%" }} />
      <Btn label="Naya Patient Register Karo" onClick={() => onNav("register")} bg={C.amber} color={C.navy} style={{ width: "100%" }} />
    </div>
  </div>
);

// ─── Screen: Search ───────────────────────────────────────────────────────────
const SearchScreen = ({ onNav, onPatient }: { onNav: (s: Screen) => void; onPatient: (p: Patient) => void }) => {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (q.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      const { data } = await supabase
        .from("patients")
        .select("id, patient_code, name, mobile, primary_disease, branch, lifetime_visits, current_balance, age, gender, blood_group, city")
        .or(`name.ilike.%${q}%,mobile.ilike.%${q}%,patient_code.ilike.%${q}%`)
        .eq("is_deleted", false)
        .limit(15);
      if (data) {
        setResults(data.map((p: any) => ({
          id: p.patient_code || p.id,
          token: "—",
          name: p.name,
          complaint: p.primary_disease || "—",
          branch: mapBranch(p.branch),
          status: "—",
          waitTime: "—",
          age: p.age || 0,
          gender: p.gender || "—",
          mobile: p.mobile,
          blood: p.blood_group || "—",
          address: p.city || "—",
          visits: p.lifetime_visits || 0,
          lastVisit: "—",
          balance: p.current_balance || 0,
          patientId: p.id,
        })));
      }
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [q]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Search Patients" onBack={() => onNav("queue")} />
      <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18 }}>🔍</span>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Naam, mobile ya YHC-ID"
            style={{ width: "100%", padding: "14px 14px 14px 44px", borderRadius: 14, border: `2px solid ${C.amber}`, background: C.lightCream, fontSize: 14, color: C.navy, boxSizing: "border-box", outline: "none" }} />
        </div>
        {searching && <div style={{ textAlign: "center", color: C.textMuted }}>Dhundh raha hai...</div>}
        {results.map(p => (
          <div key={p.patientId} onClick={() => onPatient(p)} style={{ background: C.cardBg, borderRadius: 14, padding: 14, border: `1px solid ${C.border}`, cursor: "pointer" }}>
            <div style={{ fontWeight: 700, color: C.navy }}>{p.name}</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>{p.id} • {p.mobile}</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>{p.branch} • {p.visits} visits • {p.complaint}</div>
            {p.balance > 0 && <div style={{ fontSize: 12, color: C.red, marginTop: 4 }}>⚠ Outstanding: ₹{p.balance}</div>}
          </div>
        ))}
        {q.length > 1 && !searching && results.length === 0 && <div style={{ textAlign: "center", color: C.textMuted, marginTop: 40 }}>Koi patient nahi mila 🤔</div>}
      </div>
      <BottomNav current="search" onNav={onNav} />
    </div>
  );
};

// ─── Screen: Tasks ────────────────────────────────────────────────────────────
const TasksScreen = ({ onNav }: { onNav: (s: Screen) => void }) => {
  const [done, setDone] = useState<string[]>([]);
  const toggle = (id: string) => setDone(d => d.includes(id) ? d.filter(x => x !== id) : [...d, id]);
  const tasks = [
    { id: "t1", text: "Follow-up calls check karo", urgent: true },
    { id: "t2", text: "Kal ke pre-booked appointments confirm karo", urgent: false },
    { id: "t3", text: "Consultation slips restock karo", urgent: false },
  ];
  const shortcuts = [
    { icon: "📞", label: "Follow-up Calls", screen: "followup" as Screen },
    { icon: "👥", label: "Lead CRM", screen: "leads" as Screen },
    { icon: "🚚", label: "Delivery", screen: "delivery" as Screen },
    { icon: "📅", label: "Appointments", screen: "appointments" as Screen },
    { icon: "📊", label: "Day Summary", screen: "daily_summary" as Screen },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Reception Tasks" sub="Today" onBack={() => onNav("queue")} />
      <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {shortcuts.map(s => (
            <div key={s.screen} onClick={() => onNav(s.screen)} style={{ background: C.cardBg, borderRadius: 14, padding: "14px 12px", border: `1px solid ${C.border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: C.navy }}>{s.label}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 1, marginTop: 8 }}>AAJ KE KAAM</div>
        {tasks.map(t => (
          <div key={t.id} onClick={() => toggle(t.id)} style={{ background: C.cardBg, borderRadius: 14, padding: 14, border: `1.5px solid ${t.urgent && !done.includes(t.id) ? "#FDECEA" : C.border}`, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
            <div style={{ width: 22, height: 22, borderRadius: 11, border: `2px solid ${done.includes(t.id) ? C.green : C.border}`, background: done.includes(t.id) ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {done.includes(t.id) && <span style={{ color: C.white, fontSize: 13 }}>✓</span>}
            </div>
            <span style={{ fontSize: 14, color: done.includes(t.id) ? C.textMuted : C.navy, textDecoration: done.includes(t.id) ? "line-through" : "none" }}>{t.text}</span>
          </div>
        ))}
      </div>
      <BottomNav current="tasks" onNav={onNav} />
    </div>
  );
};

// ─── Screen: Payment ──────────────────────────────────────────────────────────
const PaymentScreen = ({ patient, onNav }: { patient: Patient | null; onNav: (s: Screen) => void }) => {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("");
  const [paid, setPaid] = useState(false);
  const [saving, setSaving] = useState(false);
  const due = patient?.balance || 300;

  const collect = async () => {
    if (!amount || !mode) { alert("Amount aur payment mode dono select karo"); return; }
    setSaving(true);
    try {
      const received = parseInt(amount);
      const balance = Math.max(0, due - received);

      if (patient?.visitId) {
        await supabase.from("payments").insert({
          visit_id: patient.visitId,
          patient_id: patient.patientId || null,
          amount_charged: due,
          amount_received: received,
          balance_due: balance,
          payment_mode: mode.toUpperCase(),
          branch: toBranch(patient.branch),
        });
        if (patient.patientId) {
          await supabase.from("patients").update({
            current_balance: balance,
            lifetime_revenue: (patient.balance || 0) + received,
            modified_at: new Date().toISOString(),
          }).eq("id", patient.patientId);
          await supabase.from("visits").update({
            visit_status: balance > 0 ? "PAYMENT" : "DONE",
            modified_at: new Date().toISOString(),
          }).eq("id", patient.visitId);
        }
      }
      setPaid(true);
    } catch (e: any) {
      alert("Error: " + (e.message || "Payment save nahi hua"));
    } finally {
      setSaving(false);
    }
  };

  if (paid) return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
      <div style={{ fontSize: 60 }}>✅</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: C.navy }}>Payment Ho Gayi!</div>
      <div style={{ color: C.textMuted }}>₹{amount} collected via {mode}</div>
      <div style={{ color: C.green, fontSize: 13 }}>Supabase mein save ho gaya ✓</div>
      <Btn label="Wapas Queue" onClick={() => onNav("queue")} bg={C.navy} style={{ width: "100%" }} />
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Payment Collect Karo" onBack={() => onNav("queue")} />
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: C.cardBg, borderRadius: 16, padding: 16, border: `1px solid ${C.border}` }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.navy }}>{patient?.name || "—"}</div>
          <div style={{ color: C.textMuted, fontSize: 13 }}>{patient?.token || "—"} • {patient?.complaint || "—"}</div>
          <div style={{ marginTop: 12, padding: "10px 14px", background: "#FDECEA", borderRadius: 10, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 600, color: C.red }}>Amount Due</span>
            <span style={{ fontWeight: 800, fontSize: 18, color: C.red }}>₹{due}</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 1, marginBottom: 8 }}>QUICK FILL</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[200, 300, 500, 700].map(v => (
              <button key={v} onClick={() => setAmount(String(v))} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1.5px solid ${amount === String(v) ? C.navy : C.border}`, background: amount === String(v) ? C.navy : C.cardBg, color: amount === String(v) ? C.white : C.navy, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>₹{v}</button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 1, marginBottom: 8 }}>AMOUNT (CUSTOM)</div>
          <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="₹ amount daalo" type="number"
            style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.cardBg, fontSize: 16, fontWeight: 700, color: C.navy, boxSizing: "border-box", outline: "none" }} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 1, marginBottom: 8 }}>PAYMENT MODE</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["Cash", "UPI", "QR", "Card"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1.5px solid ${mode === m ? C.green : C.border}`, background: mode === m ? C.green : C.cardBg, color: mode === m ? C.white : C.navy, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{m}</button>
            ))}
          </div>
        </div>
        <Btn label={saving ? "Save ho raha hai..." : "✓ Collect & Save"} onClick={collect} bg={saving ? "#aaa" : C.green} style={{ width: "100%", padding: "16px" }} />
        <div style={{ display: "flex", gap: 8 }}>
          <Btn label="Partial Payment" onClick={() => alert("Doctor approval required")} bg={C.amber} color={C.navy} style={{ flex: 1 }} />
          <Btn label="Credit Mein" onClick={() => alert("Credit note bana diya")} bg="#888" style={{ flex: 1 }} />
        </div>
      </div>
    </div>
  );
};

// ─── Screen: Follow-up CRM ────────────────────────────────────────────────────
const FollowUpScreen = ({ onNav }: { onNav: (s: Screen) => void }) => {
  const [filter, setFilter] = useState("All");
  const patients = [
    { id: 1, name: "Anika Patel", lastVisit: "30 Jun", daysSince: 17, disease: "PCOS", called: false },
    { id: 2, name: "Rajesh Kumar", lastVisit: "8 Jul", daysSince: 9, disease: "Diabetes", called: false },
    { id: 3, name: "Meena Shah", lastVisit: "12 Jul", daysSince: 5, disease: "Thyroid", called: true },
  ];
  const visible = patients.filter(p => {
    if (filter === "Overdue") return p.daysSince >= 7;
    if (filter === "Called") return p.called;
    if (filter === "Pending") return !p.called;
    return true;
  });
  const rowColor = (p: typeof patients[0]) => p.called ? "#E8F5E0" : p.daysSince >= 7 ? "#FDECEA" : "#FFF3DC";
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Follow-up Calls — Aaj" onBack={() => onNav("tasks")} />
      <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <StatCard value={3} label="Due Today" />
          <StatCard value={1} label="Overdue" color={C.red} />
          <StatCard value={1} label="Done" color={C.green} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["All", "Overdue", "Called", "Pending"].map(f => <Chip key={f} label={f} selected={filter === f} onClick={() => setFilter(f)} />)}
        </div>
        {visible.map(p => (
          <div key={p.id} style={{ background: rowColor(p), borderRadius: 14, padding: 14, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700, color: C.navy }}>{p.name}</div>
              <span style={{ fontSize: 11, color: C.textMuted }}>{p.daysSince} din pehle</span>
            </div>
            <div style={{ fontSize: 13, color: C.textMuted, margin: "4px 0" }}>{p.disease} • Last visit: {p.lastVisit}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Btn label="📞 Call" onClick={() => alert(`${p.name} ko call`)} bg={C.green} style={{ flex: 1, padding: "8px" }} />
              <Btn label="💬 WA" onClick={() => alert("WhatsApp bhej rahe hain")} bg={C.amber} color={C.navy} style={{ flex: 1, padding: "8px" }} />
              <Btn label="✓ Done" onClick={() => alert("Marked done!")} bg={C.navy} style={{ flex: 1, padding: "8px" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Screen: Lead CRM ─────────────────────────────────────────────────────────
const LeadsScreen = ({ onNav }: { onNav: (s: Screen) => void }) => {
  const [filter, setFilter] = useState("All");
  const borderColor: Record<string, string> = { HOT: C.red, Warm: C.amber, Converted: C.green, Cold: "#aaa", Lost: "#ccc" };
  const badgeBg: Record<string, string> = { HOT: "#FDECEA", Warm: "#FFF3DC", Converted: "#E8F5E0", Cold: "#f0f0f0", Lost: "#f5f5f5" };
  const badgeColor: Record<string, string> = { HOT: C.red, Warm: "#B8860B", Converted: C.green, Cold: "#888", Lost: "#aaa" };
  const visible = LEADS.filter(l => {
    if (filter === "HOT") return l.status === "HOT";
    if (filter === "Follow-up Due") return l.daysSince >= 2;
    if (filter === "New Today") return l.daysSince === 0;
    return true;
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Lead CRM" sub="Potential Patients" onBack={() => onNav("tasks")} />
      <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 8 }}><StatCard value={LEADS.length} label="Total Leads" /><StatCard value={2} label="HOT" color={C.red} /></div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {["All", "HOT", "Follow-up Due", "New Today"].map(f => <Chip key={f} label={f} selected={filter === f} onClick={() => setFilter(f)} />)}
        </div>
        {visible.map(l => (
          <div key={l.id} style={{ background: C.cardBg, borderRadius: 14, padding: 14, borderLeft: `4px solid ${borderColor[l.status]}`, border: `1px solid ${C.border}`, borderLeftWidth: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>{l.name}</div>
              <span style={{ background: badgeBg[l.status], color: badgeColor[l.status], borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{l.status}</span>
            </div>
            <div style={{ fontSize: 13, color: C.textMuted, margin: "4px 0" }}>{l.mobile} • {l.source} • {l.daysSince === 0 ? "Aaj" : `${l.daysSince} din pehle`}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <Btn label="📞" onClick={() => alert(`${l.name} ko call`)} bg={C.green} style={{ padding: "8px 14px" }} />
              <Btn label="💬 WA" onClick={() => alert("WhatsApp bhej rahe hain")} bg={C.amber} color={C.navy} style={{ padding: "8px 14px" }} />
              <Btn label="Patient Banao →" onClick={() => onNav("register")} bg={C.navy} style={{ flex: 1, padding: "8px" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Screen: Delivery ─────────────────────────────────────────────────────────
const DeliveryScreen = ({ onNav }: { onNav: (s: Screen) => void }) => {
  const [deliveries, setDeliveries] = useState(DELIVERIES);
  const advance = (id: string) => setDeliveries(d => d.map(x => x.id === id ? { ...x, step: Math.min(x.step + 1, 3) } : x));
  const partnerIcon: Record<string, string> = { Swiggy: "🛵", Porter: "🚐", Courier: "📦" };
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Delivery Tracking" onBack={() => onNav("tasks")} />
      <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        {deliveries.map(d => (
          <div key={d.id} style={{ background: C.cardBg, borderRadius: 16, padding: 14, border: `1px solid ${C.border}` }}>
            <div style={{ fontWeight: 700, color: C.navy }}>{d.patient} ({d.token})</div>
            <div style={{ fontSize: 13, color: C.textMuted }}>{partnerIcon[d.partner] || "📦"} {d.partner} • {d.area}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 0, marginTop: 14 }}>
              {DELIVERY_STEPS.map((s, i) => (
                <span key={s} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 14, background: i <= d.step ? C.amber : C.border, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontSize: 13, fontWeight: 700 }}>{i <= d.step ? "✓" : i + 1}</div>
                    <div style={{ fontSize: 9, color: i === d.step ? C.amber : C.textMuted, textAlign: "center", marginTop: 4 }}>{s}</div>
                  </div>
                  {i < DELIVERY_STEPS.length - 1 && <div style={{ height: 2, flex: 0.3, background: i < d.step ? C.amber : C.border, marginBottom: 16 }} />}
                </span>
              ))}
            </div>
            {d.step < 3 && <Btn label={`→ ${DELIVERY_STEPS[d.step + 1]}`} onClick={() => advance(d.id)} bg={C.green} style={{ marginTop: 12, width: "100%" }} />}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Screen: Patient Profile ──────────────────────────────────────────────────
const PatientProfileScreen = ({ patient, onNav, onPayment }: { patient: Patient | null; onNav: (s: Screen) => void; onPayment: (p: Patient) => void }) => {
  if (!patient) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Patient Profile" sub="Reception View" onBack={() => onNav("queue")} />
      <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ background: C.navy, borderRadius: 16, padding: 18, color: C.white }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 28, background: C.amber, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: C.navy }}>{patient.name[0]}</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{patient.name}</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{patient.id} • {patient.token}</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{patient.age} yrs • {patient.gender} • {patient.blood}</div>
            </div>
          </div>
        </div>
        {patient.balance > 0 && (
          <div style={{ background: "#FDECEA", borderRadius: 14, padding: 14, border: `1px solid ${C.red}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 700, color: C.red }}>⚠ Outstanding Balance</div>
            <div style={{ fontWeight: 800, fontSize: 20, color: C.red }}>₹{patient.balance}</div>
          </div>
        )}
        <div style={{ background: C.cardBg, borderRadius: 14, padding: 14, border: `1px solid ${C.border}` }}>
          <div style={{ fontWeight: 700, color: C.navy, marginBottom: 8 }}>Visit Info</div>
          <div style={{ fontSize: 13, color: C.textMuted }}>Total Visits: {patient.visits}</div>
          <div style={{ fontSize: 13, color: C.textMuted }}>Status: {patient.status}</div>
          <div style={{ fontSize: 13, color: C.textMuted }}>Branch: {patient.branch}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn label="💬 WhatsApp" onClick={() => alert("WhatsApp khul raha hai")} bg={C.green} style={{ flex: 1 }} />
          <Btn label="📞 Call" onClick={() => alert(`${patient.mobile} ko call karo`)} bg={C.navy} style={{ flex: 1 }} />
        </div>
        {patient.balance > 0 && <Btn label="₹ Payment Collect Karo" onClick={() => onPayment(patient)} bg={C.amber} color={C.navy} style={{ width: "100%", padding: "15px" }} />}
      </div>
    </div>
  );
};

// ─── Screen: Appointments ─────────────────────────────────────────────────────
const AppointmentsScreen = ({ onNav }: { onNav: (s: Screen) => void }) => {
  const statusColor: Record<string, string> = { Confirmed: C.green, Pending: C.amber, Cancelled: C.red };
  const statusBg: Record<string, string> = { Confirmed: "#E8F5E0", Pending: "#FFF3DC", Cancelled: "#FDECEA" };
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Appointments" onBack={() => onNav("tasks")} />
      <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {APPOINTMENTS.map(a => (
          <div key={a.id} style={{ background: C.cardBg, borderRadius: 14, padding: 14, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: C.navy }}>{a.time}</div>
              <span style={{ background: statusBg[a.status], color: statusColor[a.status], borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{a.status}</span>
            </div>
            <div style={{ fontWeight: 700, color: C.navy, marginTop: 6 }}>{a.name}</div>
            <div style={{ fontSize: 13, color: C.textMuted }}>{a.mobile} • {a.reason}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Screen: Daily Summary ────────────────────────────────────────────────────
const DailySummaryScreen = ({ onNav }: { onNav: (s: Screen) => void }) => (
  <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
    <TopBar title="Day Summary" sub={today()} onBack={() => onNav("tasks")} />
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", color: C.textMuted }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
        <div>Real summary Phase 4 mein aayega</div>
        <div style={{ fontSize: 12, marginTop: 4 }}>Supabase se live data pull hoga</div>
      </div>
    </div>
  </div>
);

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("queue");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastToken, setLastToken] = useState("T-01");
  const [lastCode, setLastCode] = useState("YHC-1001");

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("visits")
        .select(`id, token_number, visit_status, chief_complaint, branch, created_at, patients(id, patient_code, name, age, gender, mobile, blood_group, city, lifetime_visits, current_balance)`)
        .eq("visit_date", todayStr())
        .eq("is_deleted", false)
        .order("created_at");

      if (data) {
        setPatients(data.map((v: any) => {
          const p = v.patients;
          return {
            id: p?.patient_code || "YHC-???",
            token: v.token_number || "T-?",
            name: p?.name || "Unknown",
            complaint: v.chief_complaint || "—",
            branch: mapBranch(v.branch),
            status: mapStatus(v.visit_status),
            waitTime: calcWait(v.created_at),
            age: p?.age || 0,
            gender: p?.gender || "—",
            mobile: p?.mobile || "—",
            blood: p?.blood_group || "—",
            address: p?.city || "—",
            visits: p?.lifetime_visits || 1,
            lastVisit: "—",
            balance: p?.current_balance || 0,
            visitId: v.id,
            patientId: p?.id,
          };
        }));
      }
    } catch (e) {
      console.error("Queue load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadQueue(); }, [loadQueue]);

  const navTo = (s: Screen) => {
    if (s === "queue") loadQueue();
    setScreen(s);
  };
  const goPatient = (p: Patient) => { setSelectedPatient(p); setScreen("patient_profile"); };
  const goPayment = (p: Patient) => { setSelectedPatient(p); setScreen("payment"); };

  const render = () => {
    switch (screen) {
      case "queue": return <QueueScreen onNav={navTo} onPatient={goPatient} patients={patients} loading={loading} onRefresh={loadQueue} />;
      case "register": return <RegisterScreen onNav={navTo} onSuccess={(t, c) => { setLastToken(t); setLastCode(c); setScreen("success"); }} />;
      case "success": return <SuccessScreen onNav={navTo} token={lastToken} patientCode={lastCode} />;
      case "search": return <SearchScreen onNav={navTo} onPatient={goPatient} />;
      case "tasks": return <TasksScreen onNav={navTo} />;
      case "payment": return <PaymentScreen patient={selectedPatient} onNav={navTo} />;
      case "followup": return <FollowUpScreen onNav={navTo} />;
      case "leads": return <LeadsScreen onNav={navTo} />;
      case "delivery": return <DeliveryScreen onNav={navTo} />;
      case "patient_profile": return <PatientProfileScreen patient={selectedPatient} onNav={navTo} onPayment={goPayment} />;
      case "appointments": return <AppointmentsScreen onNav={navTo} />;
      case "daily_summary": return <DailySummaryScreen onNav={navTo} />;
      default: return <QueueScreen onNav={navTo} onPatient={goPatient} patients={patients} loading={loading} onRefresh={loadQueue} />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#e8e0d0", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: 430, height: 850, background: C.cream, borderRadius: 40, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 30px 80px rgba(0,0,0,0.25)", position: "relative" }}>
        {render()}
      </div>
    </div>
  );
}
