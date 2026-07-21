import { useState } from 'react'
import ReceptionApp from './reception'
import DoctorApp from './doctor'
import PharmacyApp from './pharmacy'
import OwnerApp from './owner'

type Role = 'OWNER' | 'RECP1' | 'RECP2' | 'DOCTOR' | 'CASE_DR' | 'PHARMA'
const C = { cream: '#F5DEB3', navy: '#1A2A41', amber: '#D4A04A' }

// ─── Staff credentials (temp — Supabase auth Phase 3 mein aayega) ───────────
const STAFF = [
  { mobile: '8003231288', pin: '1234', name: 'Dr. Anavil Yadav', role: 'OWNER' as Role },
]
// ─────────────────────────────────────────────────────────────────────────────

type Session = { name: string; role: Role }

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
          <button onClick={()=>onLogin(mobile,pin)} style={{ padding:14, borderRadius:10, border:'none', background:C.amber, color:C.navy, fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:'sans-serif', marginTop:4 }}>
            Login
          </button>
        </div>
        <div style={{ textAlign:'center', marginTop:32, fontSize:11, color:C.cream, opacity:0.2 }}>Yadav Homeo Clinic · Jaipur</div>
      </div>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState<Session|null>(null)
  const [error, setError]     = useState('')

  function handleLogin(mobile: string, pin: string) {
    const user = STAFF.find(s => s.mobile === mobile && s.pin === pin)
    if (!user) { setError('Mobile ya PIN galat hai'); return }
    setError('')
    setSession({ name: user.name, role: user.role })
  }

  function handleLogout() { setSession(null) }

  if (!session) return <LoginScreen onLogin={handleLogin} error={error} />

  return (
    <div>
      <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:9999, background:C.navy, borderBottom:`1px solid rgba(212,160,74,0.25)`, padding:'6px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', fontFamily:'sans-serif' }}>
        <span style={{ fontSize:12, color:C.amber, fontWeight:600 }}>{session.name} · {session.role}</span>
        <button onClick={handleLogout} style={{ fontSize:11, color:C.cream, background:'transparent', border:`0.5px solid rgba(245,222,179,0.3)`, borderRadius:6, padding:'3px 10px', cursor:'pointer' }}>Logout</button>
      </div>
      <div style={{ paddingTop:32 }}>
        {(session.role==='RECP1'||session.role==='RECP2') && <ReceptionApp />}
        {(session.role==='DOCTOR'||session.role==='CASE_DR') && <DoctorApp />}
        {session.role==='PHARMA'  && <PharmacyApp />}
        {session.role==='OWNER'   && <OwnerApp />}
      </div>
    </div>
  )
}
