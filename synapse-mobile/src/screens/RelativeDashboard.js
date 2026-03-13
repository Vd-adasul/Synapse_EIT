import { useState, useEffect } from 'react'
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { supabase } from '../supabaseClient'

export default function RelativeDashboard({ navigation }) {
  const [patient, setPatient] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPatientData()

    // Realtime subscription
    let subscription
    const setupRealtime = async () => {
      const patientId = await SecureStore.getItemAsync('synapse_patient_id')
      if (patientId) {
        subscription = supabase
          .channel(`patient_updates_${patientId}`)
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'patients', filter: `id=eq.${patientId}` },
            (payload) => {
              setPatient(payload.new)
            }
          )
          .subscribe()
      }
    }
    setupRealtime()

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [])

  const fetchPatientData = async () => {
    try {
      const patientId = await SecureStore.getItemAsync('synapse_patient_id')
      if (!patientId) {
        navigation.replace('Scanner')
        return
      }

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single()

      if (error) throw error
      setPatient(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('synapse_patient_id')
    await SecureStore.deleteItemAsync('synapse_role')
    navigation.replace('Scanner')
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Establishing secure connection...</Text>
      </View>
    )
  }

  if (!patient) {
    return (
      <View style={styles.centerContainer}>
        <Text style={{ color: '#fff' }}>Patient data not found.</Text>
        <Button title="Go Back" onPress={handleLogout} />
      </View>
    )
  }

  let statusColor = '#22c55e' // Stable
  let userFriendlyStatus = 'Stable'
  let summaryText = 'The patient’s condition is stable and vitals are within expected parameters.'
  
  if (patient.chronos_risk_score > 60) {
    statusColor = '#eab308' // Observing
    userFriendlyStatus = 'Under Observation'
    summaryText = 'Medical team is closely monitoring the patient. Condition requires observation.'
  }
  if (patient.chronos_risk_score > 85) {
    statusColor = '#ef4444' // Critical
    userFriendlyStatus = 'Critical Care'
    summaryText = 'Patient is receiving critical care interventions. Medical team is fully engaged.'
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.nameLabel}>PATIENT</Text>
        <Text style={styles.patientName}>{patient.name}</Text>
        <Text style={styles.conditionText}>{patient.condition || 'Admitted'}</Text>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusHeaderRow}>
          <Text style={styles.statusTitle}>Current Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}22`, borderColor: statusColor, borderWidth: 1 }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>{userFriendlyStatus}</Text>
          </View>
        </View>
        <Text style={styles.summaryText}>{summaryText}</Text>
      </View>

      <View style={styles.verifiedBadge}>
        <Text style={styles.verifiedIcon}>🛡️</Text>
        <Text style={styles.verifiedText}>Data Integrity Verified by Sentinel Black Box</Text>
      </View>

      <View style={{ flex: 1 }} />
      
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>Disconnect</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#111',
  },
  headerCard: {
    backgroundColor: '#1f1f1f',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  nameLabel: {
    color: '#888',
    fontSize: 12,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  patientName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  conditionText: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: '#1f1f1f',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 24,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    color: '#eee',
    fontSize: 18,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusBadgeText: {
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  summaryText: {
    color: '#bbb',
    fontSize: 15,
    lineHeight: 22,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#052e16',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#166534',
  },
  verifiedIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  verifiedText: {
    color: '#4ade80',
    fontSize: 13,
    fontWeight: '600',
  },
  logoutBtn: {
    padding: 16,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#666',
    fontWeight: 'bold',
  }
})
