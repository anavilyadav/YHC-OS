import { useState } from "react";

// ─── Brand Tokens ───────────────────────────────────────────────────────────
const C = {
  cream: "#F5DEB3",
  navy: "#1A2A41",
  amber: "#D4A04A",
  green: "#5B8A2D",
  red: "#C0392B",
  white: "#FFFFFF",
  lightCream: "#FDF6E3",
  cardBg: "#FFFDF5",
  textMuted: "#6B5E4E",
  border: "#E8D5A3",
};

// ─── Types ──────────────────────────────────────────────────────────────────
type Screen =
  | "queue"
  | "register"
  | "search"
  | "tasks"
  | "payment"
  | "followup"
  | "leads"
  | "delivery"
  | "patient_profile"
  | "appointments"
  | "daily_summary"
  | "success";

type Patient = {
  id: string; token: string; name: string; complaint: string;
  branch: string; status: string; waitTime: string;
  age: number; gender: string; mobile: string; blood: string;
  address: string; visits: number; lastVisit: string; balance: number;
};

type Lead = {
  id: string; name: string; mobile: string; source: string;
  status: "HOT" | "Warm" | "Cold" | "Converted" | "Lost";
  daysSince: number;
};

type Delivery = {
  id: string; patient: string; token: string; partner: string;
  step: number; area: string; note: string;
};

type Appointment = {
  id: string; time: string; name: string; mobile: string;
  reason: string; branch: string; status: "Confirmed" | "Pending" | "Cancelled";
};

// ─── Dummy Data ──────────────────────────────────────────────────────────────
const PATIENTS: Patient[] = [
  { id: "YHC-1042", token: "T-01", name: "Ramesh Sharma", complaint: "Joint pain (knee)", branch: "Bajaj Nagar", status: "In Consult", waitTime: "33 min", age: 54, gender: "Male", mobile: "98XXXX1234", blood: "B+", address: "12, Sector 5, Bajaj Nagar, Jaipur", visits: 8, lastVisit: "20 Jun 2026", balance: 0 },
  { id: "YHC-1043", token: "T-02", name: "Sunita Verma", complaint: "Migraine", branch: "Bajaj Nagar", status: "Waiting", waitTime: "19 min", age: 38, gender: "Female", mobile: "97XXXX5678", blood: "A+", address: "7, Lal Kothi, Jaipur", visits: 3, lastVisit: "10 Jul 2026", balance: 0 },
  { id: "YHC-1044", token: "T-03", name: "Aarav Gupta", complaint: "Skin allergy", branch: "Jagatpura", status: "Pharmacy", waitTime: "56 min", age: 22, gender: "Male", mobile: "96XXXX9012", blood: "O+", address: "3, Jagatpura Road, Jaipur", visits: 1, lastVisit: "17 Jul 2026", balance: 300 },
  { id: "YHC-1045", token: "T-04", name: "Priya Nair", complaint: "PCOS follow-up", branch: "Bajaj Nagar", status: "Pay Due", waitTime: "1h 11m", age: 29, gender: "Female", mobile: "95XXXX3456", blood: "AB+", address: "5, C-Scheme, Jaipur", visits: 5, lastVisit: "1 Jul 2026", balance: 500 },
  { id: "YHC-1046", token: "T-05", name: "Mohan Lal", complaint: "Hypertension", branch: "Jagatpura", status: "Done", waitTime: "2h 1m", age: 62, gender: "Male", mobile: "94XXXX7890", blood: "B-", address: "8, Jagatpura Colony", visits: 12, lastVisit: "15 Jul 2026", balance: 0 },
  { id: "YHC-1047", token: "T-06", name: "Neha Jain", complaint: "Anxiety / sleep issues", branch: "Bajaj Nagar", status: "Waiting", waitTime: "9 min", age: 31, gender: "Female", mobile: "93XXXX2345", blood: "A-", address: "22, Vaishali Nagar, Jaipur", visits: 2, lastVisit: "5 Jul 2026", balance: 0 },
];

const LEADS: Lead[] = [
  { id: "L001", name: "Arun Mehta", mobile: "98XXXX1111", source: "JustDial", status: "HOT", daysSince: 1 },
  { id: "L002", name: "Kavita Singh", mobile: "97XXXX2222", source: "Instagram", status: "Warm", daysSince: 3 },
  { id: "L003", name: "Deepak Joshi", mobile: "96XXXX3333", source: "Google", status: "HOT", daysSince: 0 },
  { id: "L004", name: "Ritu Agarwal", mobile: "95XXXX4444", source: "Referral", status: "Cold", daysSince: 8 },
  { id: "L005", name: "Sanjay Rao", mobile: "94XXXX5555", source: "Walk-in", status: "Converted", daysSince: 5 },
  { id: "L006", name: "Pooja Bhatia", mobile: "93XXXX6666", source: "WhatsApp", status: "Warm", daysSince: 2 },
];

const DELIVERIES: Delivery[] = [
  { id: "D001", patient: "Ramesh Sharma", token: "T-01", partner: "Swiggy", step: 2, area: "Bajaj Nagar", note: "" },
  { id: "D002", patient: "Mohan Lal", token: "T-05", partner: "Porter", step: 3, area: "Jagatpura", note: "" },
  { id: "D003", patient: "Kavita Singh", token: "T-08", partner: "Courier", step: 1, area: "Vaishali Nagar", note: "" },
];

const APPOINTMENTS: Appointment[] = [
  { id: "A001", time: "10:00 AM", name: "Anita Sharma", mobile: "98XXXX1234", reason: "Thyroid follow-up", branch: "Bajaj Nagar", status: "Confirmed" },
  { id: "A002", time: "11:30 AM", name: "Vijay Kumar", mobile: "97XXXX5678", reason: "Skin rash", branch: "Jagatpura", status: "Pending" },
  { id: "A003", time: "12:00 PM", name: "Meera Gupta", mobile: "96XXXX9012", reason: "Diabetes consult", branch: "Bajaj Nagar", status: "Confirmed" },
  { id: "A004", time: "2:30 PM", name: "Rajesh Verma", mobile: "95XXXX3456", reason: "Knee pain", branch: "Bajaj Nagar", status: "Cancelled" },
];

const DELIVERY_STEPS = ["Packed", "Dispatched", "Out for Delivery", "Delivered"];

// ─── Shared UI ────────────────────────────────────────────────────────────────
const TopBar = ({ title, sub, onBack, action }: { title: string; sub?: string; onBack?: () => void; action?: React.ReactNode }) => (
  <div style={{ background: C.navy, padding: "16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
    {onBack && (
      <button onClick={onBack} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 10, width: 36, height: 36, color: C.white, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
    )}
    {!onBack && (
      <div style={{ width: 40, height: 40, borderRadius: 12, background: C.amber, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: C.navy, fontSize: 18 }}>Y</div>
    )}
    <div style={{ flex: 1 }}>
      <div style={{ color: C.white, fontWeight: 700, fontSize: 17 }}>{title}</div>
      {sub && <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{sub}</div>}
    </div>
    {action}
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { bg: string; color: string }> = {
    "In Consult": { bg: "#E8F5E0", color: C.green },
    "Waiting": { bg: "#FFF3DC", color: "#B8860B" },
    "Pharmacy": { bg: "#FFF3DC", color: "#B8860B" },
    "Pay Due": { bg: "#FDECEA", color: C.red },
    "Done": { bg: "#F0F0F0", color: "#888" },
  };
  const s = map[status] || { bg: "#eee", color: "#555" };
  return <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>{status}</span>;
};

const Chip = ({ label, selected, onClick, color }: { label: string; selected: boolean; onClick: () => void; color?: string }) => (
  <button onClick={onClick} style={{ padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${selected ? (color || C.navy) : C.border}`, background: selected ? (color || C.navy) : C.cardBg, color: selected ? C.white : C.navy, fontSize: 13, fontWeight: selected ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap" }}>
    {label}
  </button>
);

const StatCard = ({ value, label, color }: { value: string | number; label: string; color?: string }) => (
  <div style={{ flex: 1, background: C.cardBg, borderRadius: 14, padding: "12px 8px", textAlign: "center", border: `1px solid ${C.border}` }}>
    <div style={{ fontSize: 22, fontWeight: 800, color: color || C.navy }}>{value}</div>
    <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 2 }}>{label}</div>
  </div>
);

const Btn = ({ label, onClick, bg, color, style }: { label: string; onClick: () => void; bg: string; color?: string; style?: React.CSSProperties }) => (
  <button onClick={onClick} style={{ padding: "12px 16px", borderRadius: 12, background: bg, color: color || C.white, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", ...style }}>{label}</button>
);

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
const NAV = [
  { key: "queue", icon: "📋", label: "Queue" },
  { key: "register", icon: "🧑‍⚕️", label: "Register" },
  { key: "search", icon: "🔍", label: "Search" },
  { key: "tasks", icon: "☑️", label: "Tasks" },
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
const QueueScreen = ({ onNav, onPatient }: { onNav: (s: Screen) => void; onPatient: (p: Patient) => void }) => {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Waiting", "Consultation", "Done", "New Patients"];
  const visible = PATIENTS.filter(p => {
    if (filter === "All") return true;
    if (filter === "Waiting") return p.status === "Waiting";
    if (filter === "Consultation") return p.status === "In Consult";
    if (filter === "Done") return p.status === "Done";
    if (filter === "New Patients") return p.visits === 1;
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Yadav Homeo Clinic" sub="Jaipur • Fri, 17 Jul" action={
        <button onClick={() => onNav("register")} style={{ background: C.amber, border: "none", borderRadius: 20, padding: "8px 16px", color: C.navy, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ New</button>
      } />
      <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Stats */}
        <div style={{ display: "flex", gap: 8 }}>
          <StatCard value={6} label="Total" />
          <StatCard value={2} label="Waiting" />
          <StatCard value={1} label="Done" color={C.green} />
          <StatCard value="₹1850" label="Revenue" color={C.amber} />
        </div>
        {/* Patient flow */}
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
        {/* Filters */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {filters.map(f => <Chip key={f} label={f} selected={filter === f} onClick={() => setFilter(f)} />)}
        </div>
        {/* Cards */}
        {visible.map(p => (
          <div key={p.id} onClick={() => onPatient(p)} style={{ background: C.cardBg, borderRadius: 16, padding: "14px", border: `1px solid ${C.border}`, cursor: "pointer" }}>
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
                <div style={{ color: C.textMuted, fontSize: 13, margin: "2px 0" }}>{p.complaint}</div>
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
const RegisterScreen = ({ onNav, onSuccess }: { onNav: (s: Screen) => void; onSuccess: () => void }) => {
  const [form, setForm] = useState({ name: "", mobile: "", age: "", gender: "", marital: "", blood: "", birthday: "", anniversary: "", address: "", city: "", pincode: "", complaint: "", branch: "", visitType: "", source: "", whatsapp: true });
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

  const submit = () => {
    if (!form.name || !form.mobile || !form.age || !form.gender || !form.branch) { alert("Naam, mobile, age, gender aur branch required hai!"); return; }
    onSuccess();
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
        <div><Label text="Marital Status" /><ChipGroup field="marital" options={["Single", "Married", "Divorced", "Widowed"]} /></div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}><Label text="Birthday (DD/MM)" /><Input placeholder="15/08" field="birthday" /></div>
          <div style={{ flex: 1 }}><Label text="Anniversary (DD/MM)" /><Input placeholder="20/11" field="anniversary" /></div>
        </div>
        <div><Label text="Full Address" />
          <textarea placeholder="House / street / area" value={form.address} onChange={e => set("address", e.target.value)} rows={3}
            style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.cardBg, fontSize: 14, color: C.navy, resize: "none", boxSizing: "border-box" }} /></div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}><Label text="City" /><Input placeholder="Jaipur" field="city" /></div>
          <div style={{ flex: 1 }}><Label text="Pincode" /><Input placeholder="302001" field="pincode" type="number" /></div>
        </div>
        <div><Label text="Chief Complaint" /><Input placeholder="Patient ki main problem" field="complaint" /></div>
        <div><Label text="Branch *" /><ChipGroup field="branch" options={["Bajaj Nagar", "Jagatpura"]} /></div>
        <div><Label text="Visit Type" /><ChipGroup field="visitType" options={["Walk-in", "Pre-booked", "Online", "Courier"]} /></div>
        <div><Label text="Aapko YHC kaise pata chala?" /><ChipGroup field="source" options={["Walk-in", "Patient Referral", "Doctor Referral", "Google", "Instagram", "YouTube", "JustDial", "WhatsApp", "Pamphlet"]} /></div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.cardBg, borderRadius: 14, padding: "14px", border: `1px solid ${C.border}` }}>
          <div>
            <div style={{ fontWeight: 700, color: C.navy }}>WhatsApp Consent *</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>Updates aur reminders bhejne ki permission</div>
          </div>
          <div onClick={() => set("whatsapp", !form.whatsapp)} style={{ width: 52, height: 28, borderRadius: 14, background: form.whatsapp ? C.green : "#ccc", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
            <div style={{ position: "absolute", top: 3, left: form.whatsapp ? 26 : 3, width: 22, height: 22, borderRadius: 11, background: C.white, transition: "left 0.2s" }} />
          </div>
        </div>
        <Btn label="Register & Generate Token" onClick={submit} bg={C.green} style={{ width: "100%", padding: "16px" }} />
        <div style={{ height: 16 }} />
      </div>
      <BottomNav current="register" onNav={onNav} />
    </div>
  );
};

// ─── Screen: Success ──────────────────────────────────────────────────────────
const SuccessScreen = ({ onNav }: { onNav: (s: Screen) => void }) => (
  <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.cream }}>
    <TopBar title="Token Generated" onBack={() => onNav("queue")} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 20 }}>
      <div style={{ width: 80, height: 80, borderRadius: 40, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>✓</div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: C.navy }}>T-07</div>
        <div style={{ fontSize: 16, color: C.textMuted, marginTop: 4 }}>Patient ID: YHC-1048</div>
      </div>
      <div style={{ background: C.cardBg, borderRadius: 16, padding: 20, width: "100%", border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, marginBottom: 10 }}>📱 WHATSAPP MESSAGE SENT</div>
        <div style={{ background: "#E8F5E0", borderRadius: 12, padding: 14, fontSize: 14, color: "#2D5016", lineHeight: 1.6 }}>
          "Namaste <strong>Naya Mahan</strong> ji! 🌿 Aapka token <strong>T-07</strong> confirm hua. Dr. Yadav OPD chal raha hai. Thodi der mein bulaya jaayega. — YHC Jaipur 🌿"
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
  const results = q.length > 1 ? PATIENTS.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.id.includes(q) || p.token.includes(q)) : [];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Search Patients" onBack={() => onNav("queue")} />
      <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18 }}>🔍</span>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Name, mobile, YHC-ID ya token"
            style={{ width: "100%", padding: "14px 14px 14px 44px", borderRadius: 14, border: `2px solid ${C.amber}`, background: C.lightCream, fontSize: 14, color: C.navy, boxSizing: "border-box", outline: "none" }} />
        </div>
        {results.map(p => (
          <div key={p.id} onClick={() => onPatient(p)} style={{ background: C.cardBg, borderRadius: 14, padding: 14, border: `1px solid ${C.border}`, cursor: "pointer" }}>
            <div style={{ fontWeight: 700, color: C.navy }}>{p.name}</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>{p.id} • {p.complaint}</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>{p.branch} • {p.visits} visits</div>
          </div>
        ))}
        {q.length > 1 && results.length === 0 && <div style={{ textAlign: "center", color: C.textMuted, marginTop: 40 }}>Koi patient nahi mila 🤔</div>}
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
    { id: "t1", text: "Call back Priya Nair for pending payment (T-04)", urgent: true },
    { id: "t2", text: "Confirm tomorrow's pre-booked appointments (WhatsApp)", urgent: false },
    { id: "t3", text: "Restock consultation slips at Bajaj Nagar", urgent: false },
    { id: "t4", text: "Follow-up: Aarav Gupta courier delivery status", urgent: false },
    { id: "t5", text: "Send birthday wish to 2 patients (see reminders)", urgent: false },
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
  const due = patient?.balance || 300;
  if (paid) return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
      <div style={{ fontSize: 60 }}>✅</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: C.navy }}>Payment Ho Gayi!</div>
      <div style={{ color: C.textMuted }}>₹{amount || due} collected via {mode || "Cash"}</div>
      <Btn label="Wapas Queue" onClick={() => onNav("queue")} bg={C.navy} style={{ width: "100%" }} />
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Payment Collect Karo" onBack={() => onNav("queue")} />
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: C.cardBg, borderRadius: 16, padding: 16, border: `1px solid ${C.border}` }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.navy }}>{patient?.name || "Ramesh Sharma"}</div>
          <div style={{ color: C.textMuted, fontSize: 13 }}>{patient?.token || "T-01"} • {patient?.complaint || "Joint pain"}</div>
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
        <Btn label="✓ Collect & WhatsApp Receipt Bhejo" onClick={() => setPaid(true)} bg={C.green} style={{ width: "100%", padding: "16px" }} />
        <div style={{ display: "flex", gap: 8 }}>
          <Btn label="Partial Payment" onClick={() => alert("Doctor approval required hai partial payment ke liye")} bg={C.amber} color={C.navy} style={{ flex: 1 }} />
          <Btn label="Credit Mein Rakho" onClick={() => alert("Credit note bana diya gaya")} bg="#888" style={{ flex: 1 }} />
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
    { id: 4, name: "Suresh Rao", lastVisit: "14 Jul", daysSince: 3, disease: "Asthma", called: false },
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
          <StatCard value={4} label="Due Today" />
          <StatCard value={2} label="Overdue" color={C.red} />
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
              <Btn label="📞 Call" onClick={() => alert(`${p.name} ko call kar rahe hain`)} bg={C.green} style={{ flex: 1, padding: "8px" }} />
              <Btn label="💬 WA" onClick={() => alert(`WhatsApp bhej rahe hain`)} bg={C.amber} color={C.navy} style={{ flex: 1, padding: "8px" }} />
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
        <div style={{ display: "flex", gap: 8 }}>
          <StatCard value={6} label="Total Leads" />
          <StatCard value={2} label="HOT" color={C.red} />
          <StatCard value={1} label="Converted" color={C.green} />
        </div>
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
              <Btn label="Patient Banao →" onClick={() => alert("Registration mein bhej rahe hain")} bg={C.navy} style={{ flex: 1, padding: "8px" }} />
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
  const partnerIcon: Record<string, string> = { Swiggy: "🛵", Porter: "🚐", Courier: "📦", "Self-pickup": "🏃" };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Delivery Tracking" onBack={() => onNav("tasks")} />
      <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <StatCard value={3} label="Active" color={C.amber} />
          <StatCard value={2} label="Delivered" color={C.green} />
          <StatCard value={0} label="Issues" color={C.red} />
        </div>
        {deliveries.map(d => (
          <div key={d.id} style={{ background: C.cardBg, borderRadius: 16, padding: 14, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, color: C.navy }}>{d.patient} <span style={{ color: C.textMuted, fontWeight: 500 }}>({d.token})</span></div>
                <div style={{ fontSize: 13, color: C.textMuted }}>{partnerIcon[d.partner]} {d.partner} • {d.area}</div>
              </div>
              {d.step === 3 && <span style={{ background: "#E8F5E0", color: C.green, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>Delivered ✓</span>}
            </div>
            {/* Steps */}
            <div style={{ display: "flex", alignItems: "center", gap: 0, marginTop: 14 }}>
              {DELIVERY_STEPS.map((s, i) => (
                <span key={s} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 14, background: i <= d.step ? C.amber : C.border, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontSize: 13, fontWeight: 700 }}>{i <= d.step ? "✓" : i + 1}</div>
                    <div style={{ fontSize: 9, color: i === d.step ? C.amber : C.textMuted, fontWeight: i === d.step ? 700 : 400, textAlign: "center", marginTop: 4, lineHeight: 1.2 }}>{s}</div>
                  </div>
                  {i < DELIVERY_STEPS.length - 1 && <div style={{ height: 2, flex: 0.3, background: i < d.step ? C.amber : C.border, marginBottom: 16 }} />}
                </span>
              ))}
            </div>
            {d.step < 3 && (
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <Btn label={`→ ${DELIVERY_STEPS[d.step + 1]}`} onClick={() => advance(d.id)} bg={C.green} style={{ flex: 1 }} />
                <Btn label="⚠ Issue" onClick={() => alert("Issue report kiya gaya")} bg={C.red} style={{ padding: "12px 16px" }} />
              </div>
            )}
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
        {/* Header Card */}
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
        {/* Outstanding */}
        {patient.balance > 0 && (
          <div style={{ background: "#FDECEA", borderRadius: 14, padding: 14, border: `1px solid ${C.red}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 700, color: C.red }}>⚠ Outstanding Balance</div>
            <div style={{ fontWeight: 800, fontSize: 20, color: C.red }}>₹{patient.balance}</div>
          </div>
        )}
        {/* Details */}
        <div style={{ background: C.cardBg, borderRadius: 14, padding: 14, border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "Chief Complaint", value: patient.complaint },
            { label: "Mobile", value: patient.mobile },
            { label: "Address", value: patient.address },
            { label: "Branch", value: patient.branch },
          ].map(r => (
            <div key={r.label} style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: C.textMuted }}>{r.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.navy, textAlign: "right", maxWidth: "60%" }}>{r.value}</span>
            </div>
          ))}
        </div>
        {/* Visit stats */}
        <div style={{ display: "flex", gap: 8 }}>
          <StatCard value={patient.visits} label="Total Visits" />
          <StatCard value={patient.lastVisit} label="Last Visit" />
        </div>
        {/* Family members */}
        <div style={{ background: C.cardBg, borderRadius: 14, padding: 14, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 1, marginBottom: 8 }}>FAMILY MEMBERS</div>
          <div style={{ color: C.textMuted, fontSize: 13, fontStyle: "italic" }}>Is number pe koi aur family member nahi mila</div>
        </div>
        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {patient.balance > 0 && <Btn label="₹ Payment Collect Karo" onClick={() => onPayment(patient)} bg={C.green} style={{ width: "100%", padding: "14px" }} />}
          <Btn label="+ Queue Mein Add Karo" onClick={() => alert("Queue mein add kar diya!")} bg={C.navy} style={{ width: "100%", padding: "14px" }} />
          <Btn label="💬 WhatsApp Bhejo" onClick={() => alert("WhatsApp open ho raha hai")} bg={C.amber} color={C.navy} style={{ width: "100%", padding: "14px" }} />
        </div>
      </div>
    </div>
  );
};

// ─── Screen: Appointments ─────────────────────────────────────────────────────
const AppointmentsScreen = ({ onNav }: { onNav: (s: Screen) => void }) => {
  const [dayFilter, setDayFilter] = useState("Today");
  const [showForm, setShowForm] = useState(false);
  const [newAppt, setNewAppt] = useState({ name: "", mobile: "", time: "", branch: "", reason: "" });
  const statusColor: Record<string, string> = { Confirmed: C.green, Pending: C.amber, Cancelled: C.red };
  const statusBg: Record<string, string> = { Confirmed: "#E8F5E0", Pending: "#FFF3DC", Cancelled: "#FDECEA" };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Appointments" sub="Bajaj Nagar + Jagatpura" onBack={() => onNav("tasks")} action={
        <button onClick={() => setShowForm(true)} style={{ background: C.amber, border: "none", borderRadius: 20, padding: "8px 14px", color: C.navy, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Book</button>
      } />
      <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["Today", "Tomorrow", "This Week"].map(d => <Chip key={d} label={d} selected={dayFilter === d} onClick={() => setDayFilter(d)} />)}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <StatCard value={4} label="Total" />
          <StatCard value={2} label="Confirmed" color={C.green} />
          <StatCard value={1} label="Pending" color={C.amber} />
        </div>
        {APPOINTMENTS.map(a => (
          <div key={a.id} style={{ background: C.cardBg, borderRadius: 14, padding: 14, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: C.navy }}>{a.time}</div>
              <span style={{ background: statusBg[a.status], color: statusColor[a.status], borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{a.status}</span>
            </div>
            <div style={{ fontWeight: 700, color: C.navy, marginTop: 6 }}>{a.name}</div>
            <div style={{ fontSize: 13, color: C.textMuted }}>{a.mobile} • {a.reason}</div>
            <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{a.branch}</div>
            {a.status === "Pending" && (
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <Btn label="✓ Confirm" onClick={() => alert("Confirmed!")} bg={C.green} style={{ flex: 1, padding: "8px" }} />
                <Btn label="✗ Cancel" onClick={() => alert("Cancelled")} bg={C.red} style={{ flex: 1, padding: "8px" }} />
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Booking Form Modal */}
      {showForm && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", zIndex: 100 }}>
          <div style={{ background: C.cream, borderRadius: "20px 20px 0 0", padding: 20, width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: C.navy }}>Naya Appointment Book Karo</div>
            {[
              { placeholder: "Patient Name *", field: "name" },
              { placeholder: "Mobile Number *", field: "mobile" },
              { placeholder: "Reason / Complaint", field: "reason" },
            ].map(f => (
              <input key={f.field} placeholder={f.placeholder} value={(newAppt as any)[f.field]} onChange={e => setNewAppt(a => ({ ...a, [f.field]: e.target.value }))}
                style={{ padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.cardBg, fontSize: 14, color: C.navy, outline: "none" }} />
            ))}
            <select value={newAppt.time} onChange={e => setNewAppt(a => ({ ...a, time: e.target.value }))} style={{ padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.cardBg, fontSize: 14, color: C.navy }}>
              <option value="">Time Slot Chuniye</option>
              {["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "2:00 PM", "2:30 PM", "3:00 PM"].map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={newAppt.branch} onChange={e => setNewAppt(a => ({ ...a, branch: e.target.value }))} style={{ padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.cardBg, fontSize: 14, color: C.navy }}>
              <option value="">Branch Chuniye</option>
              <option>Bajaj Nagar</option>
              <option>Jagatpura</option>
            </select>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn label="Book Karo ✓" onClick={() => { alert("Appointment book ho gayi! WhatsApp confirm bhej diya."); setShowForm(false); }} bg={C.green} style={{ flex: 1 }} />
              <Btn label="Cancel" onClick={() => setShowForm(false)} bg="#888" style={{ flex: 1 }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Screen: Daily Summary ────────────────────────────────────────────────────
const DailySummaryScreen = ({ onNav }: { onNav: (s: Screen) => void }) => {
  const stats = [
    { label: "Total Patients Seen", value: "6", icon: "👥" },
    { label: "Naye Registrations", value: "2", icon: "🆕" },
    { label: "Cash Collection", value: "₹950", icon: "💵" },
    { label: "UPI Collection", value: "₹600", icon: "📱" },
    { label: "Card Collection", value: "₹300", icon: "💳" },
    { label: "Outstanding Added", value: "₹800", icon: "⏳" },
    { label: "Deliveries Done", value: "2", icon: "🚚" },
    { label: "Leads Received", value: "3", icon: "👀" },
    { label: "Follow-up Calls", value: "5", icon: "📞" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Day Summary" sub="Fri, 17 Jul 2026" onBack={() => onNav("tasks")} />
      <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ background: C.navy, borderRadius: 16, padding: 18, color: C.white, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Total Revenue Today</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: C.amber, margin: "4px 0" }}>₹1,850</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Bajaj Nagar + Jagatpura</div>
        </div>
        {stats.map(s => (
          <div key={s.label} style={{ background: C.cardBg, borderRadius: 14, padding: "14px 16px", border: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <span style={{ fontSize: 14, color: C.navy }}>{s.label}</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 16, color: C.navy }}>{s.value}</span>
          </div>
        ))}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
          <Btn label="📤 Owner ko WhatsApp Bhejo" onClick={() => alert("Summary Dr. Yadav ko bhej di gayi!")} bg={C.green} style={{ width: "100%", padding: "15px" }} />
          <Btn label="🖨 Print / Share" onClick={() => alert("Print preview khul raha hai")} bg={C.navy} style={{ width: "100%", padding: "15px" }} />
        </div>
      </div>
    </div>
  );
};

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("queue");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const navTo = (s: Screen) => setScreen(s);

  const goPatient = (p: Patient) => {
    setSelectedPatient(p);
    setScreen("patient_profile");
  };

  const goPayment = (p: Patient) => {
    setSelectedPatient(p);
    setScreen("payment");
  };

  const render = () => {
    switch (screen) {
      case "queue": return <QueueScreen onNav={navTo} onPatient={goPatient} />;
      case "register": return <RegisterScreen onNav={navTo} onSuccess={() => setScreen("success")} />;
      case "success": return <SuccessScreen onNav={navTo} />;
      case "search": return <SearchScreen onNav={navTo} onPatient={goPatient} />;
      case "tasks": return <TasksScreen onNav={navTo} />;
      case "payment": return <PaymentScreen patient={selectedPatient} onNav={navTo} />;
      case "followup": return <FollowUpScreen onNav={navTo} />;
      case "leads": return <LeadsScreen onNav={navTo} />;
      case "delivery": return <DeliveryScreen onNav={navTo} />;
      case "patient_profile": return <PatientProfileScreen patient={selectedPatient} onNav={navTo} onPayment={goPayment} />;
      case "appointments": return <AppointmentsScreen onNav={navTo} />;
      case "daily_summary": return <DailySummaryScreen onNav={navTo} />;
      default: return <QueueScreen onNav={navTo} onPatient={goPatient} />;
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
