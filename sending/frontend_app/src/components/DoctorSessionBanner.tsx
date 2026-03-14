'use client';

import { useEffect, useState } from 'react';

import {
  readDoctorSession,
  requestDoctorLogout,
  subscribeToDoctorSession,
  type DoctorSession,
} from '../lib/doctorSession';

export default function DoctorSessionBanner() {
  const [doctorSession, setDoctorSession] = useState<DoctorSession | null>(() => readDoctorSession());

  useEffect(() => {
    return subscribeToDoctorSession(setDoctorSession);
  }, []);

  if (!doctorSession) {
    return (
      <div className="max-w-xl mx-auto mt-32 mb-12 animate-[fadeIn_1s_ease-out]">
        <div className="glass rounded-[40px] p-10 text-center relative overflow-hidden group">
           {/* Background Glow */}
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
           
           <span className="text-[10px] uppercase tracking-[0.4em] font-black text-neutral-500 mb-6 block">Device Status</span>
           <p className="text-xl font-serif text-white tracking-tight mb-4 lowercase italic">"disconnected"</p>
           <p className="text-[11px] font-sans font-bold text-neutral-500 uppercase tracking-widest leading-relaxed">
             Opening inside Synapse Mobile <br/>
             will automatically sync session.
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-32 mb-12 animate-[fadeIn_1s_ease-out]">
      <div className="glass rounded-[40px] p-10 relative overflow-hidden border-violet-500/20">
         {/* Active Pulse Background */}
         <div className="absolute -right-20 -top-20 w-40 h-40 bg-violet-600/10 rounded-full blur-[60px]" />
         
         <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_8px_#8b5cf6]"></span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.4em] font-black text-violet-500">Live Doctor Link</span>
            </div>
            
            <h2 className="text-4xl font-serif text-white tracking-tight mb-2">{doctorSession.doctorId}</h2>
            <p className="text-[11px] font-sans font-bold text-neutral-500 uppercase tracking-widest mb-8">Verified Clinical Identifier</p>

            <button
              type="button"
              onClick={requestDoctorLogout}
              className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition-all active:scale-95"
            >
              Terminate Session
            </button>
         </div>
      </div>
    </div>
  );
}
