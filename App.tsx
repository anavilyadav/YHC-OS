import { useState, useEffect } from 'react'
import { supabase } from './src/lib/supabase'
import ReceptionApp from './reception'
import DoctorApp from './doctor'
import PharmacyApp from './pharmacy'
import OwnerApp from './owner'

type Role = 'OWNER' | 'RECP1' | 'RECP2' | 'DOCTOR' | 'CASE_DR' | 'PHARMA' | 'CALLING' | 'BACKEND'
const C = { cream: '#F5DEB3', navy: '#1A2A41', amber: '#D4A04A', red: '#C0392B' }

function LoadingScreen() {
  return (
    <div style={{ minHeight:'100vh', background:C.navy, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16, fontFamily:'sans-serif' }}>
      <div style={{ fontSize:24, fontWeight:700, color:C.amber }}>YHC-OS</div>
      <div style={{ fontSize:13, color:C.cream, opacity:0.4 }}>Loading...</div>
    </div>
  )
}

function LoginScreen({ onLogin }: { onLogin:(m:string,p:string)=>Promise<void> }) {
  const [mobile, setMobile]   = useState('')
  const [pin, setPin]         = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const inp: React.CSSProperties = {
    padding:'14px 16px', borderRadius:10, fontSize:16, fontFamily:'sans-serif',
    border:'0.5px solid rgba(245,222,179,0.25)', background:'rgba(255,255,255,0.07)',
    color:C.cream, outline:'none', width:'100%', boxSizing:'border-box',
  }

  async function submit() {
    if (!mobile || !pin) { setError('Mobile aur PIN dono bharo'); return }
    setLoading(true); setError('')
    try { await onLogin(mobile, pin) }
    catch (e:any) { setError(e.message || 'Login fail hua') }
    setLoading(false)
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
          <input type="tel" placeholder="Mobile number" value={mobile}
            onChange={e=>setMobile(e.target.value)} maxLength={10} style={inp} />
          <input type="password" placeholder="PIN / Password" value={pin}
            onChange={e=>setPin(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&submit()} style={inp} />
          {error && <div style={{ fontSize:13, color:'#ff6b6b', textAlign:'center' }}>{error}</div>}
          <button onClick={submit} disabled={loading} style={{
            padding:14, borderRadius:10, border:'none', background:C.amber,
            color:C.navy, fontSize:16, fontWeight:700, cursor:'pointer',
            fontFamily:'sans-serif', opacity:loading?0.7:1, marginTop:4,
          }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
        <div style={{ textAlign:'center', marginTop:32, fontSize:11, color:C.cream, opacity:0.2 }}>
          Yadav Homeo Clinic · Jaipur
        </div>
      </div>
    </div>
  )
}

type UserSession = { name: string; role: Role }

export default function App() {
  const [status, setStatus]     = useState<'loading'|'login'|'app'>('loading')
  const [session, setSession]   = useState<UserSession|null>(null)

  useEffect(() => {
    // Check localStorage for saved session
    const saved = localStorage.getItem('yhc_session')
    if (saved) {
      try { setSession(JSON.parse(saved)); setStatus('app') }
      catch { setStatus('login') }
    } else {
      setStatus('login')
    }
  }, [])

  async function handleLogin(mobile: string, pin: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, role')
      .eq('mobile', mobile)
      .eq('pin', pin)
      .eq('is_active', true)
      .eq('is_deleted', false)
      .single()

    if (error || !data) throw new Error('Mobile ya PIN galat hai')

    const s: UserSession = { name: data.name, role: data.role as Role }
    localStorage.setItem('yhc_session', JSON.stringify(s))
    setSession(s)
    setStatus('app')
  }

  function handleLogout() {
    localStorage.removeItem('yhc_session')
    setSession(null)
    setStatus('login')
  }

  if (status === 'loading') return <LoadingScreen />
  if (status === 'login' || !session) return <LoginScreen onLogin={handleLogin} />

  const { name, role } = session

  return (
    <div>
      <div style={{
        position:'fixed', top:0, left:0, right:0, zIndex:9999,
        background:C.navy, borderBottom:`1px solid rgba(212,160,74,0.25)`,
        padding:'6px 16px', display:'flex', justifyContent:'space-between',
        alignItems:'center', fontFamily:'sans-serif',
      }}>
        <span style={{ fontSize:12, color:C.amber, fontWeight:600 }}>{name} · {role}</span>
        <button onClick={handleLogout} style={{
          fontSize:11, color:C.cream, background:'transparent',
          border:`0.5px solid rgba(245,222,179,0.3)`, borderRadius:6,
          padding:'3px 10px', cursor:'pointer',
        }}>Logout</button>
      </div>
      <div style={{ paddingTop:32 }}>
        {(role==='RECP1'||role==='RECP2') && <ReceptionApp />}
        {(role==='DOCTOR'||role==='CASE_DR') && <DoctorApp />}
        {role==='PHARMA'  && <PharmacyApp />}
        {role==='OWNER'   && <OwnerApp />}
      </div>
    </div>
  )
}
