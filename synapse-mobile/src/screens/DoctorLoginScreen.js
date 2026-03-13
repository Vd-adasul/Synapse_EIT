import { useState } from 'react'
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import * as SecureStore from 'expo-secure-store'

export default function DoctorLoginScreen({ navigation }) {
  const [doctorId, setDoctorId] = useState('')
  const [loading, setLoading] = useState(false)

  // In a real app we would use Supabase auth. 
  // For the hackathon, we'll do a simple mock-login based on User table.
  const handleLogin = async () => {
    if (!doctorId) return
    setLoading(true)
    
    // For demo purposes, we will just securely store the ID.
    // In a full implementation we'd check against the 'users' table 
    // where role = 'doctor'.
    await SecureStore.setItemAsync('synapse_role', 'doctor')
    await SecureStore.setItemAsync('synapse_doctor_uid', doctorId) // e.g. "Doc01"
    
    setLoading(false)
    navigation.replace('MobileChronos')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Project Sentinel</Text>
      <Text style={styles.subtitle}>Doctor / Admin Portal</Text>
      
      <View style={styles.form}>
        <Text style={styles.label}>Medical ID Number</Text>
        <TextInput
          style={styles.input}
          value={doctorId}
          onChangeText={setDoctorId}
          placeholder="e.g. DOC-404"
          placeholderTextColor="#666"
          autoCapitalize="none"
        />
        
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginBtnText}>Secure Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#111',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  form: {
    backgroundColor: '#1f1f1f',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  label: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    color: '#fff',
    padding: 14,
    fontSize: 16,
    marginBottom: 24,
  },
  loginBtn: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
})
