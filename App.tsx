import { useState } from 'react'
import ReceptionApp from './apps/reception'
import DoctorApp from './apps/doctor'
import PharmacyApp from './apps/pharmacy'
import OwnerApp from './apps/owner'

// ─── Phase 0 Note ───────────────────────────────────────────────────────────
// Ye file sirf testing ke liye hai.
// Phase 2 mein (Supabase Auth), yahan real login + role-based routing aayega.
// Abhi kisi bhi app ko click karke test karo.
// ────────────────────────────────────────────────────────────────────────────

type AppName = 'reception' | 'doctor' | 'pharmacy' | 'owner'

const APPS: { id: AppName; label: string; role: string; color: string }[] = [
  { id: 'reception', label: 'Reception App',     role: 'RECP1 / RECP2',   color: '#D4A04A' },
  { id: 'doctor',    label: 'Doctor App',         role: 'DR / CASE-DR',    color: '#5B8A2D' },
  { id: 'pharmacy',  label: 'Pharmacy App',       role: 'PHARMA',          color: '#1A6B6B' },
  { id: 'owner',     label: 'Owner Dashboard',    role: 'OWNER',           color: '#7B3F9E' },
]

const C = {
  cream: '#F5DEB3',
  navy: '#1A2A41',
  amber: '#D4A04A',
  cardBg: 'rgba(255,255,255,0.06)',
}

export default function App() {
  const [active, setActive] = useState<AppName | null>(null)

  if (active === 'reception') return <ReceptionApp />
  if (active === 'doctor')    return <DoctorApp />
  if (active === 'pharmacy')  return <PharmacyApp />
  if (active === 'owner')     return <OwnerApp />

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.navy,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Logo block */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div
          style={{
            display: 'inline-block',
            background: C.amber,
            color: C.navy,
            fontWeight: 800,
            fontSize: 13,
            letterSpacing: '0.15em',
            padding: '4px 12px',
            borderRadius: 4,
            marginBottom: 12,
          }}
        >
          YHC-OS
        </div>
        <div style={{ fontSize: 22, fontWeight: 600, color: C.cream }}>
          Yadav Homeo Clinic
        </div>
        <div style={{ fontSize: 13, color: C.cream, opacity: 0.45, marginTop: 4 }}>
          Dev launcher · Phase 0 · Dummy data only
        </div>
      </div>

      {/* App tiles */}
      <div style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {APPS.map((app) => (
          <button
            key={app.id}
            onClick={() => setActive(app.id)}
            style={{
              background: C.cardBg,
              border: '0.5px solid rgba(245,222,179,0.2)',
              borderRadius: 12,
              padding: '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              width: '100%',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.cardBg)}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.cream }}>{app.label}</div>
              <div style={{ fontSize: 12, color: C.cream, opacity: 0.5, marginTop: 2 }}>
                {app.role}
              </div>
            </div>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: app.color,
                flexShrink: 0,
              }}
            />
          </button>
        ))}
      </div>

      {/* Footer note */}
      <div
        style={{
          marginTop: 32,
          fontSize: 11,
          color: C.cream,
          opacity: 0.3,
          textAlign: 'center',
          maxWidth: 280,
          lineHeight: 1.5,
        }}
      >
        Real login aayega Phase 2 mein (Supabase Auth).
        Abhi sirf frontend test karo.
      </div>
    </div>
  )
}
