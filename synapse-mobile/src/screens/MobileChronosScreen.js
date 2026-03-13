import { useState, useEffect } from 'react'
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import * as Notifications from 'expo-notifications'
import { supabase } from '../supabaseClient'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function MobileChronosScreen({ navigation }) {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    requestPermissions()
    fetchPatients()

    const subscription = supabase
      .channel('public:patients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, payload => {
        // Simple refresh logic
        fetchPatients()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Push notification permissions not granted!');
    }
  }

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('chronos_risk_score', { ascending: false })

      if (error) throw error
      
      // Check for high-risk patients to trigger notifications
      if (patients.length > 0) {
        data.forEach(newP => {
          const oldP = patients.find(p => p.id === newP.id)
          // If a patient crossed the 85% threshold
          if (newP.chronos_risk_score > 85 && (!oldP || oldP.chronos_risk_score <= 85)) {
            sendCriticalAlert(newP)
          }
        })
      }
      
      setPatients(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const sendCriticalAlert = async (patient) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚠️ CRITICAL ALERT: Chronos AI",
        body: `${patient.name} has crossed the 85% risk threshold (${patient.chronos_risk_score}%). Immediate attention recommended.`,
        sound: true,
      },
      trigger: null, // trigger immediately
    });
  }

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('synapse_role')
    await SecureStore.deleteItemAsync('synapse_doctor_uid')
    navigation.replace('Scanner')
  }

  const renderItem = ({ item }) => {
    let riskColor = '#22c55e'
    let riskLabel = 'Stable'
    if (item.chronos_risk_score > 60) { riskColor = '#eab308'; riskLabel = 'Caution' }
    if (item.chronos_risk_score > 85) { riskColor = '#ef4444'; riskLabel = 'Critical' }

    return (
      <View style={styles.patientCard}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{item.name}</Text>
          <Text style={styles.patientCondition}>{item.condition || 'Admitted'}</Text>
        </View>
        <View style={styles.riskBadgeWrapper}>
          <Text style={styles.riskLabelText}>RISK</Text>
          <View style={[styles.riskBadge, { backgroundColor: `${riskColor}22`, borderColor: riskColor }]}>
            <Text style={[styles.riskScore, { color: riskColor }]}>{item.chronos_risk_score}%</Text>
          </View>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Assigned Patients</Text>
      <Text style={styles.headerSubtitle}>Sorted by AI Risk Score</Text>
      
      <FlatList
        data={patients}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
      
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>Log Out</Text>
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
    backgroundColor: '#111',
    paddingTop: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 20,
  },
  headerSubtitle: {
    color: '#888',
    fontSize: 14,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  patientCard: {
    flexDirection: 'row',
    backgroundColor: '#1f1f1f',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  patientCondition: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 4,
  },
  riskBadgeWrapper: {
    alignItems: 'center',
  },
  riskLabelText: {
    color: '#666',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 1,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  riskScore: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutBtn: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#ef4444',
    fontWeight: 'bold',
  }
})
