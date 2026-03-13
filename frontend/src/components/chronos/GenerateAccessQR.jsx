import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { QRCodeSVG } from 'qrcode.react'

export default function GenerateAccessQR({ patientId }) {
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('idle') // 'idle' | 'generating' | 'generated' | 'claimed'
  const [error, setError] = useState(null)

  const handleGenerateQR = async () => {
    setLoading(true)
    setError(null)
    try {
      // Create new token entry in supabase
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour expiry

      const { data, error: insertError } = await supabase
        .from('qr_tokens')
        .insert({
          patient_id: patientId,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single()

      if (insertError) throw insertError

      setToken(data.token_string)
      setStatus('generated')
    } catch (err) {
      console.error('Error generating QR token:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) return

    // Set up real-time listener for when the token is claimed (is_used becomes true)
    const subscription = supabase
      .channel(`qr_tokens_changes_${token}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'qr_tokens',
          filter: `token_string=eq.${token}`,
        },
        (payload) => {
          if (payload.new.is_used) {
            setStatus('claimed')
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [token])

  return (
    <>
      {status === 'idle' && (
        <button 
          onClick={handleGenerateQR}
          disabled={loading}
          className="mt-4 w-full py-2.5 px-4 rounded-lg border border-emerald-400 bg-emerald-500/10 text-emerald-300 font-mono text-xs uppercase tracking-[0.1em] hover:bg-emerald-500/20 hover:text-emerald-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.15)] backdrop-blur-md"
          style={{ cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'GENERATING SECURE TOKEN...' : 'GENERATE FAMILY ACCESS QR'}
        </button>
      )}

      {status === 'generated' && token && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-slate-900/80 backdrop-blur-xl border border-emerald-500/40 shadow-[0_0_50px_rgba(16,185,129,0.15)] rounded-2xl py-10 px-8 flex flex-col items-center max-w-sm w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Decorative gradient */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-600 to-teal-400"></div>
            
            <button
               onClick={() => setStatus('idle')}
               className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors text-lg z-10"
             >
               ✕
             </button>
             
             <h3 className="text-emerald-400 font-mono text-xs tracking-widest mb-8 text-center mt-2">SECURE FAMILY ACCESS LINK</h3>
            
            <div className="relative p-6 bg-black/40 rounded-xl border border-white/5 mb-6">
              {/* Top Left Corner */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-500/70 rounded-tl-xl"></div>
              {/* Top Right Corner */}
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-500/70 rounded-tr-xl"></div>
              {/* Bottom Left Corner */}
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-500/70 rounded-bl-xl"></div>
              {/* Bottom Right Corner */}
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-500/70 rounded-br-xl"></div>

              <QRCodeSVG 
                value={token} 
                size={160} 
                level="H" 
                bgColor="transparent" 
                fgColor="#10b981"
                includeMargin={true}
              />
            </div>
            
            <div className="flex items-center gap-3 mb-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <p className="text-emerald-400/80 font-mono text-[11px] uppercase tracking-[0.2em] animate-pulse">
                Awaiting Mobile Sync...
              </p>
            </div>

            <p className="mt-4 text-[10px] text-slate-500 text-center leading-relaxed font-mono px-4">
              SCAN THIS QR CODE USING THE SYNAPSE MOBILE APP TO ESTABLISH A SECURE CONNECTION
            </p>
          </div>
        </div>
      )}

      {status === 'claimed' && (
        <div className="w-full py-2.5 px-4 rounded-lg border border-emerald-500 bg-emerald-500/20 text-emerald-400 font-mono text-xs uppercase tracking-[0.1em] flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)] backdrop-blur-md">
          <span className="text-lg leading-none mr-2">✓</span> CONNECTION ESTABLISHED
        </div>
      )}

      {error && (
        <p className="text-rose-500 text-xs mt-2 font-mono bg-rose-500/10 p-2 rounded">
          ERROR: {error}
        </p>
      )}
    </>
  )
}
