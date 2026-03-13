import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

// This is the master component that routes the user
export default function AppGateway() {
  const [userRole, setUserRole] = useState<'none' | 'doctor' | 'family'>('none');

  // --- GATEWAY SCREEN ---
  if (userRole === 'none') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Synapse EIT</Text>
        <Text style={styles.subtitle}>Select Access Level</Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => setUserRole('doctor')}>
          <Text style={styles.primaryBtnText}>CLINICAL STAFF (DOCTOR)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => setUserRole('family')}>
          <Text style={styles.secondaryBtnText}>FAMILY ACCESS (QR SCAN)</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- DOCTOR FLOW ---
  if (userRole === 'doctor') {
    return <DoctorDashboard onBack={() => setUserRole('none')} />;
  }

  // --- FAMILY FLOW ---
  if (userRole === 'family') {
    return <FamilyFlow onBack={() => setUserRole('none')} />;
  }
}

// ==========================================
// 🩺 DOCTOR DASHBOARD COMPONENT
// ==========================================
function DoctorDashboard({ onBack }: { onBack: () => void }) {
  // Mock data showing multiple patients sorted by risk
  const patients = [
    { bed: '11', name: 'M. Reddy', risk: '92%', status: 'CRITICAL', color: '#e11d48' },
    { bed: '04', name: 'R. Sharma', risk: '89%', status: 'WARNING', color: '#fbbf24' },
    { bed: '07', name: 'S. Patel', risk: '85%', status: 'WARNING', color: '#fbbf24' },
    { bed: '02', name: 'A. Gupta', risk: '76%', status: 'STABLE', color: '#34d399' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack}><Text style={styles.backText}>← LOGOUT</Text></TouchableOpacity>
        <Text style={styles.headerBadgeText}>DR. KANT // ON CALL</Text>
      </View>

      <Text style={styles.title}>My Patients</Text>
      <Text style={styles.subtitle}>Chronos Triage Radar</Text>

      <ScrollView style={{ width: '100%' }}>
        {patients.map((p, index) => (
          <View key={index} style={[styles.patientCard, { borderLeftColor: p.color, borderLeftWidth: 4 }]}>
            <View>
              <Text style={styles.patientName}>Bed {p.bed} - {p.name}</Text>
              <Text style={[styles.statusLabel, { color: p.color }]}>{p.status}</Text>
            </View>
            <View style={styles.riskCircle}>
              <Text style={styles.riskText}>{p.risk}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ==========================================
// 👨👩👦 FAMILY SCANNER COMPONENT (From previous step)
// ==========================================
function FamilyFlow({ onBack }: { onBack: () => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [patientData, setPatientData] = useState<string | null>(null);

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>Camera access required for QR Sync.</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.primaryBtnText}>GRANT PERMISSION</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: 20 }} onPress={onBack}>
          <Text style={styles.backText}>← BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isScanning) {
    return (
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={({ data }) => {
            setIsScanning(false);
            setPatientData(data); // Unlocks the dashboard
          }}
        />
        <View style={styles.overlay}>
          <Text style={styles.scanText}>ALIGN QR CODE</Text>
          <View style={styles.scanTarget} />
          <TouchableOpacity style={styles.cancelBtn} onPress={onBack}>
            <Text style={styles.cancelText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBadge}>
        <Text style={styles.headerBadgeText}>✓ SECURE CONNECTION</Text>
      </View>
      <Text style={styles.title}>R. Sharma</Text>
      <Text style={styles.subtitle}>Bed 4 • Post-CABG Recovery</Text>

      <View style={styles.card}>
        <Text style={styles.statusLabel}>CURRENT STATUS</Text>
        <Text style={styles.statusValue}>Stable / Observing</Text>
        <View style={styles.divider} />
        <Text style={styles.statusLabel}>AI PREDICTIVE OUTCOME</Text>
        <Text style={styles.aiValue}>89% Positive Trajectory</Text>
      </View>

      <TouchableOpacity style={styles.primaryBtn} onPress={onBack}>
        <Text style={styles.primaryBtnText}>DISCONNECT</Text>
      </TouchableOpacity>
    </View>
  );
}

// ==========================================
// STYLES
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06080d', alignItems: 'center', justifyContent: 'center', padding: 20, paddingTop: 60 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 40, letterSpacing: 2, textTransform: 'uppercase' },
  
  // Buttons
  primaryBtn: { backgroundColor: 'rgba(52, 211, 153, 0.1)', borderWidth: 1, borderColor: '#34d399', width: '100%', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  primaryBtnText: { color: '#34d399', fontWeight: 'bold', letterSpacing: 1.5 },
  secondaryBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#334155', width: '100%', padding: 18, borderRadius: 12, alignItems: 'center' },
  secondaryBtnText: { color: '#94a3b8', fontWeight: 'bold', letterSpacing: 1.5 },
  
  // Doctor Dashboard
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 30 },
  backText: { color: '#64748b', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  patientCard: { backgroundColor: '#0f172a', padding: 20, borderRadius: 12, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  patientName: { color: '#f8fafc', fontSize: 18, fontWeight: 'bold' },
  riskCircle: { backgroundColor: 'rgba(255,255,255,0.05)', width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  riskText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  // Family Dashboard (reused from previous step)
  card: { backgroundColor: '#0f172a', padding: 24, borderRadius: 16, width: '100%', marginBottom: 30 },
  statusLabel: { fontSize: 10, color: '#64748b', letterSpacing: 1.5, marginBottom: 5 },
  statusValue: { fontSize: 18, color: '#38bdf8', fontWeight: '600' },
  aiValue: { fontSize: 18, color: '#34d399', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#1e293b', marginVertical: 20 },
  headerBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#34d399', marginBottom: 20 },
  headerBadgeText: { color: '#34d399', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  
  // Scanner
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', width: '100%' },
  scanTarget: { width: 250, height: 250, borderWidth: 2, borderColor: '#34d399', marginBottom: 40 },
  scanText: { color: '#34d399', fontFamily: 'monospace', marginBottom: 20, letterSpacing: 2 },
  cancelBtn: { backgroundColor: '#1e293b', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  cancelText: { color: '#94a3b8' }
});
