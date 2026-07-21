import { useState } from "react";

// ─── Brand Tokens ───────────────────────────────────────────────────────────
const C = {
  cream: "#F5DEB3", navy: "#1A2A41", amber: "#D4A04A", green: "#5B8A2D",
  red: "#C0392B", white: "#FFFFFF", cardBg: "#FDF6E3", softAmber: "#EFE0BD",
  textMuted: "#6B5E4E", border: "#E8D5A3",
};

type Screen = "dashboard" | "staff" | "incentives" | "reports" | "control" | "health";

// ─── Dummy Data ─────────────────────────────────────────────────────────────
const STAFF = [
  { name: "Priya Sharma", role: "RECP1", branch: "Bajaj Nagar", status: "Active", cap: "2" },
  { name: "Anjali Verma", role: "RECP2", branch: "Bajaj Nagar", status: "Active", cap: "1" },
  { name: "Dr. Amit", role: "CASE-DR", branch: "Both", status: "Active", cap: "N" },
  { name: "Dr. Priya", role: "CASE-DR", branch: "Both", status: "Active", cap: "N" },
  { name: "Dr. Yadav", role: "DOCTOR", branch: "Both", status: "Active", cap: "1" },
  { name: "Ramesh", role: "PHARMA", branch: "Jagatpura", status: "Active", cap: "1" },
  { name: "Sunita", role: "CALLING", branch: "Bajaj Nagar", status: "Active", cap: "1" },
  { name: "Vikram", role: "BACKEND", branch: "Both", status: "Leave", cap: "1" },
];

const INCENTIVE_STAFF = [
  { name: "Priya Sharma", role: "RECP1", target: 50000, done: 42000 },
  { name: "Anjali Verma", role: "RECP2", target: 40000, done: 38500 },
  { name: "Sunita", role: "Telecaller", target: 35000, done: 29000 },
];

const CONTROLS = [
  { section: "Clinic Operations", items: [{ k: "Online booking", on: true }, { k: "Walk-in registration", on: true }, { k: "Courier delivery", on: true }, { k: "Home visits", on: false }] },
  { section: "Feature Modules", items: [{ k: "Lead CRM", on: true }, { k: "Follow-up CRM", on: true }, { k: "WhatsApp automation", on: true }, { k: "Marketing module", on: false }] },
  { section: "Privacy & Access", items: [{ k: "Hidden Identity Mode", on: true }, { k: "Case-DR patient access", on: false }, { k: "Backup doctor access", on: false }] },
  { section: "Payment & Delivery", items: [{ k: "Advance payment", on: false }, { k: "COD delivery", on: true }, { k: "Partial payment", on: true }] },
];

const HEALTH_CHECKS = [
  { check: "Database connection", status: "ok" },
  { check: "WhatsApp API", status: "ok" },
  { check: "Backup (last night)", status: "ok" },
  { check: "Payment gateway", status: "ok" },
  { check: "Low stock alerts", status: "warn" },
  { check: "Pending follow-ups", status: "warn" },
];

// ─── Shared UI ──────────────────────────────────────────────────────────────
const TopBar = ({ title, sub, onBack, action }: any) => (
  <div style={{ background: C.navy, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0, borderRadius: "0 0 18px 18px" }}>
    {onBack ? <button onClick={onBack} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 999, width: 38, height: 38, color: C.white, fontSize: 17, cursor: "pointer" }}>←</button>
      : <div style={{ width: 40, height: 40, borderRadius: 999, background: C.amber, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: C.navy }}>Y</div>}
    <div style={{ flex: 1 }}>
      <div style={{ color: C.white, fontWeight: 700, fontSize: 17 }}>{title}</div>
      {sub && <div style={{ color: "rgba(255,255,255,.6)", fontSize: 12 }}>{sub}</div>}
    </div>
    {action}
  </div>
);

const Stat = ({ v, l, color }: any) => (
  <div style={{ flex: 1, background: C.cardBg, borderRadius: 14, padding: "12px 6px", textAlign: "center", border: `1px solid ${C.border}` }}>
    <div style={{ fontSize: 19, fontWeight: 800, color: color || C.navy }}>{v}</div>
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

const Label = ({ t }: any) => <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: .6, textTransform: "uppercase", marginBottom: 7 }}>{t}</div>;

const Toggle = ({ on, onClick }: any) => (
  <div onClick={onClick} style={{ width: 50, height: 28, borderRadius: 999, background: on ? C.green : "#ccc", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background .2s" }}>
    <div style={{ position: "absolute", top: 3, left: on ? 25 : 3, width: 22, height: 22, borderRadius: 999, background: C.white, transition: "left .2s" }} />
  </div>
);

const NAV = [
  { k: "dashboard", i: "📊", l: "Home" },
  { k: "staff", i: "👥", l: "Staff" },
  { k: "reports", i: "📈", l: "Reports" },
  { k: "control", i: "⚙️", l: "Control" },
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

// ─── Dashboard ──────────────────────────────────────────────────────────────
const Dashboard = ({ go }: any) => {
  const week = [["Mon", 6200], ["Tue", 7800], ["Wed", 5400], ["Thu", 8900], ["Fri", 7100], ["Sat", 9600]] as [string, number][];
  const max = 9600;
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Owner Dashboard" sub="Yadav Homeo Clinic • Both Branches" action={
        <button onClick={() => go("health")} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 999, padding: "8px 12px", color: C.white, fontSize: 12, cursor: "pointer" }}>🩺 Health</button>
      } />
      <Scroll>
        <div style={{ background: C.navy, borderRadius: 18, padding: 20, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.65)" }}>Today's Revenue</div>
          <div style={{ fontSize: 38, fontWeight: 800, color: C.amber, margin: "5px 0" }}>₹9,600</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 4 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>Bajaj: ₹5,800</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>Jagatpura: ₹3,800</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 7 }}>
          <Stat v={42} l="Patients" /><Stat v={8} l="New" color={C.green} /><Stat v={34} l="Follow-up" /><Stat v="₹2.1L" l="This Month" color={C.amber} />
        </div>
        <div style={{ background: C.cardBg, borderRadius: 16, padding: 15 }}>
          <Label t="This Week — Revenue" />
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120, marginTop: 8 }}>
            {week.map(([d, v]) => (
              <div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: 9, color: C.textMuted, fontWeight: 600 }}>{(v / 1000).toFixed(1)}k</div>
                <div style={{ width: "100%", height: `${(v / max) * 90}px`, background: C.amber, borderRadius: "6px 6px 0 0" }} />
                <div style={{ fontSize: 11, color: C.textMuted }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div onClick={() => go("incentives")} style={{ flex: 1, background: C.cardBg, borderRadius: 14, padding: 15, cursor: "pointer", border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 22 }}>🎯</div>
            <div style={{ fontWeight: 700, color: C.navy, fontSize: 14, marginTop: 4 }}>Incentives</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>Staff performance</div>
          </div>
          <div onClick={() => go("staff")} style={{ flex: 1, background: C.cardBg, borderRadius: 14, padding: 15, cursor: "pointer", border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 22 }}>👥</div>
            <div style={{ fontWeight: 700, color: C.navy, fontSize: 14, marginTop: 4 }}>Staff (8)</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>7 active, 1 leave</div>
          </div>
        </div>
      </Scroll>
      <Nav cur="dashboard" go={go} />
    </div>
  );
};

// ─── Staff Management ───────────────────────────────────────────────────────
const Staff = ({ go }: any) => {
  const ROLE_COLOR: Record<string, string> = { RECP1: C.amber, RECP2: C.amber, "CASE-DR": C.navy, DOCTOR: C.green, PHARMA: "#8E6BB8", CALLING: "#3B8EA5", BACKEND: "#7A7A7A", OWNER: C.red };
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Staff Management" sub="8 roles" onBack={() => go("dashboard")} action={
        <button onClick={() => alert("Add new staff member")} style={{ background: C.amber, border: "none", borderRadius: 999, padding: "8px 14px", color: C.navy, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>+ Staff</button>
      } />
      <Scroll>
        <div style={{ display: "flex", gap: 7 }}>
          <Stat v={8} l="Total" /><Stat v={7} l="Active" color={C.green} /><Stat v={1} l="On Leave" color={C.amber} />
        </div>
        <div style={{ background: "#FBEDD2", borderRadius: 12, padding: 11, fontSize: 12, color: "#9A7B23" }}>
          💡 "N" capacity = unlimited parallel (Case-DRs can take many cases at once)
        </div>
        {STAFF.map((s, i) => (
          <div key={i} style={{ background: C.cardBg, borderRadius: 14, padding: 14, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 999, background: ROLE_COLOR[s.role] || C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: C.white, fontSize: 15, flexShrink: 0 }}>{s.name[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: C.textMuted }}>{s.role} • {s.branch} • Cap: {s.cap}</div>
            </div>
            <Badge text={s.status} bg={s.status === "Active" ? "#E8F5E0" : "#FBEDD2"} color={s.status === "Active" ? C.green : "#9A7B23"} />
          </div>
        ))}
      </Scroll>
      <Nav cur="staff" go={go} />
    </div>
  );
};

// ─── Incentives ─────────────────────────────────────────────────────────────
const Incentives = ({ go }: any) => (
  <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
    <TopBar title="Staff Incentives" sub="4% of revenue above baseline" onBack={() => go("dashboard")} />
    <Scroll>
      <div style={{ background: C.navy, borderRadius: 16, padding: 16, color: C.white }}>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,.65)" }}>Incentive Pool This Month</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: C.amber, margin: "4px 0" }}>₹4,200</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>4% of ₹1.05L growth above baseline</div>
      </div>
      <div style={{ background: "#FBEDD2", borderRadius: 12, padding: 11, fontSize: 12, color: "#9A7B23" }}>
        💡 Sirf baseline se upar ki growth pe milta hai — RECP1, RECP2 & Telecaller ko, performance ke hisaab se
      </div>
      {INCENTIVE_STAFF.map((s, i) => {
        const pct = Math.round((s.done / s.target) * 100);
        const share = Math.round(4200 * (s.done / (INCENTIVE_STAFF.reduce((a, x) => a + x.done, 0))));
        return (
          <div key={i} style={{ background: C.cardBg, borderRadius: 16, padding: 15, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, color: C.navy, fontSize: 15 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: C.textMuted }}>{s.role}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.green }}>₹{share}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>earned</div>
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textMuted, marginBottom: 4 }}>
                <span>₹{(s.done / 1000).toFixed(0)}k / ₹{(s.target / 1000).toFixed(0)}k target</span>
                <span style={{ fontWeight: 700, color: pct >= 90 ? C.green : C.amber }}>{pct}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: C.softAmber }}>
                <div style={{ height: 8, borderRadius: 999, background: pct >= 90 ? C.green : C.amber, width: `${Math.min(pct, 100)}%` }} />
              </div>
            </div>
          </div>
        );
      })}
      <Btn label="Adjust Split (Owner Discretion)" onClick={() => alert("Manual split adjustment")} bg={C.cardBg} color={C.navy} style={{ width: "100%", border: `1.5px solid ${C.border}` }} />
    </Scroll>
    <Nav cur="dashboard" go={go} />
  </div>
);

// ─── Reports ────────────────────────────────────────────────────────────────
const Reports = ({ go }: any) => {
  const [period, setPeriod] = useState("This Month");
  const rows = [["Total Revenue", "₹2,10,400"], ["Total Patients", "142"], ["New Patients", "38"], ["Avg per Patient", "₹1,482"], ["Cash Collection", "₹94,000"], ["UPI Collection", "₹88,400"], ["Card Collection", "₹28,000"], ["Outstanding", "₹18,600"], ["Deliveries", "56"], ["Leads Converted", "22"]];
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Reports & Analytics" onBack={() => go("dashboard")} />
      <Scroll>
        <div style={{ display: "flex", gap: 7, overflowX: "auto" }}>
          {["This Week", "This Month", "Last Month", "This Year"].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{ padding: "8px 15px", borderRadius: 999, border: `1.5px solid ${period === p ? C.navy : C.border}`, background: period === p ? C.navy : C.cardBg, color: period === p ? C.white : C.navy, fontSize: 13, fontWeight: period === p ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap" }}>{p}</button>
          ))}
        </div>
        <div style={{ background: C.cardBg, borderRadius: 16, padding: 6 }}>
          {rows.map(([k, v], i) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 12px", borderBottom: i < rows.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ fontSize: 14, color: C.textMuted }}>{k}</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>{v}</span>
            </div>
          ))}
        </div>
        <Btn label="📤 Export Report (PDF)" onClick={() => alert("Report exported")} bg={C.green} style={{ width: "100%", padding: 15 }} />
        <Btn label="📊 Compare Branches" onClick={() => alert("Branch comparison view")} bg={C.navy} style={{ width: "100%", padding: 15 }} />
      </Scroll>
      <Nav cur="reports" go={go} />
    </div>
  );
};

// ─── Control Centre ─────────────────────────────────────────────────────────
const Control = ({ go }: any) => {
  const [state, setState] = useState(() => {
    const s: Record<string, boolean> = {};
    CONTROLS.forEach(sec => sec.items.forEach(it => { s[it.k] = it.on; }));
    return s;
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Owner Control Centre" sub="Master switches" onBack={() => go("dashboard")} action={
        <button onClick={() => go("health")} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 999, padding: "8px 12px", color: C.white, fontSize: 12, cursor: "pointer" }}>🩺</button>
      } />
      <Scroll>
        {CONTROLS.map(sec => (
          <div key={sec.section}>
            <Label t={sec.section} />
            <div style={{ background: C.cardBg, borderRadius: 16, padding: 6 }}>
              {sec.items.map((it, i) => (
                <div key={it.k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 12px", borderBottom: i < sec.items.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <span style={{ fontSize: 14, color: C.navy }}>{it.k}</span>
                  <Toggle on={state[it.k]} onClick={() => setState(s => ({ ...s, [it.k]: !s[it.k] }))} />
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ background: "#FDECEA", borderRadius: 14, padding: 13, fontSize: 12.5, color: C.red }}>
          ⚠ Prototype mein toggles refresh pe reset honge — Supabase se permanently save honge
        </div>
      </Scroll>
      <Nav cur="control" go={go} />
    </div>
  );
};

// ─── System Health ──────────────────────────────────────────────────────────
const Health = ({ go }: any) => (
  <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
    <TopBar title="System Health" sub="Automated checks" onBack={() => go("dashboard")} />
    <Scroll>
      <div style={{ background: "#E8F5E0", borderRadius: 16, padding: 18, textAlign: "center" }}>
        <div style={{ fontSize: 34 }}>✓</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: C.green, marginTop: 4 }}>System Healthy</div>
        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>4 OK • 2 warnings • 0 errors</div>
      </div>
      {HEALTH_CHECKS.map((h, i) => (
        <div key={i} style={{ background: C.cardBg, borderRadius: 14, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: `4px solid ${h.status === "ok" ? C.green : C.amber}` }}>
          <span style={{ fontSize: 14, color: C.navy }}>{h.check}</span>
          <Badge text={h.status === "ok" ? "✓ OK" : "⚠ Check"} bg={h.status === "ok" ? "#E8F5E0" : "#FBEDD2"} color={h.status === "ok" ? C.green : "#9A7B23"} />
        </div>
      ))}
      <Btn label="Run Health Check Now" onClick={() => alert("Running all checks...")} bg={C.navy} style={{ width: "100%", padding: 15 }} />
    </Scroll>
  </div>
);

// ─── Root ───────────────────────────────────────────────────────────────────
export default function App() {
  const [s, setS] = useState<Screen>("dashboard");
  const render = () => {
    switch (s) {
      case "dashboard": return <Dashboard go={setS} />;
      case "staff": return <Staff go={setS} />;
      case "incentives": return <Incentives go={setS} />;
      case "reports": return <Reports go={setS} />;
      case "control": return <Control go={setS} />;
      case "health": return <Health go={setS} />;
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
