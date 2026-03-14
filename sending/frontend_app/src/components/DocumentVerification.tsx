'use client';

import React, { useState, useRef, useCallback } from 'react';

interface VerificationResult {
  fraudRiskScore: number;
  isFlagged: boolean;
  reasons: string[];
  extractedText?: string;
  hospitalVerified: boolean;
}

type VerificationStage = 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';

export default function DocumentVerification() {
  const [hospitalId, setHospitalId] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [stage, setStage] = useState<VerificationStage>('idle');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setStage('idle');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
      setStage('idle');
    }
  }, []);

  const handleSubmit = async () => {
    if (!hospitalId || !estimatedCost || !selectedFile) {
      setErrorMsg('Please fill all fields and select a document.');
      return;
    }

    setErrorMsg('');
    setStage('uploading');

    try {
      // Simulate network upload phase
      await new Promise(resolve => setTimeout(resolve, 800));
      setStage('analyzing');

      // For the hackathon demo: simulate the backend verify-document call
      // In production, this would POST to your backend:
      // const formData = new FormData();
      // formData.append('hospitalId', hospitalId);
      // formData.append('estimatedCost', estimatedCost);
      // formData.append('document', selectedFile);
      // const response = await fetch('/api/verify-document', { method: 'POST', body: formData });
      // const data = await response.json();
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulated verification result for demo
      const mockResult: VerificationResult = {
        fraudRiskScore: Math.random() * 0.15, // Low risk for demo
        isFlagged: false,
        reasons: [],
        extractedText: `Hospital: ${hospitalId}\nEstimated Cost: ₹${estimatedCost}\nDocument: ${selectedFile.name}\nVerification timestamp: ${new Date().toISOString()}`,
        hospitalVerified: true,
      };

      setResult(mockResult);
      setStage('complete');
    } catch (err) {
      console.error('Verification failed:', err);
      setErrorMsg('Verification service unavailable. Please try again.');
      setStage('error');
    }
  };

  const resetForm = () => {
    setStage('idle');
    setResult(null);
    setSelectedFile(null);
    setHospitalId('');
    setEstimatedCost('');
    setErrorMsg('');
  };

  const getRiskColor = (score: number) => {
    if (score < 0.2) return { color: '#10b981', label: 'Low Risk', bg: 'emerald' };
    if (score < 0.5) return { color: '#f59e0b', label: 'Medium Risk', bg: 'amber' };
    return { color: '#ef4444', label: 'High Risk', bg: 'red' };
  };

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 scroll-mt-24">
      <div className="text-center mb-16">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500 mb-4 block">
          Neural Verification Engine
        </span>
        <h2 className="text-5xl font-serif text-white tracking-tight mb-4">
          Document Audit
        </h2>
        <p className="text-neutral-500 text-[11px] font-sans font-bold uppercase tracking-widest leading-relaxed">
          AI-powered fraud detection & hospital verification <br />
          for transparent medical financing.
        </p>
      </div>

      <div className="p-1 glass rounded-[40px] overflow-hidden shadow-2xl">
        <div className="bg-[#030303] rounded-[39px] p-10 space-y-8">

          {/* Stage: COMPLETE - Show results */}
          {stage === 'complete' && result ? (
            <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
              {/* Verification Score */}
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border mb-6 ${
                  result.isFlagged 
                    ? 'border-red-500/20 bg-red-500/5' 
                    : 'border-emerald-500/20 bg-emerald-500/5'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    result.isFlagged ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                  }`} />
                  <span className={`text-[11px] font-black uppercase tracking-widest ${
                    result.isFlagged ? 'text-red-500' : 'text-emerald-500'
                  }`}>
                    {result.isFlagged ? 'Flagged for Review' : 'Verification Passed'}
                  </span>
                </div>

                <h3 className="text-6xl font-serif text-white mb-2">
                  {(result.fraudRiskScore * 100).toFixed(1)}%
                </h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                  Fraud Risk Score
                </p>
              </div>

              {/* Result Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-[24px] border border-white/5 bg-white/[0.01]">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">Hospital</span>
                  <span className={`text-sm font-bold ${result.hospitalVerified ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.hospitalVerified ? '✓ Verified' : '✗ Unverified'}
                  </span>
                </div>
                <div className="p-6 rounded-[24px] border border-white/5 bg-white/[0.01]">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-500 block mb-2">Risk Level</span>
                  <span className={`text-sm font-bold`} style={{ color: getRiskColor(result.fraudRiskScore).color }}>
                    {getRiskColor(result.fraudRiskScore).label}
                  </span>
                </div>
              </div>

              {/* Extracted Text */}
              {result.extractedText && (
                <div className="p-6 rounded-[24px] border border-white/5 bg-white/[0.01]">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-500 block mb-3">Extracted Data</span>
                  <pre className="text-xs font-mono text-neutral-400 whitespace-pre-wrap leading-relaxed">
                    {result.extractedText}
                  </pre>
                </div>
              )}

              {/* Reasons (if flagged) */}
              {result.reasons.length > 0 && (
                <div className="p-6 rounded-[24px] border border-red-500/10 bg-red-500/[0.02]">
                  <span className="text-[10px] uppercase tracking-widest text-red-400 block mb-3">Flag Reasons</span>
                  <ul className="space-y-2">
                    {result.reasons.map((reason, idx) => (
                      <li key={idx} className="text-sm text-red-300 flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* On-chain badge */}
              <div className="flex items-center justify-center gap-2 p-4 rounded-full border border-violet-500/10 bg-violet-500/[0.02]">
                <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-[10px] font-black uppercase tracking-widest text-violet-400">
                  Result anchored to Polygon ledger
                </span>
              </div>

              <button
                onClick={resetForm}
                className="w-full py-4 rounded-full bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-white hover:text-black transition-all active:scale-95"
              >
                Verify Another Document
              </button>
            </div>
          ) : (
            /* Stage: FORM or PROCESSING */
            <div className="space-y-6">
              {/* Hospital ID */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-3 block">
                  Hospital Identifier
                </label>
                <input
                  type="text"
                  value={hospitalId}
                  onChange={(e) => setHospitalId(e.target.value)}
                  placeholder="e.g. AIIMS-DEL-001"
                  disabled={stage !== 'idle' && stage !== 'error'}
                  className="w-full px-6 py-4 rounded-[16px] bg-white/[0.03] border border-white/5 text-white font-mono text-sm placeholder:text-neutral-700 focus:outline-none focus:border-violet-500/30 transition-colors disabled:opacity-50"
                />
              </div>

              {/* Estimated Cost */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-3 block">
                  Estimated Cost (INR)
                </label>
                <input
                  type="number"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  placeholder="e.g. 500000"
                  disabled={stage !== 'idle' && stage !== 'error'}
                  className="w-full px-6 py-4 rounded-[16px] bg-white/[0.03] border border-white/5 text-white font-mono text-sm placeholder:text-neutral-700 focus:outline-none focus:border-violet-500/30 transition-colors disabled:opacity-50"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-3 block">
                  Medical Document
                </label>
                <div
                  onClick={() => (stage === 'idle' || stage === 'error') && fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className={`w-full p-8 rounded-[24px] border-2 border-dashed text-center transition-all cursor-pointer ${
                    selectedFile 
                      ? 'border-violet-500/30 bg-violet-500/[0.02]' 
                      : 'border-white/10 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.02]'
                  } ${(stage !== 'idle' && stage !== 'error') ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm font-mono text-white">{selectedFile.name}</span>
                      <span className="text-[10px] text-neutral-500 uppercase tracking-widest">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-10 h-10 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                        Drop file or click to upload
                      </span>
                      <span className="text-[9px] text-neutral-700 uppercase tracking-wider">
                        PDF, JPG, PNG — Max 10MB
                      </span>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-4 rounded-[16px] bg-red-500/5 border border-red-500/10 text-center">
                  <p className="text-red-400 text-xs font-semibold">{errorMsg}</p>
                </div>
              )}

              {/* Submit Button */}
              {(stage === 'idle' || stage === 'error') ? (
                <button
                  onClick={handleSubmit}
                  disabled={!hospitalId || !estimatedCost || !selectedFile}
                  className="w-full group relative p-[1px] rounded-full overflow-hidden transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  <div className="shiny-border-gradient absolute inset-[-100%] z-0" />
                  <div className="shiny-border-content relative z-10 px-10 py-4 rounded-full flex items-center justify-center gap-3">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-[12px] font-black uppercase tracking-[0.2em] text-white">
                      Initiate Verification
                    </span>
                  </div>
                </button>
              ) : (
                /* Processing State */
                <div className="py-8 flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-2 border-violet-500/20 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-black uppercase tracking-widest text-violet-400 mb-2">
                      {stage === 'uploading' ? 'Uploading Document...' : 'AI Neural Analysis in Progress...'}
                    </p>
                    <p className="text-[10px] text-neutral-600 uppercase tracking-wider">
                      {stage === 'uploading' 
                        ? 'Encrypting and transmitting to verification nodes' 
                        : 'Cross-referencing hospital registry & fraud patterns'}
                    </p>
                  </div>
                  
                  {/* Progress indicators */}
                  <div className="w-full max-w-xs space-y-3 mt-4">
                    <ProgressStep label="Document Upload" done={stage !== 'uploading'} active={stage === 'uploading'} />
                    <ProgressStep label="OCR Extraction" done={false} active={stage === 'analyzing'} />
                    <ProgressStep label="Fraud Analysis" done={false} active={false} />
                    <ProgressStep label="Hospital Verification" done={false} active={false} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ProgressStep({ label, done, active }: { label: string; done: boolean; active: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
        done ? 'border-emerald-500 bg-emerald-500/10' :
        active ? 'border-violet-500 bg-violet-500/10 animate-pulse' :
        'border-white/10 bg-black'
      }`}>
        {done ? (
          <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        ) : active ? (
          <div className="w-2 h-2 rounded-full bg-violet-500" />
        ) : null}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-widest ${
        done ? 'text-emerald-500' :
        active ? 'text-violet-400' :
        'text-neutral-600'
      }`}>
        {label}
      </span>
    </div>
  );
}
