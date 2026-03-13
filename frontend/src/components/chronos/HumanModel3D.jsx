import React, { useRef, useMemo, Suspense, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Sphere, Float } from '@react-three/drei';
import * as THREE from 'three';

// 1. The Holographic Material
const hologramMaterial = new THREE.MeshStandardMaterial({
  color: '#00ffa3', // Neon mint green
  wireframe: true,
  transparent: true,
  opacity: 0.15,
});

// 2. The Model Loader Component
const HologramBody = ({ modelPos, modelRot }) => {
  // Load the new patient GLB file from the public folder
  const { scene } = useGLTF('/patient.glb'); 

  // Apply the holographic wireframe to every mesh in the loaded model
  useMemo(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.material = hologramMaterial;
      }
    });
  }, [scene]);

  // Rotate to lie flat (adjust rotation and position as needed per model)
  const rotation = modelRot || [-Math.PI / 2, 0, -Math.PI / 2]; // Lays him horizontally across the bed
  const position = modelPos || [0, 0, 0]; // Adjust center point
  
  return <primitive object={scene} scale={0.06} position={position} rotation={rotation} />;
};

// 3. The Dynamic Risk Node (The glowing red organ)
const RiskNode = ({ highlightOrgan, riskLevel, calibPos }) => {
  const nodeRef = useRef();

  // Pulse animation for the glowing node
  useFrame(({ clock }) => {
    if (nodeRef.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.2;
      nodeRef.current.scale.set(scale, scale, scale);
    }
  });

  // Map risk types to specific XYZ coordinates inside the horizontal 3D model
  // *IMPORTANT: You will need to tweak these X, Y, Z numbers!*
  // With horizontal models, Z or Y typically runs head-to-toe, and the other runs up/down off the bed.
  const getCoordinates = (organ) => {
    switch (organ) {
      case 'heart': 
      case 'Septic Shock': 
      case 'Post-CABG Recovery':
        return [-0.2, 0.5, 0.4]; // Left Chest (Heart) - Tweak me!
        
      case 'lungs':
      case 'Pneumonia / ARDS': 
        return [0, 0.5, 0.4]; // Center Chest (Lungs) - Tweak me!
        
      case 'kidneys': 
      case 'Acute Kidney Injury':
        return [0, 0.1, -0.4]; // Lower back (Kidneys) - Tweak me!
        
      case 'stomach': 
      case 'GI Bleed':
        return [0, 0.2, 0.8]; // Abdomen - Tweak me!
        
      case 'Trauma - MVC': 
        return [0, 1.2, 0]; // Head - Tweak me!
        
      default: 
        return [0, 999, 0]; // Hide it if no risk
    }
  };

  const position = calibPos || getCoordinates(highlightOrgan);

  // Decide color based on risk level (defaulting to critical red for demo setup if no explicit risk level)
  const baseColor = riskLevel > 0.7 || !riskLevel ? '#e11d48' : (riskLevel > 0.4 ? '#fbbf24' : '#64d2ff');

  if (!highlightOrgan) return null;

  return (
    <Sphere ref={nodeRef} args={[0.08, 16, 16]} position={position}>
      <meshBasicMaterial color={baseColor} wireframe={true} />
    </Sphere>
  );
};

// 4. The Main Canvas Component
export default function HumanModel3D({ highlightOrgan, riskLevel }) {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [activeTab, setActiveTab] = useState('node'); // 'node', 'pos', 'rot'
  
  // Risk Node Calibration
  const [calibX, setCalibX] = useState(0);
  const [calibY, setCalibY] = useState(0);
  const [calibZ, setCalibZ] = useState(0);

  // Model Position Calibration
  const [modelX, setModelX] = useState(0);
  const [modelY, setModelY] = useState(0);
  const [modelZ, setModelZ] = useState(0);

  // Model Rotation Calibration
  const [rotX, setRotX] = useState(-Math.PI / 2);
  const [rotY, setRotY] = useState(0);
  const [rotZ, setRotZ] = useState(-Math.PI / 2);

  // Use highlightOrgan prop or default to 'Septic Shock' for testing the node mapping
  const activeRisk = highlightOrgan || 'Septic Shock';

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden bg-gradient-to-b from-transparent to-slate-900/50">
      
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 2, 6], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        {/* Subtle lighting to make the wireframe pop */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#00ffa3" />
        
        <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
          {/* Render the downloaded human model */}
          <Suspense fallback={<LoadingFallback />}>
            <HologramBody 
              modelPos={isCalibrating ? [modelX, modelY, modelZ] : null} 
              modelRot={isCalibrating ? [rotX, rotY, rotZ] : null} 
            />
            <RiskNode highlightOrgan={activeRisk} riskLevel={riskLevel} calibPos={isCalibrating ? [calibX, calibY, calibZ] : null} />
          </Suspense>
        </Float>
        
        {/* Restricted OrbitControls for a clinical, top-down isometric view */}
        <OrbitControls 
          enableZoom={true} /* Temporarily set to TRUE to debug! */
          enablePan={true}  /* Temporarily set to TRUE to debug! */
          autoRotate={true}
          autoRotateSpeed={0.5}
          minPolarAngle={Math.PI / 4} // Don't let them look from perfectly flat
          maxPolarAngle={Math.PI / 2} // Don't let them look from underneath the bed
        />
      </Canvas>

      {/* High-Tech Overlay Elements */}
      <div className="absolute top-4 left-4 text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-black/40 px-2 py-1 rounded backdrop-blur-sm border border-white/5 z-20">
        Active Scan // Full Body Telemetry
      </div>
      
      {/* Calibration UI */}
      <button 
        onClick={() => setIsCalibrating(!isCalibrating)}
        className="absolute bottom-4 right-4 z-30 bg-slate-800 text-white text-xs px-3 py-1.5 rounded border border-slate-600 focus:outline-none hover:bg-slate-700 transition"
      >
        {isCalibrating ? 'Cancel Calibration' : 'Calibrate Node'}
      </button>

      {isCalibrating && (
        <div className="absolute top-1/2 right-4 -translate-y-1/2 z-30 bg-black/80 p-4 rounded-xl border border-emerald-500/30 backdrop-blur-md flex flex-col gap-3 font-mono text-xs w-64 shadow-2xl">
          <div className="text-emerald-400 font-bold mb-1 border-b border-emerald-400/30 pb-2">3D Calibrator</div>
          
          <div className="flex gap-1 mb-2">
            <button onClick={() => setActiveTab('node')} className={`flex-1 py-1 rounded ${activeTab === 'node' ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400'}`}>Node</button>
            <button onClick={() => setActiveTab('pos')} className={`flex-1 py-1 rounded ${activeTab === 'pos' ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400'}`}>Pos</button>
            <button onClick={() => setActiveTab('rot')} className={`flex-1 py-1 rounded ${activeTab === 'rot' ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400'}`}>Rot</button>
          </div>

          {activeTab === 'node' && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-slate-300 w-4">X:</span>
                <button onClick={() => setCalibX(prev => Number((prev - 0.05).toFixed(2)))} className="bg-slate-700 w-6 h-6 rounded hover:bg-slate-600 flex items-center justify-center">-</button>
                <span className="text-white w-10 text-center">{calibX.toFixed(2)}</span>
                <button onClick={() => setCalibX(prev => Number((prev + 0.05).toFixed(2)))} className="bg-slate-700 w-6 h-6 rounded hover:bg-slate-600 flex items-center justify-center">+</button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300 w-4">Y:</span>
                <button onClick={() => setCalibY(prev => Number((prev - 0.05).toFixed(2)))} className="bg-slate-700 w-6 h-6 rounded hover:bg-slate-600 flex items-center justify-center">-</button>
                <span className="text-white w-10 text-center">{calibY.toFixed(2)}</span>
                <button onClick={() => setCalibY(prev => Number((prev + 0.05).toFixed(2)))} className="bg-slate-700 w-6 h-6 rounded hover:bg-slate-600 flex items-center justify-center">+</button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300 w-4">Z:</span>
                <button onClick={() => setCalibZ(prev => Number((prev - 0.05).toFixed(2)))} className="bg-slate-700 w-6 h-6 rounded hover:bg-slate-600 flex items-center justify-center">-</button>
                <span className="text-white w-10 text-center">{calibZ.toFixed(2)}</span>
                <button onClick={() => setCalibZ(prev => Number((prev + 0.05).toFixed(2)))} className="bg-slate-700 w-6 h-6 rounded hover:bg-slate-600 flex items-center justify-center">+</button>
              </div>
            </>
          )}

          {activeTab === 'pos' && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-slate-300 w-4">X:</span>
                <button onClick={() => setModelX(prev => Number((prev - 0.1).toFixed(2)))} className="bg-slate-700 w-6 h-6 rounded hover:bg-slate-600 flex items-center justify-center">-</button>
                <span className="text-white w-10 text-center">{modelX.toFixed(2)}</span>
                <button onClick={() => setModelX(prev => Number((prev + 0.1).toFixed(2)))} className="bg-slate-700 w-6 h-6 rounded hover:bg-slate-600 flex items-center justify-center">+</button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300 w-4">Y:</span>
                <button onClick={() => setModelY(prev => Number((prev - 0.1).toFixed(2)))} className="bg-slate-700 w-6 h-6 rounded hover:bg-slate-600 flex items-center justify-center">-</button>
                <span className="text-white w-10 text-center">{modelY.toFixed(2)}</span>
                <button onClick={() => setModelY(prev => Number((prev + 0.1).toFixed(2)))} className="bg-slate-700 w-6 h-6 rounded hover:bg-slate-600 flex items-center justify-center">+</button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300 w-4">Z:</span>
                <button onClick={() => setModelZ(prev => Number((prev - 0.1).toFixed(2)))} className="bg-slate-700 w-6 h-6 rounded hover:bg-slate-600 flex items-center justify-center">-</button>
                <span className="text-white w-10 text-center">{modelZ.toFixed(2)}</span>
                <button onClick={() => setModelZ(prev => Number((prev + 0.1).toFixed(2)))} className="bg-slate-700 w-6 h-6 rounded hover:bg-slate-600 flex items-center justify-center">+</button>
              </div>
            </>
          )}

          {activeTab === 'rot' && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-slate-300 w-4">X:</span>
                <button onClick={() => setRotX(prev => Number((prev - 0.1).toFixed(2)))} className="bg-slate-700 w-6 h-6 rounded hover:bg-slate-600 flex items-center justify-center">-</button>
                <span className="text-white w-10 text-center">{rotX.toFixed(2)}</span>
                <button onClick={() => setRotX(prev => Number((prev + 0.1).toFixed(2)))} className="bg-slate-700 w-6 h-6 rounded hover:bg-slate-600 flex items-center justify-center">+</button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300 w-4">Y:</span>
                <button onClick={() => setRotY(prev => Number((prev - 0.1).toFixed(2)))} className="bg-slate-700 w-6 h-6 rounded hover:bg-slate-600 flex items-center justify-center">-</button>
                <span className="text-white w-10 text-center">{rotY.toFixed(2)}</span>
                <button onClick={() => setRotY(prev => Number((prev + 0.1).toFixed(2)))} className="bg-slate-700 w-6 h-6 rounded hover:bg-slate-600 flex items-center justify-center">+</button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300 w-4">Z:</span>
                <button onClick={() => setRotZ(prev => Number((prev - 0.1).toFixed(2)))} className="bg-slate-700 w-6 h-6 rounded hover:bg-slate-600 flex items-center justify-center">-</button>
                <span className="text-white w-10 text-center">{rotZ.toFixed(2)}</span>
                <button onClick={() => setRotZ(prev => Number((prev + 0.1).toFixed(2)))} className="bg-slate-700 w-6 h-6 rounded hover:bg-slate-600 flex items-center justify-center">+</button>
              </div>
            </>
          )}
          
          <button onClick={() => {
            console.log(`\n✅ CALIBRATION LOCKED!`);
            console.log(`👉 MODEL POSITION: const position = [${modelX}, ${modelY}, ${modelZ}];`);
            console.log(`👉 MODEL ROTATION: const rotation = [${rotX}, ${rotY}, ${rotZ}];`);
            console.log(`👉 RISK NODE (activeRisk: "${activeRisk}"): return [${calibX}, ${calibY}, ${calibZ}];\n`);
            setIsCalibrating(false);
          }} className="mt-2 w-full bg-emerald-500/20 text-emerald-300 py-2 rounded font-bold hover:bg-emerald-500/40 transition-colors border border-emerald-500/30">
            Log Coordinates & Lock
          </button>
        </div>
      )}
      
      {/* Scanning Laser Line (CSS Animation) */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-emerald-400/50 shadow-[0_0_10px_#34d399] animate-[scan_3s_ease-in-out_infinite] z-10 pointer-events-none" />
    </div>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshBasicMaterial color="#00ffa3" wireframe={true} />
    </mesh>
  );
}
