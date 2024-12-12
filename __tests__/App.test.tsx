/**
 * @format
 */

import 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import App from '../src/App';
import DepartureSet from '../src/screens/DepartureSet';
import DepartureConfirm from '../src/screens/DepartureConfirm';
import ArrivalSet from '../src/screens/ArrivalSet';
import ArrivalConfirm from '../src/screens/ArrivalConfirm';

// Mock the external dependencies
jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn((success) => success({
    coords: {
      latitude: 37.5665,
      longitude: 126.9780,
    },
  })),
}));

jest.mock('react-native-voice', () => ({
  onSpeechResults: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  destroy: jest.fn(),
  removeAllListeners: jest.fn(),
}));

jest.mock('@gorhom/bottom-sheet', () => 'BottomSheet');

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      searchPoiInfo: {
        pois: {
          poi: [{
            name: "테스트 위치",
            noorLat: "37.5665",
            noorLon: "126.9780"
          }]
        }
      }
    })
  })
);

describe('Navigation Flow Tests', () => {
  it('should navigate from DepartureSet to DepartureConfirm with location data', async () => {
    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <DepartureSet />
      </NavigationContainer>
    );

    const input = getByPlaceholderText('출발지를 입력하세요');
    fireEvent.changeText(input, '서울역');

    const searchButton = getByText('검색');
    fireEvent.press(searchButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  it('should handle current location request', async () => {
    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <DepartureSet />
      </NavigationContainer>
    );

    const input = getByPlaceholderText('출발지를 입력하세요');
    fireEvent.changeText(input, '현재 위치');

    const searchButton = getByText('검색');
    fireEvent.press(searchButton);

    await waitFor(() => {
      expect(require('@react-native-community/geolocation').getCurrentPosition).toHaveBeenCalled();
    });
  });

  it('should handle voice input correctly', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <DepartureSet />
      </NavigationContainer>
    );

    const voiceButton = getByText('음성 입력');
    fireEvent.press(voiceButton);

    await waitFor(() => {
      expect(require('react-native-voice').start).toHaveBeenCalled();
    });
  });

  it('should confirm location in DepartureConfirm', () => {
    const mockRoute = {
      params: {
        searchedLocation: {
          latitude: 37.5665,
          longitude: 126.9780,
          name: "테스트 위치"
        }
      }
    };

    const { getByText } = render(
      <NavigationContainer>
        <DepartureConfirm route={mockRoute} />
      </NavigationContainer>
    );

    const confirmButton = getByText('출발지로 설정');
    fireEvent.press(confirmButton);
  });

  it('should handle the complete navigation flow', async () => {
    const { getByText, getByPlaceholderText } = render(
      <NavigationContainer>
        <App />
      </NavigationContainer>
    );

    // Test loading screen
    await waitFor(() => {
      expect(getByText('출발지를 입력하세요')).toBeTruthy();
    }, { timeout: 3000 });
  });
});

describe('Error Handling Tests', () => {
  it('should handle API errors gracefully', async () => {
    global.fetch = jest.fn(() => Promise.reject('API Error'));
    const mockAlert = jest.spyOn(Alert, 'alert');

    const { getByText, getByPlaceholderText } = render(
      <NavigationContainer>
        <DepartureSet />
      </NavigationContainer>
    );

    const input = getByPlaceholderText('출발지를 입력하세요');
    fireEvent.changeText(input, '서울역');

    const searchButton = getByText('검색');
    fireEvent.press(searchButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalled();
    });
  });
});
