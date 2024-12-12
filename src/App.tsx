import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

// screens
import TitleScreen from './screens/TitleScreen';
import Departure from './screens/DepartureConfirm';
import Arrival from './screens/ArrivalConfirm';
import TmapView from './screens/TmapView';
import CameraScreen from './screens/CameraScreen';
import DepartureSet from './screens/DepartureSet';
import ArrivalSet from './screens/ArrivalSet';
import LocationSet from './screens/LocationSet';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (__DEV__) {
      console.log('Metro URL:', process.env.METRO_BUNDLER_URL);
    }
  }, []);

  useEffect(() => {
    const checkAndRequestPermissions = async () => {
      if (Platform.OS === 'ios') {
        // iOS는 Info.plist에 설정된 대로 처음 한 번만 요청됨
        Geolocation.requestAuthorization('whenInUse');
      } else {
        try {
          // Android - 이미 권한이 있는지 먼저 확인
          const hasLocationPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          const hasAudioPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
          );

          const permissionsToRequest = [];
          
          if (!hasLocationPermission) {
            permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
          }
          if (!hasAudioPermission) {
            permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
          }

          // 필요한 권한만 요청
          if (permissionsToRequest.length > 0) {
            const results = await PermissionsAndroid.requestMultiple(permissionsToRequest);
            console.log('New permissions granted:', results);
          }
        } catch (err) {
          console.warn('권한 요청 오류:', err);
        }
      }
    };

    checkAndRequestPermissions();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
      <SafeAreaProvider>
        <NavigationContainer>
          {isLoading ? (
              <TitleScreen />
          ) : (
              <Stack.Navigator initialRouteName="LocationSet" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="LocationSet" component={LocationSet} />
                <Stack.Screen name="DepartureConfirm" component={Departure} />
                <Stack.Screen name="ArrivalConfirm" component={Arrival} />
                <Stack.Screen name="TmapView" component={TmapView} />
                <Stack.Screen name="CameraScreen" component={CameraScreen} />
              </Stack.Navigator>
          )}
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
