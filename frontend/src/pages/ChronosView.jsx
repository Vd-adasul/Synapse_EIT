import { useState, useCallback } from 'react'
import HumanModel3D from '../components/chronos/HumanModel3D'
import TriageRadar from '../components/chronos/TriageRadar'
import CrashOdometer from '../components/chronos/CrashOdometer'
import ShapExplainer from '../components/chronos/ShapExplainer'
import VitalsTicker from '../components/chronos/VitalsTicker'
import { patients } from '../data/mockChronosData'
import { playCriticalBeep, playNavClick } from '../utils/sounds'

export default function ChronosView() {
  const [selectedPatient, setSelectedPatient] = useState(patients[0])

  const handleSelectPatient = useCallback((patient) => {
    playNavClick()
    if (patient.status === 'critical') playCriticalBeep()
    setSelectedPatient(patient)
  }, [])

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 380px',
      gridTemplateRows: '1fr auto',
      gap: '16px',
      height: 'calc(100vh - 56px)',
      padding: '16px',
      position: 'relative',
      zIndex: 1,
    }}>
      {/* Center: 3D Model + Odometer */}
      <div style={{
        gridColumn: '1',
        gridRow: '1',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        minHeight: 0,
      }}>
        {/* Header bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 4px',
        }}>
          <div>
            <h2 style={{
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '2px',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
            }}>Project Chronos</h2>
            <h1 style={{
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '-0.5px',
              marginTop: '2px',
            }}>ICU Predictive Command Center</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <StatusIndicator status={selectedPatient.status} />
            <CrashOdometer value={selectedPatient.aggregateRisk} />
          </div>
        </div>

        {/* 3D Model */}
        <div className="glass" style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <HumanModel3D
            highlightOrgan={selectedPatient.highlightOrgan}
            riskLevel={selectedPatient.aggregateRisk}
          />
          {/* Patient info overlay */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(12px)',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--glass-border)',
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
              SELECTED PATIENT
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '4px' }}>
              Bed {selectedPatient.bed} — {selectedPatient.name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {selectedPatient.admitReason} • Age {selectedPatient.age}
            </div>
          </div>
        </div>

        {/* SHAP Explainer */}
        <div className="glass" style={{ padding: '16px', minHeight: '160px' }}>
          <ShapExplainer features={selectedPatient.shapFeatures} patientId={selectedPatient.id} />
        </div>
      </div>

      {/* Right: Triage Radar */}
      <div style={{
        gridColumn: '2',
        gridRow: '1 / 3',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}>
        <TriageRadar
          patients={patients}
          selected={selectedPatient}
          onSelect={handleSelectPatient}
        />
      </div>

      {/* Bottom: Vitals Ticker */}
      <div style={{ gridColumn: '1', gridRow: '2' }}>
        <VitalsTicker vitals={selectedPatient.currentVitals} history={selectedPatient.vitalHistory} status={selectedPatient.status} />
      </div>
    </div>
  )
}

function StatusIndicator({ status }) {
  const colors = {
    stable: 'var(--color-stable)',
    observing: 'var(--color-observing)',
    critical: 'var(--color-critical)',
  }
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 12px',
      borderRadius: 'var(--radius-full)',
      background: status === 'critical' ? 'var(--color-critical-bg)' : status === 'observing' ? 'var(--color-observing-bg)' : 'var(--color-stable-bg)',
      border: `1px solid ${colors[status]}33`,
    }}>
      <div style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: colors[status],
        animation: status === 'critical' ? 'pulse-dot 1s infinite' : 'pulse-dot 2s infinite',
      }} />
      <span style={{
        fontSize: '10px',
        fontWeight: 700,
        color: colors[status],
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
      }}>{status}</span>
    </div>
  )
}
