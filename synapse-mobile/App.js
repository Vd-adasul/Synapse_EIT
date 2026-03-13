import 'react-native-url-polyfill/auto'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'

// Screens
import ScannerScreen from './src/screens/ScannerScreen'
import RelativeDashboard from './src/screens/RelativeDashboard'
import DoctorLoginScreen from './src/screens/DoctorLoginScreen'
import MobileChronosScreen from './src/screens/MobileChronosScreen'

const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator 
        initialRouteName="Scanner"
        screenOptions={{
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#111' }
        }}
      >
        <Stack.Screen 
          name="Scanner" 
          component={ScannerScreen} 
          options={{ title: 'Synapse Family Access' }}
        />
        <Stack.Screen 
          name="RelativeDashboard" 
          component={RelativeDashboard} 
          options={{ title: 'Patient Status', headerBackVisible: false }}
        />
        <Stack.Screen 
          name="DoctorLogin" 
          component={DoctorLoginScreen} 
          options={{ title: 'Synapse Sentinel Log-In' }}
        />
        <Stack.Screen 
          name="MobileChronos" 
          component={MobileChronosScreen} 
          options={{ title: 'Active Ward - Chronos', headerBackVisible: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
