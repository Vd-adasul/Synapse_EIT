import * as SecureStore from 'expo-secure-store';

const ROLE_KEY = 'synapse_role';
const DOCTOR_ID_KEY = 'synapse_doctor_uid';

export type DoctorSession = {
  role: 'doctor';
  doctorId: string;
};

export async function loadDoctorSession(): Promise<DoctorSession | null> {
  const [role, doctorId] = await Promise.all([
    SecureStore.getItemAsync(ROLE_KEY),
    SecureStore.getItemAsync(DOCTOR_ID_KEY),
  ]);

  if (role !== 'doctor' || !doctorId) {
    return null;
  }

  return {
    role: 'doctor',
    doctorId,
  };
}

export async function saveDoctorSession(doctorId: string): Promise<DoctorSession> {
  const normalizedDoctorId = doctorId.trim();

  await Promise.all([
    SecureStore.setItemAsync(ROLE_KEY, 'doctor'),
    SecureStore.setItemAsync(DOCTOR_ID_KEY, normalizedDoctorId),
  ]);

  return {
    role: 'doctor',
    doctorId: normalizedDoctorId,
  };
}

export async function clearDoctorSession() {
  await Promise.all([
    SecureStore.deleteItemAsync(ROLE_KEY),
    SecureStore.deleteItemAsync(DOCTOR_ID_KEY),
  ]);
}
