jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    GestureHandlerRootView: View,
    gestureHandlerRootHOC: jest.fn(),
    PanGestureHandler: View,
    State: {},
  };
}); 