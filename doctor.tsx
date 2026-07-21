import { useState } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// CONFIG — Owner yahan se sab edit kar sakta hai (baad mein DB se aayega)
// ═══════════════════════════════════════════════════════════════════════════
const CONFIG = {
  prescribingDoctors: [
    { id: "dr1", name: "Dr. Anavil Yadav", tag: "Owner" },
    { id: "dr2", name: "Dr. T. P. Yadav", tag: "Senior" },
    { id: "dr3", name: "Backup Doctor", tag: "Time-bound" },
  ],
  medicines: ["Sulphur", "Nux Vomica", "Pulsatilla", "Lycopodium", "Calcarea Carb", "Arsenicum", "Bryonia", "Rhus Tox", "Belladonna", "Sepia", "Natrum Mur", "Phosphorus", "Ignatia", "Lachesis", "Mercurius", "Thuja", "Silicea", "Apis", "Aconite", "Hepar Sulph"],
  potencies: ["6C", "30C", "200C", "1M", "10M", "CM", "3X", "6X", "Q"],
  doseForms: ["Globules", "Drops", "Tablets", "Powder"],
  frequencies: ["OD", "BD", "TDS", "Weekly", "Fortnightly", "Monthly", "SOS"],
  anupan: ["Water", "Milk", "Empty stomach"],
  nextVisit: ["1 week", "2 weeks", "1 month", "6 weeks", "2 months", "3 months"],
  outcomes: ["Major improvement", "Moderate", "Stable", "Aggravation", "Worse", "New patient"],
  defaultCharges: 300,
  chargesWarnDiff: 100,
};

const C = {
  cream: "#F5DEB3", navy: "#1A2A41", amber: "#D4A04A", green: "#5B8A2D",
  red: "#C0392B", white: "#FFFFFF", cardBg: "#FDF6E3", softAmber: "#EFE0BD",
  textMuted: "#6B5E4E", border: "#E8D5A3",
};

type Role = "" | "rx" | "case";
type RxScreen = "queue" | "consult" | "history" | "dashboard";
type CaseScreen = "board" | "form" | "reference";

// ─── Dummy Data ─────────────────────────────────────────────────────────────
const RX_QUEUE = [
  { token: "T-01", name: "Ramesh Sharma", age: 54, gender: "Male", complaint: "Knee pain (chronic)", caseBy: "Dr. Priya (Case)", visit: 8, lastRx: "Rhus Tox 200C", vip: false },
  { token: "T-03", name: "Aarav Gupta", age: 22, gender: "Male", complaint: "Skin allergy", caseBy: "Dr. Amit (Case)", visit: 1, lastRx: "New patient", vip: false },
  { token: "T-06", name: "Neha Jain", age: 31, gender: "Female", complaint: "Anxiety / sleep issues", caseBy: "Dr. Priya (Case)", visit: 2, lastRx: "Ignatia 30C", vip: true },
  { token: "T-08", name: "Sanjay Rao", age: 45, gender: "Male", complaint: "Migraine", caseBy: "Dr. Amit (Case)", visit: 4, lastRx: "Nux Vomica 200C", vip: false },
];

const HISTORY = [
  { date: "20 Jun 2026", med: "Rhus Tox", potency: "200C", outcome: "Moderate improvement", notes: "Stiffness kam hui, subah behtar" },
  { date: "5 Jun 2026", med: "Bryonia", potency: "30C", outcome: "Stable", notes: "Koi aggravation nahi, continue" },
  { date: "18 May 2026", med: "Calcarea Carb", potency: "200C", outcome: "Major improvement", notes: "Dard 60% kam" },
  { date: "2 May 2026", med: "Rhus Tox", potency: "30C", outcome: "New patient", notes: "Pehla consult, 3 saal purana knee pain" },
];

// FIX 1: Case-DR ko naam + marital + job dikhta hai — sirf mobile/contact hidden
const CASE_BOARD = [
  { token: "T-02", name: "Sunita Verma", age: 38, gender: "Female", marital: "Married", job: "Teacher", complaint: "Migraine", status: "Pending" },
  { token: "T-05", name: "Mohan Lal", age: 62, gender: "Male", marital: "Married", job: "Retired", complaint: "Hypertension", status: "In Progress" },
  { token: "T-07", name: "Kavita Singh", age: 28, gender: "Female", marital: "Single", job: "Software Engineer", complaint: "Hair fall", status: "Submitted" },
  { token: "T-09", name: "Rajesh Kumar", age: 50, gender: "Male", marital: "Married", job: "Shopkeeper", complaint: "Joint pain", status: "Pending" },
];

// ─── Shared UI ──────────────────────────────────────────────────────────────
const TopBar = ({ title, sub, onBack, action }: any) => (
  <div style={{ background: C.navy, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0, borderRadius: "0 0 18px 18px" }}>
    {onBack && <button onClick={onBack} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 999, width: 38, height: 38, color: C.white, fontSize: 17, cursor: "pointer" }}>←</button>}
    <div style={{ flex: 1 }}>
      <div style={{ color: C.white, fontWeight: 700, fontSize: 17 }}>{title}</div>
      {sub && <div style={{ color: "rgba(255,255,255,.6)", fontSize: 12 }}>{sub}</div>}
    </div>
    {action}
  </div>
);

const Stat = ({ v, l, color }: any) => (
  <div style={{ flex: 1, background: C.cardBg, borderRadius: 14, padding: "12px 6px", textAlign: "center", border: `1px solid ${C.border}` }}>
    <div style={{ fontSize: 20, fontWeight: 800, color: color || C.navy }}>{v}</div>
    <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: .5, marginTop: 2 }}>{l}</div>
  </div>
);

const Chip = ({ label, on, onClick, small }: any) => (
  <button onClick={onClick} style={{ padding: small ? "6px 12px" : "8px 15px", borderRadius: 999, border: `1.5px solid ${on ? C.navy : C.border}`, background: on ? C.navy : C.cardBg, color: on ? C.white : C.navy, fontSize: small ? 12 : 13, fontWeight: on ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap" }}>{label}</button>
);

const Btn = ({ label, onClick, bg, color, style }: any) => (
  <button onClick={onClick} style={{ padding: "13px 16px", borderRadius: 999, background: bg, color: color || C.white, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", ...style }}>{label}</button>
);

const Badge = ({ text, bg, color }: any) => (
  <span style={{ background: bg, color, borderRadius: 999, padding: "4px 11px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>{text}</span>
);

const Scroll = ({ children }: any) => (
  <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 11 }}>{children}</div>
);

const Label = ({ t }: any) => <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: .6, textTransform: "uppercase", marginBottom: 7 }}>{t}</div>;

const ChipRow = ({ opts, sel, onSel, multi, small }: any) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
    {opts.map((o: string) => {
      const on = multi ? sel.includes(o) : sel === o;
      return <Chip key={o} label={o} on={on} small={small} onClick={() => onSel(o)} />;
    })}
  </div>
);

// ─── Login — FIX 2: Multiple prescribing doctors (config se) ────────────────
const Login = ({ pick }: { pick: (r: Role, doc?: string) => void }) => (
  <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.cream }}>
    <div style={{ background: C.navy, padding: "26px 20px 22px", borderRadius: "0 0 22px 22px", textAlign: "center" }}>
      <div style={{ width: 60, height: 60, borderRadius: 999, background: C.amber, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: C.navy, fontSize: 25, margin: "0 auto 12px" }}>Y</div>
      <div style={{ color: C.white, fontWeight: 800, fontSize: 20 }}>Yadav Homeo Clinic</div>
      <div style={{ color: "rgba(255,255,255,.6)", fontSize: 13, marginTop: 3 }}>Doctor App • Jaipur</div>
    </div>
    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, padding: "20px 22px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 1 }}>PRESCRIBING DOCTORS</div>
      {CONFIG.prescribingDoctors.map(d => (
        <button key={d.id} onClick={() => pick("rx", d.name)} style={{ background: C.navy, color: C.white, border: "none", borderRadius: 18, padding: "18px 20px", cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>{d.name}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", marginTop: 2 }}>Prescribing authority</div>
          </div>
          <Badge text={d.tag} bg={C.amber} color={C.navy} />
        </button>
      ))}
      <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 1, marginTop: 8 }}>CASE TAKING</div>
      <button onClick={() => pick("case")} style={{ background: C.amber, color: C.navy, border: "none", borderRadius: 18, padding: "18px 20px", cursor: "pointer", textAlign: "left" }}>
        <div style={{ fontSize: 17, fontWeight: 800 }}>Case Taking Doctor</div>
        <div style={{ fontSize: 12, color: "rgba(26,42,65,.7)", marginTop: 2 }}>Case lena • Prescribe nahi kar sakte</div>
      </button>
      <div style={{ textAlign: "center", color: C.textMuted, fontSize: 11, marginTop: 6 }}>Prototype — password baad mein aayega • Doctor list Owner edit kar sakta hai</div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// PRESCRIBING DOCTOR
// ═══════════════════════════════════════════════════════════════════════════
const RX_NAV = [
  { k: "queue", i: "📋", l: "Queue" },
  { k: "history", i: "🕐", l: "History" },
  { k: "dashboard", i: "📊", l: "Dashboard" },
];

const RxNav = ({ cur, go }: any) => (
  <div style={{ display: "flex", background: C.cardBg, borderTop: `1px solid ${C.border}`, flexShrink: 0, paddingBottom: 4 }}>
    {RX_NAV.map(n => {
      const on = cur === n.k;
      return (
        <button key={n.k} onClick={() => go(n.k)} style={{ flex: 1, padding: "8px 0", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{ width: 40, height: 40, borderRadius: 999, background: on ? C.amber : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{n.i}</div>
          <span style={{ fontSize: 11, color: on ? C.navy : C.textMuted, fontWeight: on ? 700 : 500 }}>{n.l}</span>
        </button>
      );
    })}
  </div>
);

const RxQueue = ({ doctor, go, open, logout }: any) => (
  <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
    <TopBar title="OPD Queue" sub={`${doctor} • Case done, Rx baaki`} action={
      <button onClick={logout} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 999, padding: "8px 14px", color: C.white, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Logout</button>
    } />
    <Scroll>
      <div style={{ display: "flex", gap: 7 }}>
        <Stat v={4} l="Rx Baaki" color={C.amber} /><Stat v={7} l="Aaj Ho Gaye" color={C.green} /><Stat v="6 min" l="Avg / Patient" />
      </div>
      {RX_QUEUE.map(p => (
        <div key={p.token} onClick={() => open(p)} style={{ background: C.cardBg, borderRadius: 18, padding: 15, border: `1px solid ${C.border}`, cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Badge text={p.token} bg={C.navy} color={C.white} />
              <span style={{ fontWeight: 700, fontSize: 16, color: C.navy }}>{p.name}</span>
              {p.vip && <Badge text="VIP" bg="#FDECEA" color={C.red} />}
            </div>
            <span style={{ fontSize: 12, color: C.textMuted }}>{p.age}y • {p.gender}</span>
          </div>
          <div style={{ fontSize: 14, color: C.navy, marginTop: 6 }}>{p.complaint}</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: C.textMuted }}>
            <span>Case: {p.caseBy}</span>
            <span>Visit #{p.visit}</span>
          </div>
        </div>
      ))}
    </Scroll>
    <RxNav cur="queue" go={go} />
  </div>
);

const RxConsult = ({ patient, doctor, go }: any) => {
  const [med, setMed] = useState("");
  const [search, setSearch] = useState("");
  const [potency, setPotency] = useState("");
  const [doseForm, setDoseForm] = useState("");
  const [dose, setDose] = useState(1);
  const [freq, setFreq] = useState("");
  const [anupan, setAnupan] = useState("");
  const [showMed2, setShowMed2] = useState(false);
  const [slx, setSlx] = useState(true);
  const [nextVisit, setNextVisit] = useState("");
  const [outcome, setOutcome] = useState("");
  const [charges, setCharges] = useState(CONFIG.defaultCharges);
  const [hasRubrics, setHasRubrics] = useState(false);

  const filtered = search ? CONFIG.medicines.filter(m => m.toLowerCase().includes(search.toLowerCase())) : [];

  const submit = () => {
    if (!med) { alert("Medicine chuniye pehle"); return; }
    if (!potency) { alert("Potency chuniye pehle"); return; }
    if (!hasRubrics) { alert("Rubrics photo zaroori hai — bina iske submit nahi hoga"); return; }
    alert("✓ Prescription submit ho gaya! Pharmacy queue mein chala gaya.");
    go("queue");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Consultation" sub={doctor} onBack={() => go("queue")} />
      <Scroll>
        <div style={{ background: C.navy, borderRadius: 16, padding: 15, color: C.white }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 800, fontSize: 17 }}>{patient?.name || "Ramesh Sharma"}</span>
            <Badge text={patient?.token || "T-01"} bg={C.amber} color={C.navy} />
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", marginTop: 4 }}>{patient?.age || 54}y • {patient?.gender || "Male"} • Visit #{patient?.visit || 8}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>Last Rx: {patient?.lastRx || "Rhus Tox 200C"}</div>
        </div>

        <div style={{ background: C.softAmber, borderRadius: 14, padding: 13 }}>
          <Label t="Case Summary (Case-DR se)" />
          <div style={{ fontSize: 13.5, color: C.navy, lineHeight: 1.5 }}>Chilly patient, thirstless. Knee stiffness subah aur cold-damp weather mein zyada, continued motion se behtar. Health anxiety. Past: recurrent joint issues.</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <div style={{ flex: 1, background: C.cardBg, borderRadius: 10, padding: 10, textAlign: "center", fontSize: 12, color: C.textMuted, cursor: "pointer" }} onClick={() => alert("Case paper photo khul gayi")}>📄 Case Paper</div>
            <div style={{ flex: 1, background: C.cardBg, borderRadius: 10, padding: 10, textAlign: "center", fontSize: 12, color: C.textMuted, cursor: "pointer" }} onClick={() => alert("Saari files reverse order mein — reports alag category")}>🗂 All Files</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          {["✨ Suggest Remedy", "? Ask Question", "👥 Similar Cases", "↩ Recase Bhejo"].map(a => (
            <button key={a} onClick={() => a.includes("Recase") ? alert("Recase schedule ho gaya — patient ko inform kar diya jaayega") : alert(`AI: ${a}`)} style={{ padding: "9px 14px", borderRadius: 999, border: `1.5px solid ${a.includes("Recase") ? C.red : C.amber}`, background: a.includes("Recase") ? "#FDECEA" : "#FBEDD2", color: a.includes("Recase") ? C.red : "#9A7B23", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>{a}</button>
          ))}
        </div>

        <div style={{ background: C.cardBg, borderRadius: 16, padding: 15, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: C.navy }}>Medicine 1</div>
          <div>
            <Label t="Medicine (type karke search karo)" />
            <input value={med || search} onChange={e => { setSearch(e.target.value); setMed(""); }} placeholder="jaise: Rhus Tox"
              style={{ width: "100%", padding: 13, borderRadius: 12, border: "none", background: C.softAmber, fontSize: 14, color: C.navy, boxSizing: "border-box", outline: "none" }} />
            {filtered.length > 0 && !med && (
              <div style={{ background: C.white, borderRadius: 12, marginTop: 6, maxHeight: 160, overflowY: "auto", border: `1px solid ${C.border}` }}>
                {filtered.map(m => (
                  <div key={m} onClick={() => { setMed(m); setSearch(""); }} style={{ padding: "11px 14px", fontSize: 14, color: C.navy, cursor: "pointer", borderBottom: `1px solid ${C.border}` }}>{m}</div>
                ))}
              </div>
            )}
          </div>
          <div><Label t="Potency" /><ChipRow small opts={CONFIG.potencies} sel={potency} onSel={setPotency} /></div>
          <div><Label t="Dose Form" /><ChipRow small opts={CONFIG.doseForms} sel={doseForm} onSel={setDoseForm} /></div>
          <div>
            <Label t="Dose (drams)" />
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button onClick={() => setDose(Math.max(1, dose - 1))} style={{ width: 40, height: 40, borderRadius: 999, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 20, cursor: "pointer", color: C.navy }}>−</button>
              <span style={{ fontSize: 20, fontWeight: 800, color: C.navy, minWidth: 30, textAlign: "center" }}>{dose}</span>
              <button onClick={() => setDose(dose + 1)} style={{ width: 40, height: 40, borderRadius: 999, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 20, cursor: "pointer", color: C.navy }}>+</button>
            </div>
          </div>
          <div><Label t="Frequency" /><ChipRow small opts={CONFIG.frequencies} sel={freq} onSel={setFreq} /></div>
          <div><Label t="Anupan (optional)" /><ChipRow small opts={CONFIG.anupan} sel={anupan} onSel={setAnupan} /></div>
        </div>

        {!showMed2
          ? <Btn label="+ Doosri Medicine Add Karo" onClick={() => setShowMed2(true)} bg={C.softAmber} color={C.navy} style={{ width: "100%" }} />
          : <div style={{ background: C.cardBg, borderRadius: 16, padding: 15 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: C.navy, marginBottom: 10 }}>Medicine 2</div>
              <input placeholder="Medicine ka naam" style={{ width: "100%", padding: 13, borderRadius: 12, border: "none", background: C.softAmber, fontSize: 14, color: C.navy, boxSizing: "border-box", outline: "none" }} />
            </div>
        }

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: C.cardBg, borderRadius: 14, padding: 14 }}>
          <div>
            <div style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>SLX (Placebo Globules)</div>
            <div style={{ fontSize: 12, color: C.textMuted }}>Sac lac remedy ke saath</div>
          </div>
          <div onClick={() => setSlx(!slx)} style={{ width: 52, height: 30, borderRadius: 999, background: slx ? C.green : "#ccc", cursor: "pointer", position: "relative" }}>
            <div style={{ position: "absolute", top: 3, left: slx ? 25 : 3, width: 24, height: 24, borderRadius: 999, background: C.white, transition: "left .2s" }} />
          </div>
        </div>

        <div>
          <Label t="Next Visit" />
          <select value={nextVisit} onChange={e => setNextVisit(e.target.value)} style={{ width: "100%", padding: 13, borderRadius: 12, border: "none", background: C.cardBg, fontSize: 14, color: C.navy }}>
            <option value="">Follow-up period chuniye</option>
            {CONFIG.nextVisit.map(x => <option key={x}>{x}</option>)}
          </select>
          {nextVisit && <div style={{ fontSize: 12, color: C.green, fontWeight: 600, marginTop: 6 }}>📅 Next visit approx: {nextVisit === "1 week" ? "25 Jul 2026" : nextVisit === "2 weeks" ? "1 Aug 2026" : nextVisit === "1 month" ? "18 Aug 2026" : "baad mein"}</div>}
        </div>

        <div><Label t="Outcome (pichli visit)" /><ChipRow small opts={CONFIG.outcomes} sel={outcome} onSel={setOutcome} /></div>

        <div><Label t="Clinical Notes" />
          <textarea placeholder="Observations, reasoning, plan..." rows={3} style={{ width: "100%", padding: 13, borderRadius: 12, border: "none", background: C.cardBg, fontSize: 14, color: C.navy, resize: "none", boxSizing: "border-box", outline: "none" }} /></div>

        <div>
          <Label t="Charges (₹) — auto, doctor change kar sakta hai" />
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={() => setCharges(Math.max(0, charges - 50))} style={{ width: 40, height: 40, borderRadius: 999, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 20, cursor: "pointer", color: C.navy }}>−</button>
            <span style={{ fontSize: 20, fontWeight: 800, color: C.navy, minWidth: 70, textAlign: "center" }}>₹{charges}</span>
            <button onClick={() => setCharges(charges + 50)} style={{ width: 40, height: 40, borderRadius: 999, border: `1.5px solid ${C.border}`, background: C.white, fontSize: 20, cursor: "pointer", color: C.navy }}>+</button>
          </div>
          {Math.abs(charges - CONFIG.defaultCharges) > CONFIG.chargesWarnDiff && <div style={{ fontSize: 12, color: C.red, fontWeight: 600, marginTop: 6 }}>⚠ Standard ₹{CONFIG.defaultCharges} se ₹{CONFIG.chargesWarnDiff}+ ka difference hai — bypass allowed</div>}
        </div>

        <div onClick={() => setHasRubrics(true)} style={{ background: hasRubrics ? "#E8F5E0" : "#FDECEA", borderRadius: 14, padding: 16, textAlign: "center", cursor: "pointer", border: `1.5px dashed ${hasRubrics ? C.green : C.red}` }}>
          <div style={{ fontSize: 24 }}>{hasRubrics ? "✓" : "📷"}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: hasRubrics ? C.green : C.red, marginTop: 4 }}>{hasRubrics ? "Rubrics photo ho gayi" : "Rubrics Photo (zaroori)"}</div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{hasRubrics ? "Dobara lene ke liye tap karo" : "📷 Click ya 📠 Scan — bina iske submit nahi hoga"}</div>
        </div>

        <Btn label="✓ Prescription Submit Karo" onClick={submit} bg={C.green} style={{ width: "100%", padding: 16, fontSize: 15 }} />
        <Btn label="Draft Save Karo" onClick={() => alert("Draft save ho gaya")} bg={C.cardBg} color={C.navy} style={{ width: "100%", border: `1.5px solid ${C.border}` }} />
        <div style={{ height: 8 }} />
      </Scroll>
    </div>
  );
};

const RxHistory = ({ go }: any) => {
  const [f, setF] = useState("Sab");
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Patient History" sub="Ramesh Sharma • T-01" onBack={() => go("queue")} />
      <Scroll>
        <div style={{ display: "flex", gap: 7, overflowX: "auto" }}>
          {["Sab", "Last 3 months", "Last 6 months"].map(x => <Chip key={x} label={x} on={f === x} onClick={() => setF(x)} />)}
        </div>
        {HISTORY.map((h, i) => (
          <div key={i} style={{ background: C.cardBg, borderRadius: 16, padding: 15, borderLeft: `4px solid ${C.amber}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>{h.med} {h.potency}</span>
              <span style={{ fontSize: 12, color: C.textMuted }}>{h.date}</span>
            </div>
            <div style={{ fontSize: 13, color: C.green, fontWeight: 600, marginTop: 4 }}>{h.outcome}</div>
            <div style={{ fontSize: 13, color: C.textMuted, marginTop: 3 }}>{h.notes}</div>
            <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
              <div style={{ background: C.softAmber, borderRadius: 8, padding: "6px 10px", fontSize: 11, color: C.navy, cursor: "pointer" }} onClick={() => alert("Rx photo")}>📄 Rx photo</div>
              <div style={{ background: C.softAmber, borderRadius: 8, padding: "6px 10px", fontSize: 11, color: C.navy, cursor: "pointer" }} onClick={() => alert("Reports alag category mein")}>📋 Reports</div>
            </div>
          </div>
        ))}
      </Scroll>
      <RxNav cur="history" go={go} />
    </div>
  );
};

const RxDashboard = ({ doctor, go }: any) => {
  const [showRev, setShowRev] = useState(false);
  const conditions = [["Joint pain", 24], ["Skin issues", 18], ["Anxiety", 15], ["Migraine", 12], ["PCOS", 9]] as [string, number][];
  const max = 24;
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Doctor Dashboard" sub={doctor} />
      <Scroll>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 1 }}>AAJ</div>
        <div style={{ display: "flex", gap: 7 }}>
          <Stat v={7} l="Dekhe" /><Stat v={2} l="Naye Case" /><Stat v={5} l="Follow-ups" /><Stat v="6m" l="Avg Time" />
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 1, marginTop: 4 }}>IS MAHINE</div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}><Stat v={142} l="Total Patients" /></div>
          <div style={{ flex: 1, background: C.cardBg, borderRadius: 14, padding: "12px 6px", textAlign: "center", border: `1px solid ${C.border}`, cursor: "pointer" }} onClick={() => setShowRev(!showRev)}>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.amber, filter: showRev ? "none" : "blur(8px)" }}>₹1.2L</div>
            <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 700, textTransform: "uppercase", marginTop: 2 }}>Revenue {showRev ? "👁" : "🙈"}</div>
          </div>
        </div>
        <div style={{ background: C.cardBg, borderRadius: 16, padding: 15 }}>
          <Label t="Top Conditions — Is Mahine" />
          {conditions.map(([name, val]) => (
            <div key={name} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.navy, marginBottom: 4 }}><span>{name}</span><span style={{ fontWeight: 700 }}>{val}</span></div>
              <div style={{ height: 8, borderRadius: 999, background: C.softAmber }}><div style={{ height: 8, borderRadius: 999, background: C.amber, width: `${(val / max) * 100}%` }} /></div>
            </div>
          ))}
        </div>
        <div style={{ background: C.cardBg, borderRadius: 16, padding: 15 }}>
          <Label t="Outcome Summary" />
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1, textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 800, color: C.green }}>68%</div><div style={{ fontSize: 11, color: C.textMuted }}>Improved</div></div>
            <div style={{ flex: 1, textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 800, color: C.amber }}>24%</div><div style={{ fontSize: 11, color: C.textMuted }}>Stable</div></div>
            <div style={{ flex: 1, textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 800, color: C.red }}>8%</div><div style={{ fontSize: 11, color: C.textMuted }}>Worse</div></div>
          </div>
        </div>
        <div style={{ background: "#FBEDD2", borderRadius: 14, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, color: "#9A7B23", fontSize: 14 }}>Rx ke intezaar mein cases</span>
          <Badge text="4 baaki" bg={C.amber} color={C.navy} />
        </div>
      </Scroll>
      <RxNav cur="dashboard" go={go} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// CASE-TAKING DOCTOR — FIX 1: naam+details dikhte hain, sirf contact hidden
// ═══════════════════════════════════════════════════════════════════════════
const CaseBoard = ({ go, open, logout }: any) => (
  <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
    <TopBar title="My Cases" sub="Contact details hidden 🔒" action={
      <button onClick={logout} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 999, padding: "8px 14px", color: C.white, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Logout</button>
    } />
    <Scroll>
      <div style={{ display: "flex", gap: 7 }}>
        <Stat v={4} l="Aaj Assigned" /><Stat v={1} l="Submit Ho Gaye" color={C.green} /><Stat v={2} l="Baaki" color={C.amber} />
      </div>
      <div style={{ background: "#FBEDD2", borderRadius: 12, padding: 11, fontSize: 12, color: "#9A7B23" }}>
        🔒 Mobile number aur contact details hidden hain. Naam, age, marital status aur job dikhti hai. Fresh case lena hai — purana prescription nahi dikhega.
      </div>
      {CASE_BOARD.map(c => {
        const sc: any = { Pending: { bg: "#FBEDD2", c: "#9A7B23" }, "In Progress": { bg: "#E0EBF5", c: C.navy }, Submitted: { bg: "#E8F5E0", c: C.green } };
        return (
          <div key={c.token} onClick={() => c.status !== "Submitted" && open(c)} style={{ background: C.cardBg, borderRadius: 18, padding: 15, border: `1px solid ${C.border}`, cursor: c.status !== "Submitted" ? "pointer" : "default", opacity: c.status === "Submitted" ? .7 : 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Badge text={c.token} bg={C.navy} color={C.white} />
                <span style={{ fontWeight: 700, fontSize: 15, color: C.navy }}>{c.name}</span>
              </div>
              <Badge text={c.status} bg={sc[c.status].bg} color={sc[c.status].c} />
            </div>
            <div style={{ fontSize: 13, color: C.textMuted, marginTop: 6 }}>{c.age}y • {c.gender} • {c.marital} • {c.job}</div>
            <div style={{ fontSize: 13.5, color: C.navy, marginTop: 2 }}>{c.complaint}</div>
          </div>
        );
      })}
    </Scroll>
  </div>
);

const CaseForm = ({ caseData, go }: any) => {
  const [hasPhoto, setHasPhoto] = useState(false);
  const [thermals, setThermals] = useState("");
  const [thirst, setThirst] = useState("");
  const [sleep, setSleep] = useState("");
  const [appetite, setAppetite] = useState("");
  const [sweat, setSweat] = useState("");
  const [mentals, setMentals] = useState<string[]>([]);
  const [worse, setWorse] = useState<string[]>([]);
  const [better, setBetter] = useState<string[]>([]);
  const toggle = (arr: string[], set: any, v: string) => set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  const submit = () => {
    if (!hasPhoto) { alert("Case paper photo zaroori hai — bina iske submit nahi hoga"); return; }
    if (window.confirm("Case Dr. ko submit karein? Submit ke baad edit nahi hoga.")) {
      alert("✓ Case submit ho gaya! Prescribing doctor ki queue mein chala gaya.");
      go("board");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Case Taking" sub={`${caseData?.token || "T-02"} • Contact hidden 🔒`} onBack={() => go("board")} />
      <Scroll>
        <div style={{ background: C.navy, borderRadius: 16, padding: 15, color: C.white, textAlign: "center" }}>
          <Badge text={caseData?.token || "T-02"} bg={C.amber} color={C.navy} />
          <div style={{ fontSize: 18, fontWeight: 800, marginTop: 8 }}>{caseData?.name || "Sunita Verma"}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", marginTop: 2 }}>{caseData?.age || 38}y • {caseData?.gender || "Female"} • {caseData?.marital || "Married"} • {caseData?.job || "Teacher"}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)" }}>{caseData?.complaint || "Migraine"}</div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 1 }}>1 — CASE PAPER PHOTO (PRIMARY)</div>
        <div onClick={() => setHasPhoto(true)} style={{ background: hasPhoto ? "#E8F5E0" : C.cardBg, borderRadius: 16, padding: 22, textAlign: "center", cursor: "pointer", border: `2px dashed ${hasPhoto ? C.green : C.amber}` }}>
          <div style={{ fontSize: 32 }}>{hasPhoto ? "✓" : "📠"}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: hasPhoto ? C.green : C.navy, marginTop: 6 }}>{hasPhoto ? "Case paper capture ho gaya" : "Case paper scan/click karo"}</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>{hasPhoto ? "Dobara lene ke liye tap karo" : "📠 Scan (clear aayega) ya 📷 Click — zaroori hai"}</div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 1, marginTop: 4 }}>2 — GENERALS</div>
        <div style={{ background: C.cardBg, borderRadius: 16, padding: 15, display: "flex", flexDirection: "column", gap: 13 }}>
          <div><Label t="Thermals" /><ChipRow small opts={["Chilly", "Hot", "Ambi-thermal"]} sel={thermals} onSel={setThermals} /></div>
          <div><Label t="Thirst" /><ChipRow small opts={["Thirsty", "Thirstless", "Normal"]} sel={thirst} onSel={setThirst} /></div>
          <div><Label t="Sleep" /><ChipRow small opts={["Sound", "Disturbed", "Insomnia", "Excessive"]} sel={sleep} onSel={setSleep} /></div>
          <div><Label t="Appetite" /><ChipRow small opts={["Good", "Reduced", "Increased", "No appetite"]} sel={appetite} onSel={setAppetite} /></div>
          <div><Label t="Sweat" /><ChipRow small opts={["Profuse", "Scanty", "Offensive", "Normal"]} sel={sweat} onSel={setSweat} /></div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 1, marginTop: 4 }}>3 — MENTAL GENERALS (multi-select)</div>
        <div style={{ background: C.cardBg, borderRadius: 16, padding: 15 }}>
          <ChipRow small multi opts={["Anxiety++", "Fear of dark", "Fear of heights", "Claustrophobia", "Health anxiety", "Irritable++", "Anger→headache", "Weeps easily", "Consolation agg", "Consolation amel", "Mild/Yielding", "None"]} sel={mentals} onSel={(v: string) => toggle(mentals, setMentals, v)} />
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 1, marginTop: 4 }}>4 — MODALITIES (multi-select)</div>
        <div style={{ background: C.cardBg, borderRadius: 16, padding: 15, display: "flex", flexDirection: "column", gap: 13 }}>
          <div><Label t="Worse From" /><ChipRow small multi opts={["Cold", "Heat", "Damp", "Motion", "Rest", "Night", "Morning", "Exertion", "Pressure", "Sun"]} sel={worse} onSel={(v: string) => toggle(worse, setWorse, v)} /></div>
          <div><Label t="Better From" /><ChipRow small multi opts={["Cold", "Heat", "Motion", "Rest", "Open air", "Pressure", "Eating"]} sel={better} onSel={(v: string) => toggle(better, setBetter, v)} /></div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 1, marginTop: 4 }}>5 — PARTICULARS</div>
        <div style={{ background: C.cardBg, borderRadius: 16, padding: 15, display: "flex", flexDirection: "column", gap: 11 }}>
          <div><Label t="Chief Complaint Detail (patient ki bhasha mein)" /><textarea rows={3} placeholder="Onset, duration, character, location — layman language" style={{ width: "100%", padding: 13, borderRadius: 12, border: "none", background: C.softAmber, fontSize: 14, color: C.navy, resize: "none", boxSizing: "border-box", outline: "none" }} /></div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1, background: C.softAmber, borderRadius: 12, padding: 13, textAlign: "center", fontSize: 12, color: C.navy, cursor: "pointer" }} onClick={() => alert("Tongue photo li gayi")}>👅 Tongue photo</div>
            <div style={{ flex: 1, background: C.softAmber, borderRadius: 12, padding: 13, textAlign: "center", fontSize: 12, color: C.navy, cursor: "pointer" }} onClick={() => alert("Reports scan ho gaye")}>📋 Reports scan</div>
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 1, marginTop: 4 }}>6 — NOTES</div>
        <div style={{ background: C.cardBg, borderRadius: 16, padding: 15, display: "flex", flexDirection: "column", gap: 11 }}>
          <div><Label t="Past History" /><textarea rows={2} placeholder="Purani bimariyan, surgeries, family history..." style={{ width: "100%", padding: 13, borderRadius: 12, border: "none", background: C.softAmber, fontSize: 14, color: C.navy, resize: "none", boxSizing: "border-box", outline: "none" }} /></div>
          <div><Label t="Prescribing Doctor ke liye Notes" /><textarea rows={2} placeholder="Jo bhi important lage..." style={{ width: "100%", padding: 13, borderRadius: 12, border: "none", background: C.softAmber, fontSize: 14, color: C.navy, resize: "none", boxSizing: "border-box", outline: "none" }} /></div>
        </div>

        <div style={{ background: C.softAmber, borderRadius: 12, padding: 11, fontSize: 12, color: C.navy, cursor: "pointer" }} onClick={() => alert("Performa reference khul gaya")}>
          📖 Performa Reference — kuch bhool rahe ho toh yahan check karo
        </div>

        <Btn label="✓ Case Doctor Ko Bhejo" onClick={submit} bg={C.green} style={{ width: "100%", padding: 16, fontSize: 15 }} />
        <Btn label="Draft Save Karo" onClick={() => alert("Draft save ho gaya")} bg={C.cardBg} color={C.navy} style={{ width: "100%", border: `1.5px solid ${C.border}` }} />
        <div style={{ height: 8 }} />
      </Scroll>
    </div>
  );
};

const CaseReference = ({ go }: any) => (
  <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
    <TopBar title="Reference" sub="Read only" onBack={() => go("board")} />
    <Scroll>
      <div style={{ background: C.cardBg, borderRadius: 16, padding: 15 }}>
        <Label t="Common Rubrics Cheat Sheet" />
        {[["Anxiety, health about", "Ars, Phos, Calc, Nit-ac"], ["Fear, dark", "Stram, Phos, Puls, Calc"], ["Irritability", "Nux-v, Cham, Bry, Staph"], ["Weeping, consolation agg", "Nat-m, Sil, Ign"], ["Chilly patient", "Sil, Calc, Ars, Nux-v"]].map(([r, m]) => (
          <div key={r} style={{ padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.navy }}>{r}</div>
            <div style={{ fontSize: 12.5, color: C.textMuted }}>{m}</div>
          </div>
        ))}
      </div>
      <div style={{ background: C.cardBg, borderRadius: 16, padding: 15 }}>
        <Label t="Generals Quick Reference" />
        <div style={{ fontSize: 13, color: C.navy, lineHeight: 1.7 }}>
          <b>Thermals:</b> Chilly = thand lagti hai · Hot = garmi lagti hai<br />
          <b>Thirst:</b> Kitna paani, thanda ya garam — note karo<br />
          <b>Modalities:</b> Time, temperature, position, motion<br />
          <b>Mentals sabse upar</b> remedy selection mein
        </div>
      </div>
    </Scroll>
  </div>
);

// ─── Root ───────────────────────────────────────────────────────────────────
export default function App() {
  const [role, setRole] = useState<Role>("");
  const [doctor, setDoctor] = useState("");
  const [rxScreen, setRxScreen] = useState<RxScreen>("queue");
  const [caseScreen, setCaseScreen] = useState<CaseScreen>("board");
  const [patient, setPatient] = useState<any>(null);
  const [caseData, setCaseData] = useState<any>(null);

  const logout = () => { setRole(""); setDoctor(""); setRxScreen("queue"); setCaseScreen("board"); };

  const render = () => {
    if (role === "") return <Login pick={(r, doc) => { setRole(r); if (doc) setDoctor(doc); }} />;

    if (role === "rx") {
      switch (rxScreen) {
        case "queue": return <RxQueue doctor={doctor} go={setRxScreen} open={(p: any) => { setPatient(p); setRxScreen("consult"); }} logout={logout} />;
        case "consult": return <RxConsult patient={patient} doctor={doctor} go={setRxScreen} />;
        case "history": return <RxHistory go={setRxScreen} />;
        case "dashboard": return <RxDashboard doctor={doctor} go={setRxScreen} />;
      }
    }

    if (role === "case") {
      switch (caseScreen) {
        case "board": return <CaseBoard go={setCaseScreen} open={(c: any) => { setCaseData(c); setCaseScreen("form"); }} logout={logout} />;
        case "form": return <CaseForm caseData={caseData} go={setCaseScreen} />;
        case "reference": return <CaseReference go={setCaseScreen} />;
      }
    }
    return <Login pick={(r, doc) => { setRole(r); if (doc) setDoctor(doc); }} />;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#DED5C4", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ width: 430, height: 880, background: C.cream, borderRadius: 42, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 30px 80px rgba(0,0,0,.28)", position: "relative" }}>
        {render()}
      </div>
    </div>
  );
}
