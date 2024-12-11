import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// screens
import TitleScreen from './screens/TitleScreen';
import Departure from './screens/DepartureConfirm';
import Arrival from './screens/ArrivalConfirm';
import TmapView from './screens/TmapView';
import CameraScreen from './screens/CameraScreen';

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

  return (
    <GestureHandlerRootView style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
      <SafeAreaProvider>
        <NavigationContainer>
          {isLoading ? (
              <TitleScreen />
          ) : (
              <Stack.Navigator initialRouteName="DepartureConfirm" screenOptions={{ headerShown: false }}>
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
