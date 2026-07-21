import { useState } from "react";

// ─── Brand Tokens ───────────────────────────────────────────────────────────
const C = {
  cream: "#F5DEB3", navy: "#1A2A41", amber: "#D4A04A", green: "#5B8A2D",
  red: "#C0392B", white: "#FFFFFF", cardBg: "#FDF6E3", softAmber: "#EFE0BD",
  textMuted: "#6B5E4E", border: "#E8D5A3",
};

type Screen = "queue" | "dispense" | "inventory" | "master";

// ─── Dummy Data ─────────────────────────────────────────────────────────────
const PHARMA_QUEUE = [
  { token: "T-01", name: "Ramesh Sharma", branch: "Bajaj Nagar", rx: [{ med: "Rhus Tox", potency: "200C", form: "Globules", qty: 2, freq: "BD" }, { med: "SLX", potency: "—", form: "Globules", qty: 1, freq: "TDS" }], status: "Pending" },
  { token: "T-03", name: "Aarav Gupta", branch: "Jagatpura", rx: [{ med: "Sulphur", potency: "30C", form: "Globules", qty: 1, freq: "OD" }, { med: "SLX", potency: "—", form: "Globules", qty: 2, freq: "BD" }], status: "Pending" },
  { token: "T-06", name: "Neha Jain", branch: "Bajaj Nagar", rx: [{ med: "Ignatia", potency: "30C", form: "Globules", qty: 1, freq: "BD" }], status: "Preparing" },
];

const INVENTORY = [
  { med: "Sulphur", potency: "30C", stock: 45, unit: "drams", low: 20 },
  { med: "Sulphur", potency: "200C", stock: 12, unit: "drams", low: 20 },
  { med: "Nux Vomica", potency: "200C", stock: 38, unit: "drams", low: 20 },
  { med: "Rhus Tox", potency: "200C", stock: 8, unit: "drams", low: 20 },
  { med: "Pulsatilla", potency: "30C", stock: 52, unit: "drams", low: 20 },
  { med: "Ignatia", potency: "30C", stock: 15, unit: "drams", low: 20 },
  { med: "SLX (Sac Lac)", potency: "—", stock: 340, unit: "grams", low: 100 },
  { med: "Arsenicum", potency: "200C", stock: 6, unit: "drams", low: 20 },
];

const MASTER = [
  { med: "Sulphur", potencies: "6C, 30C, 200C, 1M", type: "Deep-acting antipsoric" },
  { med: "Nux Vomica", potencies: "30C, 200C, 1M", type: "Digestive, irritable" },
  { med: "Pulsatilla", potencies: "30C, 200C", type: "Mild, changeable moods" },
  { med: "Rhus Tox", potencies: "30C, 200C, 1M", type: "Joints, restless" },
  { med: "Ignatia", potencies: "30C, 200C", type: "Grief, emotional" },
  { med: "Arsenicum", potencies: "30C, 200C, 1M", type: "Anxiety, restlessness" },
  { med: "Lycopodium", potencies: "200C, 1M", type: "Digestive, liver" },
  { med: "Calcarea Carb", potencies: "200C, 1M", type: "Constitutional" },
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

const Btn = ({ label, onClick, bg, color, style }: any) => (
  <button onClick={onClick} style={{ padding: "13px 16px", borderRadius: 999, background: bg, color: color || C.white, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", ...style }}>{label}</button>
);

const Badge = ({ text, bg, color }: any) => (
  <span style={{ background: bg, color, borderRadius: 999, padding: "4px 11px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>{text}</span>
);

const Scroll = ({ children }: any) => (
  <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 11 }}>{children}</div>
);

const NAV = [
  { k: "queue", i: "💊", l: "Queue" },
  { k: "inventory", i: "📦", l: "Inventory" },
  { k: "master", i: "📖", l: "Master" },
];

const Nav = ({ cur, go }: any) => (
  <div style={{ display: "flex", background: C.cardBg, borderTop: `1px solid ${C.border}`, flexShrink: 0, paddingBottom: 4 }}>
    {NAV.map(n => {
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

// ─── Pharmacy Queue ─────────────────────────────────────────────────────────
const Queue = ({ go, open }: any) => (
  <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
    <TopBar title="Pharmacy Queue" sub="Yadav Homeo Clinic • Jaipur" />
    <Scroll>
      <div style={{ display: "flex", gap: 7 }}>
        <Stat v={3} l="To Dispense" color={C.amber} /><Stat v={14} l="Done Today" color={C.green} /><Stat v={2} l="Low Stock" color={C.red} />
      </div>
      {PHARMA_QUEUE.map(p => (
        <div key={p.token} onClick={() => open(p)} style={{ background: C.cardBg, borderRadius: 18, padding: 15, border: `1px solid ${C.border}`, cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Badge text={p.token} bg={C.navy} color={C.white} />
              <span style={{ fontWeight: 700, fontSize: 16, color: C.navy }}>{p.name}</span>
            </div>
            <Badge text={p.status} bg={p.status === "Preparing" ? "#E0EBF5" : "#FBEDD2"} color={p.status === "Preparing" ? C.navy : "#9A7B23"} />
          </div>
          <div style={{ fontSize: 12, color: C.textMuted, margin: "6px 0" }}>{p.branch}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {p.rx.map((r, i) => (
              <div key={i} style={{ fontSize: 13, color: C.navy, background: C.softAmber, borderRadius: 8, padding: "6px 10px" }}>
                {r.med} {r.potency !== "—" && r.potency} • {r.qty} {r.form} • {r.freq}
              </div>
            ))}
          </div>
        </div>
      ))}
    </Scroll>
    <Nav cur="queue" go={go} />
  </div>
);

// ─── Dispense ───────────────────────────────────────────────────────────────
const Dispense = ({ patient, go }: any) => {
  const [checked, setChecked] = useState<number[]>([]);
  const rx = patient?.rx || PHARMA_QUEUE[0].rx;
  const toggle = (i: number) => setChecked(c => c.includes(i) ? c.filter(x => x !== i) : [...c, i]);
  const allDone = checked.length === rx.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Dispense Medicines" onBack={() => go("queue")} />
      <Scroll>
        <div style={{ background: C.navy, borderRadius: 16, padding: 15, color: C.white }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 800, fontSize: 17 }}>{patient?.name || "Ramesh Sharma"}</span>
            <Badge text={patient?.token || "T-01"} bg={C.amber} color={C.navy} />
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.7)", marginTop: 4 }}>{patient?.branch || "Bajaj Nagar"}</div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: 1 }}>PRESCRIPTION — CHECK EACH ITEM</div>
        {rx.map((r: any, i: number) => (
          <div key={i} onClick={() => toggle(i)} style={{ background: checked.includes(i) ? "#E8F5E0" : C.cardBg, borderRadius: 16, padding: 15, border: `1.5px solid ${checked.includes(i) ? C.green : C.border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 13 }}>
            <div style={{ width: 26, height: 26, borderRadius: 999, border: `2px solid ${checked.includes(i) ? C.green : "#B9A98A"}`, background: checked.includes(i) ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14, color: C.white }}>{checked.includes(i) && "✓"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.navy }}>{r.med} {r.potency !== "—" && r.potency}</div>
              <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>{r.qty} {r.form} • {r.freq}</div>
            </div>
          </div>
        ))}

        <div style={{ background: "#FBEDD2", borderRadius: 14, padding: 13, fontSize: 12.5, color: "#9A7B23" }}>
          💡 Dispensing se stock automatically kam hoga (drams/globules)
        </div>

        <Btn label={allDone ? "✓ Mark Dispensed & Send to Payment" : `Check all ${rx.length} items first`} onClick={() => { if (allDone) { alert("Dispensed! Patient sent to payment counter."); go("queue"); } else alert("Please check all items first"); }} bg={allDone ? C.green : "#B9A98A"} style={{ width: "100%", padding: 16, fontSize: 15 }} />
        <Btn label="Report Stock Issue" onClick={() => alert("Stock issue reported to owner")} bg={C.cardBg} color={C.red} style={{ width: "100%", border: `1.5px solid ${C.red}` }} />
      </Scroll>
    </div>
  );
};

// ─── Inventory ──────────────────────────────────────────────────────────────
const Inventory = ({ go }: any) => {
  const [f, setF] = useState("All");
  const list = f === "Low Stock" ? INVENTORY.filter(i => i.stock <= i.low) : INVENTORY;
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Inventory" sub="Current stock levels" action={
        <button onClick={() => alert("Add stock entry")} style={{ background: C.amber, border: "none", borderRadius: 999, padding: "8px 14px", color: C.navy, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Stock</button>
      } />
      <Scroll>
        <div style={{ display: "flex", gap: 7 }}>
          <Stat v={INVENTORY.length} l="Total Items" /><Stat v={INVENTORY.filter(i => i.stock <= i.low).length} l="Low Stock" color={C.red} />
        </div>
        <div style={{ display: "flex", gap: 7 }}>
          {["All", "Low Stock"].map(x => (
            <button key={x} onClick={() => setF(x)} style={{ padding: "8px 15px", borderRadius: 999, border: `1.5px solid ${f === x ? C.navy : C.border}`, background: f === x ? C.navy : C.cardBg, color: f === x ? C.white : C.navy, fontSize: 13, fontWeight: f === x ? 700 : 500, cursor: "pointer" }}>{x}</button>
          ))}
        </div>
        {list.map((i, idx) => {
          const low = i.stock <= i.low;
          return (
            <div key={idx} style={{ background: C.cardBg, borderRadius: 14, padding: 14, borderLeft: `4px solid ${low ? C.red : C.green}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>{i.med} {i.potency !== "—" && i.potency}</div>
                {low && <div style={{ fontSize: 12, color: C.red, fontWeight: 600, marginTop: 2 }}>⚠ Low stock — reorder soon</div>}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: low ? C.red : C.navy }}>{i.stock}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>{i.unit}</div>
              </div>
            </div>
          );
        })}
      </Scroll>
      <Nav cur="inventory" go={go} />
    </div>
  );
};

// ─── Medicine Master ────────────────────────────────────────────────────────
const Master = ({ go }: any) => {
  const [q, setQ] = useState("");
  const list = q ? MASTER.filter(m => m.med.toLowerCase().includes(q.toLowerCase())) : MASTER;
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Medicine Master" sub="Reference list" action={
        <button onClick={() => alert("Add new medicine")} style={{ background: C.amber, border: "none", borderRadius: 999, padding: "8px 14px", color: C.navy, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Add</button>
      } />
      <Scroll>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search medicine"
            style={{ width: "100%", padding: "14px 14px 14px 44px", borderRadius: 999, border: `2px solid ${C.amber}`, background: C.cardBg, fontSize: 14, color: C.navy, boxSizing: "border-box", outline: "none" }} />
        </div>
        {list.map((m, i) => (
          <div key={i} style={{ background: C.cardBg, borderRadius: 14, padding: 14, border: `1px solid ${C.border}` }}>
            <div style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>{m.med}</div>
            <div style={{ fontSize: 12.5, color: C.textMuted, marginTop: 3 }}>Potencies: {m.potencies}</div>
            <div style={{ fontSize: 12.5, color: C.textMuted }}>{m.type}</div>
          </div>
        ))}
      </Scroll>
      <Nav cur="master" go={go} />
    </div>
  );
};

// ─── Root ───────────────────────────────────────────────────────────────────
export default function App() {
  const [s, setS] = useState<Screen>("queue");
  const [patient, setPatient] = useState<any>(null);
  const render = () => {
    switch (s) {
      case "queue": return <Queue go={setS} open={(p: any) => { setPatient(p); setS("dispense"); }} />;
      case "dispense": return <Dispense patient={patient} go={setS} />;
      case "inventory": return <Inventory go={setS} />;
      case "master": return <Master go={setS} />;
    }
  };
  return (
    <div style={{ minHeight: "100vh", background: "#DED5C4", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ width: 430, height: 880, background: C.cream, borderRadius: 42, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 30px 80px rgba(0,0,0,.28)", position: "relative" }}>
        {render()}
      </div>
    </div>
  );
}
