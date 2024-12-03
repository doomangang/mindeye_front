import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// screens
import TitleScreen from './screens/TitleScreen';
import Departure from './screens/DepartureConfirm';
import Arrival from './screens/ArrivalConfirm';
import TmapView from './screens/TmapView';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
      <SafeAreaProvider>
        <NavigationContainer>
          {isLoading ? (
              <TitleScreen />
          ) : (
              <Stack.Navigator initialRouteName="DepartureConfirm" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="DepartureConfirm" component={Departure} />
                <Stack.Screen name="ArrivalConfirm" component={Arrival} />
                <Stack.Screen name="TmapView" component={TmapView} />
              </Stack.Navigator>
          )}
        </NavigationContainer>
      </SafeAreaProvider>
  );
}

export default App;
