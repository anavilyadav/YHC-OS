import { useState } from 'react'
import ReceptionApp from './reception'
import DoctorApp from './doctor'
import PharmacyApp from './pharmacy'
import OwnerApp from './owner'

type Role = 'OWNER' | 'RECP1' | 'RECP2' | 'DOCTOR' | 'CASE_DR' | 'PHARMA'
const C = { cream: '#F5DEB3', navy: '#1A2A41', amber: '#D4A04A', green: '#5B8A2D' }

// ─── Staff credentials ────────────────────────────────────────────────────────
const STAFF = [
  { mobile: '8003231288', pin: '1234', name: 'Dr. Anavil Yadav', role: 'OWNER' as Role },
  { mobile: '1111111111', pin: '1111', name: 'Reception Staff',  role: 'RECP1' as Role },
  { mobile: '2222222222', pin: '2222', name: 'Case Doctor',      role: 'CASE_DR' as Role },
  { mobile: '3333333333', pin: '3333', name: 'Pharmacist',       role: 'PHARMA' as Role },
]

type Session = { name: string; role: Role; viewing?: Role }

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, error }: { onLogin:(m:string,p:string)=>void; error:string }) {
  const [mobile, setMobile] = useState('')
  const [pin, setPin]       = useState('')
  const inp: React.CSSProperties = {
    padding:'14px 16px', borderRadius:10, fontSize:16, fontFamily:'sans-serif',
    border:'0.5px solid rgba(245,222,179,0.25)', background:'rgba(255,255,255,0.07)',
    color:C.cream, outline:'none', width:'100%', boxSizing:'border-box',
  }
  return (
    <div style={{ minHeight:'100vh', background:C.navy, display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:'sans-serif' }}>
      <div style={{ width:'100%', maxWidth:360 }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ display:'inline-block', background:C.amber, color:C.navy, fontWeight:800, fontSize:11, letterSpacing:'0.15em', padding:'4px 12px', borderRadius:4, marginBottom:12 }}>YHC-OS</div>
          <div style={{ fontSize:22, fontWeight:600, color:C.cream }}>Yadav Homeo Clinic</div>
          <div style={{ fontSize:13, color:C.cream, opacity:0.35, marginTop:4 }}>Staff Login</div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <input type="tel" placeholder="Mobile number" value={mobile} onChange={e=>setMobile(e.target.value)} maxLength={10} style={inp} />
          <input type="password" placeholder="PIN" value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==='Enter'&&onLogin(mobile,pin)} style={inp} />
          {error && <div style={{ fontSize:13, color:'#ff6b6b', textAlign:'center' }}>{error}</div>}
          <button onClick={()=>onLogin(mobile,pin)} style={{ padding:14, borderRadius:10, border:'none', background:C.amber, color:C.navy, fontSize:16, fontWeight:700, cursor:'pointer', marginTop:4 }}>
            Login
          </button>
        </div>
        <div style={{ textAlign:'center', marginTop:32, fontSize:11, color:C.cream, opacity:0.2 }}>Yadav Homeo Clinic · Jaipur</div>
      </div>
    </div>
  )
}

// ─── Owner Role Selector ──────────────────────────────────────────────────────
const APPS = [
  { role: 'OWNER' as Role,   label: 'Owner Dashboard',  sub: 'Analytics, settings, full view' },
  { role: 'RECP1' as Role,   label: 'Reception App',    sub: 'Queue, registration, payment'   },
  { role: 'DOCTOR' as Role,  label: 'Doctor App',       sub: 'Rx, case-taking, consultation'  },
  { role: 'PHARMA' as Role,  label: 'Pharmacy App',     sub: 'Dispense, inventory'            },
]

function OwnerRoleSelector({ name, onSelect, onLogout }: { name:string; onSelect:(r:Role)=>void; onLogout:()=>void }) {
  return (
    <div style={{ minHeight:'100vh', background:C.navy, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24, fontFamily:'sans-serif' }}>
      <div style={{ width:'100%', maxWidth:360 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ display:'inline-block', background:C.amber, color:C.navy, fontWeight:800, fontSize:11, letterSpacing:'0.15em', padding:'4px 12px', borderRadius:4, marginBottom:12 }}>YHC-OS</div>
          <div style={{ fontSize:18, fontWeight:600, color:C.cream }}>Namaste, {name}</div>
          <div style={{ fontSize:13, color:C.cream, opacity:0.4, marginTop:4 }}>Kaunsa app kholna hai?</div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {APPS.map(a => (
            <button key={a.role} onClick={()=>onSelect(a.role)} style={{ background:'rgba(255,255,255,0.07)', border:'0.5px solid rgba(245,222,179,0.2)', borderRadius:12, padding:'16px 18px', textAlign:'left', cursor:'pointer', width:'100%' }}>
              <div style={{ fontSize:15, fontWeight:600, color:C.cream }}>{a.label}</div>
              <div style={{ fontSize:12, color:C.cream, opacity:0.45, marginTop:3 }}>{a.sub}</div>
            </button>
          ))}
        </div>
        <button onClick={onLogout} style={{ marginTop:24, width:'100%', background:'transparent', border:'0.5px solid rgba(245,222,179,0.2)', borderRadius:10, padding:'10px', color:C.cream, fontSize:13, cursor:'pointer', opacity:0.5 }}>
          Logout
        </button>
      </div>
    </div>
  )
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession]   = useState<Session|null>(null)
  const [viewing, setViewing]   = useState<Role|null>(null)
  const [error, setError]       = useState('')

  function handleLogin(mobile: string, pin: string) {
    const user = STAFF.find(s => s.mobile === mobile && s.pin === pin)
    if (!user) { setError('Mobile ya PIN galat hai'); return }
    setError('')
    setSession({ name: user.name, role: user.role })
    if (user.role !== 'OWNER') setViewing(user.role)
  }

  function handleLogout() { setSession(null); setViewing(null) }

  // Not logged in
  if (!session) return <LoginScreen onLogin={handleLogin} error={error} />

  // OWNER — show role selector if no app chosen
  if (session.role === 'OWNER' && !viewing) {
    return <OwnerRoleSelector name={session.name} onSelect={r=>setViewing(r)} onLogout={handleLogout} />
  }

  const active = viewing || session.role

  return (
    <div>
      {/* Top bar */}
      <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:9999, background:C.navy, borderBottom:`1px solid rgba(212,160,74,0.25)`, padding:'6px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', fontFamily:'sans-serif' }}>
        <span style={{ fontSize:12, color:C.amber, fontWeight:600 }}>{session.name} · {active}</span>
        <div style={{ display:'flex', gap:8 }}>
          {session.role === 'OWNER' && (
            <button onClick={()=>setViewing(null)} style={{ fontSize:11, color:C.cream, background:'transparent', border:`0.5px solid rgba(245,222,179,0.3)`, borderRadius:6, padding:'3px 10px', cursor:'pointer' }}>Switch</button>
          )}
          <button onClick={handleLogout} style={{ fontSize:11, color:C.cream, background:'transparent', border:`0.5px solid rgba(245,222,179,0.3)`, borderRadius:6, padding:'3px 10px', cursor:'pointer' }}>Logout</button>
        </div>
      </div>
      <div style={{ paddingTop:32 }}>
        {(active==='RECP1'||active==='RECP2') && <ReceptionApp />}
        {(active==='DOCTOR'||active==='CASE_DR') && <DoctorApp />}
        {active==='PHARMA'  && <PharmacyApp />}
        {active==='OWNER'   && <OwnerApp />}
      </div>
    </div>
  )
}
