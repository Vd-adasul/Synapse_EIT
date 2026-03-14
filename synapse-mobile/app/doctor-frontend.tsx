import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, type Href } from 'expo-router';
import { WebView } from 'react-native-webview';

import {
  clearDoctorSession,
  loadDoctorSession,
  type DoctorSession,
} from '@/src/session/doctorSession';

type FrontendMessage =
  | {
      type: 'logout';
    }
  | {
      type: 'session-ready';
    };

const configuredFrontendUrl = process.env.EXPO_PUBLIC_SENDING_FRONTEND_URL;
const DOCTOR_LOGIN_ROUTE = '/doctor-login' as Href;

function getFallbackFrontendUrl() {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }

  return 'http://localhost:3000';
}

function createSessionInjection(session: DoctorSession) {
  const serializedSession = JSON.stringify(session);

  return `
    (function() {
      var session = ${serializedSession};
      window.__SYNAPSE_SESSION__ = session;
      try {
        window.localStorage.setItem('synapse_doctor_session', JSON.stringify(session));
      } catch (error) {}
      try {
        window.dispatchEvent(new CustomEvent('synapse-session', { detail: session }));
      } catch (error) {}
    })();
    true;
  `;
}

export default function DoctorFrontendRoute() {
  const [doctorSession, setDoctorSession] = useState<DoctorSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [webViewError, setWebViewError] = useState<string | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadDoctorSession()
      .then((session) => {
        if (!isMounted) {
          return;
        }

        if (!session) {
          router.replace(DOCTOR_LOGIN_ROUTE);
          return;
        }

        setDoctorSession(session);
        setSessionLoading(false);
      })
      .catch(() => {
        if (isMounted) {
          setSessionLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const frontendUrl = configuredFrontendUrl || getFallbackFrontendUrl();
  const injectedJavaScriptBeforeContentLoaded = useMemo(() => {
    if (!doctorSession) {
      return undefined;
    }

    return createSessionInjection(doctorSession);
  }, [doctorSession]);

  const handleLogout = async () => {
    if (logoutLoading) {
      return;
    }

    setLogoutLoading(true);

    try {
      await clearDoctorSession();
      router.replace('/');
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleFrontendMessage = async (rawData: string) => {
    try {
      const data = JSON.parse(rawData) as FrontendMessage;

      if (data.type === 'logout') {
        await handleLogout();
      }
    } catch {
      // Ignore messages that are not part of the doctor bridge contract.
    }
  };

  if (sessionLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#67e8f9" />
        <Text style={styles.loadingText}>Loading doctor workspace...</Text>
      </View>
    );
  }

  if (!doctorSession) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorTitle}>Doctor session not found</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace(DOCTOR_LOGIN_ROUTE)}>
          <Text style={styles.primaryButtonText}>Go to Doctor Sign-In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>Doctor Frontend</Text>
          <Text style={styles.title}>{doctorSession.doctorId}</Text>
          <Text style={styles.subtitle}>
            This screen reuses the same doctor session stored by the mobile app.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, logoutLoading && styles.logoutButtonDisabled]}
          onPress={handleLogout}
          disabled={logoutLoading}>
          <Text style={styles.logoutButtonText}>{logoutLoading ? 'Signing out...' : 'Sign Out'}</Text>
        </TouchableOpacity>
      </View>

      {!configuredFrontendUrl ? (
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>
            Using fallback frontend URL `{frontendUrl}`. Set `EXPO_PUBLIC_SENDING_FRONTEND_URL`
            for a physical device or deployed frontend.
          </Text>
        </View>
      ) : null}

      {webViewError ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Could not load the doctor frontend</Text>
          <Text style={styles.errorBody}>{webViewError}</Text>
          <Text style={styles.errorBody}>Tried URL: {frontendUrl}</Text>
        </View>
      ) : (
        <WebView
          source={{ uri: frontendUrl }}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          startInLoadingState
          injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded}
          onMessage={(event) => {
            void handleFrontendMessage(event.nativeEvent.data);
          }}
          onError={(event) => {
            setWebViewError(event.nativeEvent.description || 'Unknown WebView error');
          }}
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color="#67e8f9" />
              <Text style={styles.loadingText}>Connecting to the new frontend...</Text>
            </View>
          )}
          style={styles.webView}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  webViewLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#020617',
  },
  loadingText: {
    marginTop: 14,
    color: '#cbd5e1',
    fontSize: 15,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#020617',
  },
  headerCopy: {
    marginBottom: 14,
  },
  eyebrow: {
    color: '#67e8f9',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 21,
  },
  logoutButton: {
    alignSelf: 'flex-start',
    borderRadius: 14,
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutButtonText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '700',
  },
  infoBanner: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#164e63',
    backgroundColor: '#083344',
  },
  infoBannerText: {
    color: '#bae6fd',
    fontSize: 12,
    lineHeight: 19,
  },
  errorCard: {
    margin: 20,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#7f1d1d',
    backgroundColor: '#450a0a',
  },
  errorTitle: {
    color: '#fecaca',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorBody: {
    color: '#fee2e2',
    fontSize: 14,
    lineHeight: 22,
  },
  primaryButton: {
    marginTop: 18,
    borderRadius: 16,
    backgroundColor: '#67e8f9',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#02131d',
    fontSize: 15,
    fontWeight: '800',
  },
  webView: {
    flex: 1,
    backgroundColor: '#020617',
  },
});
