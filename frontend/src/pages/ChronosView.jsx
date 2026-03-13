import { useState, useCallback } from 'react'
import HumanModel3D from '../components/chronos/HumanModel3D'
import TriageRadar from '../components/chronos/TriageRadar'
import CrashOdometer from '../components/chronos/CrashOdometer'
import ShapExplainer from '../components/chronos/ShapExplainer'
import VitalsTicker from '../components/chronos/VitalsTicker'
import GenerateAccessQR from '../components/chronos/GenerateAccessQR'
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
          {/* Patient info overlay with QR action */}
          <div className="absolute bottom-6 left-6 flex flex-col gap-3 w-72 z-40">
            <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-xl border border-white/10 shadow-2xl relative overflow-hidden">
              {/* Decorative accent line */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/50"></div>
              
              <div className="text-[10px] text-emerald-400 font-mono tracking-[0.2em] mb-1">
                SELECTED PATIENT
              </div>
              <div className="text-xl font-bold text-white tracking-wide">
                Bed {selectedPatient.bed} <span className="text-slate-500 mx-1">—</span> {selectedPatient.name}
              </div>
              <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-2">
                <span className="truncate">{selectedPatient.admitReason}</span>
                <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                <span className="whitespace-nowrap">Age {selectedPatient.age}</span>
              </div>
            </div>
            
            {/* Generate Family QR Action */}
            <GenerateAccessQR patientId={selectedPatient.id} />
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
