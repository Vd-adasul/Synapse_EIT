import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, type Href } from 'expo-router';

import { loadDoctorSession, saveDoctorSession } from '@/src/session/doctorSession';

const DOCTOR_FRONTEND_ROUTE = '/doctor-frontend' as Href;

export default function DoctorLoginRoute() {
  const [doctorId, setDoctorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    loadDoctorSession()
      .then((session) => {
        if (!isMounted) {
          return;
        }

        if (session) {
          router.replace(DOCTOR_FRONTEND_ROUTE);
          return;
        }

        setCheckingSession(false);
      })
      .catch(() => {
        if (isMounted) {
          setCheckingSession(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = async () => {
    const normalizedDoctorId = doctorId.trim();

    if (!normalizedDoctorId || loading) {
      return;
    }

    setLoading(true);

    try {
      await saveDoctorSession(normalizedDoctorId);
      router.replace(DOCTOR_FRONTEND_ROUTE);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={styles.loadingText}>Restoring doctor session...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', default: undefined })}
      style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Synapse Mobile</Text>
        <Text style={styles.title}>Doctor Sign-In</Text>
        <Text style={styles.subtitle}>
          Your doctor ID will be stored securely on this device so the doctor frontend can reopen
          with the same signed-in session.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Medical ID Number</Text>
        <TextInput
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder="e.g. DOC-404"
          placeholderTextColor="#64748b"
          style={styles.input}
          value={doctorId}
          onChangeText={setDoctorId}
          editable={!loading}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}>
          {loading ? <ActivityIndicator color="#02131d" /> : <Text style={styles.loginText}>Continue</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#020617',
    padding: 24,
  },
  loadingText: {
    marginTop: 14,
    color: '#cbd5e1',
    fontSize: 15,
  },
  container: {
    flex: 1,
    backgroundColor: '#020617',
    paddingHorizontal: 24,
    paddingTop: 72,
  },
  backButton: {
    marginBottom: 24,
  },
  backText: {
    color: '#7dd3fc',
    fontSize: 15,
    fontWeight: '600',
  },
  hero: {
    marginBottom: 28,
  },
  eyebrow: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    color: '#f8fafc',
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 15,
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 20,
  },
  label: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#020617',
    color: '#f8fafc',
    fontSize: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 18,
  },
  loginButton: {
    borderRadius: 16,
    backgroundColor: '#67e8f9',
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginText: {
    color: '#02131d',
    fontSize: 16,
    fontWeight: '800',
  },
});
