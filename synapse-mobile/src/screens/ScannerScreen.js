import { useState, useEffect } from 'react'
import { StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import * as SecureStore from 'expo-secure-store'
import { supabase } from '../supabaseClient'

export default function ScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    // Check if they are already logged in as relative
    SecureStore.getItemAsync('synapse_patient_id').then((id) => {
      if (id) {
        navigation.replace('RelativeDashboard')
      }
    })
  }, [])

  if (!permission) {
    return <View />
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    )
  }

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true)
    setErrorMsg('')
    try {
      // Data is expected to be a UUID (the token_string)
      // Check if it exists and is not used
      const { data: tokenData, error } = await supabase
        .from('qr_tokens')
        .select('*')
        .eq('token_string', data)
        .eq('is_used', false)
        .single()

      if (error || !tokenData) {
        setErrorMsg('Invalid or already used QR code. Please ask the Doctor for a new one.')
        setTimeout(() => setScanned(false), 3000)
        return
      }

      // Check expiry
      if (new Date(tokenData.expires_at) < new Date()) {
        setErrorMsg('This QR code has expired.')
        setTimeout(() => setScanned(false), 3000)
        return
      }

      // Mark as used
      const { error: updateError } = await supabase
        .from('qr_tokens')
        .update({ is_used: true })
        .eq('id', tokenData.id)

      if (updateError) throw updateError

      // Secure store patient id
      await SecureStore.setItemAsync('synapse_role', 'relative')
      await SecureStore.setItemAsync('synapse_patient_id', tokenData.patient_id)
      
      // Navigate to Dashboard
      navigation.replace('RelativeDashboard')

    } catch (err) {
      console.error(err)
      setErrorMsg('An error occurred during validation.')
      setTimeout(() => setScanned(false), 3000)
    }
  }

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      >
        <View style={styles.overlay}>
          <Text style={styles.hintText}>Scan the Doctor's QR code to view patient status</Text>
          <View style={styles.scannerFrame} />
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}
        </View>
      </CameraView>
      
      {/* Hidden button for Doctor Login route */}
      <TouchableOpacity 
        style={styles.doctorLoginBtn}
        onPress={() => navigation.navigate('DoctorLogin')}
      >
        <Text style={styles.doctorLoginText}>Doctor Portal</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#3b82f6',
    backgroundColor: 'transparent',
    borderRadius: 20,
    marginTop: 20,
  },
  hintText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  errorBox: {
    position: 'absolute',
    bottom: 100,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 20,
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  doctorLoginBtn: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    padding: 10,
  },
  doctorLoginText: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
  }
})
