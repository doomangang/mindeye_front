import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Location } from '../types';
import { Color, CommonStyles } from '../styles/GlobalStyles';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import { TMAP_API_KEY } from '@env';
import Geolocation from '@react-native-community/geolocation';
import Tts from 'react-native-tts';

type LocationSetRouteProp = RouteProp<RootStackParamList, 'LocationSet'>;

const LocationSet = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<LocationSetRouteProp>();
  const { type = 'departure', departureLocation } = route.params || { type: 'departure' };

  const [locationText, setLocationText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const pressTimeoutRef = useRef<NodeJS.Timeout>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 음성 인식 리스너 설정
    Voice.onSpeechStart = () => {
      console.log('Speech started');
      setIsListening(true);
      
      speechTimeoutRef.current = setTimeout(() => {
        if (isListening) {
          console.log('No speech detected for 10 seconds, stopping...');
          stopListening();
        }
      }, 10000);
    };
    
    Voice.onSpeechEnd = () => {
      console.log('Speech ended');
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
      setIsListening(false);
    };
    
    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      console.log('Speech results:', e.value);
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
      if (e.value && e.value.length > 0) {
        setLocationText(e.value[0]);
      }
    };
    
    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      console.error('Speech error:', e);
      if (e.error?.code === 'recognition_fail') {
        Alert.alert('음성 인식 실패', '음성이 감지되지 않았습니다. 다시 시도해주세요.');
      }
      setIsListening(false);
    };

    // cleanup function
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    };
  }, []); // 의존성 배열을 비워서 한 번만 실행되도록 함

  useEffect(() => {
    const initTTS = async () => {
      try {
        // TTS 이벤트 리스너 추가 (지원되는 이벤트만 사용)
        Tts.addEventListener('tts-progress', (event) => console.log('TTS 진행중:', event));
        Tts.addEventListener('tts-start', () => console.log('TTS 시작'));
        Tts.addEventListener('tts-finish', () => console.log('TTS 완료'));
        Tts.addEventListener('tts-cancel', () => console.log('TTS 취소'));

        // 사용 가능한지 체크
        const available = await Tts.getInitStatus();
        console.log('TTS 초기화 상태:', available);

        // 한국어 설정
        await Tts.setDefaultLanguage('ko-KR');
        console.log('TTS 언어 설정 완료');
        
        // 사용 가능한 음성 확인
        const voices = await Tts.voices();
        console.log('사용 가능한 음성:', voices);
        
        const yunaVoice = voices.find(v => v.id === 'com.apple.voice.compact.ko-KR.Yuna');
        if (yunaVoice) {
          await Tts.setDefaultVoice(yunaVoice.id);
          console.log('Yuna 음성 설정 완료');
        } else {
          console.warn('Yuna 음성을 찾을 수 없습니다');
        }

        // 테스트 음성
        // speak('TTS 테스트');
      } catch (err) {
        console.warn('TTS 초기화 오류:', err);
      }
    };

    initTTS();
    return () => {
      // 이벤트 리스너 제거
      Tts.removeAllListeners('tts-start');
      Tts.removeAllListeners('tts-progress');
      Tts.removeAllListeners('tts-finish');
      Tts.removeAllListeners('tts-cancel');
      Voice.destroy();
    };
  }, []);

  const startListening = async () => {
    try {
      // 기존 리스너 제거 및 재설정
      await Voice.destroy();
      await Voice.start('ko-KR');
      setIsListening(true);
    } catch (e) {
      console.error('Start listening error:', e);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      if (isListening) {
        await Voice.stop();
        setIsListening(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getCurrentLocation = () => {
    return new Promise<Location>((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            name: "현재 위치"
          };
          console.log('Current Location:', location);
          resolve(location);
        },
        error => {
          console.error('Location Error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 10000,
        }
      );
    });
  };

  const speak = async (text: string) => {
    try {
      console.log('TTS 시도:', text);
      const result = Tts.speak(text);
      console.log('TTS 실행 결과:', result);
    } catch (err) {
      console.warn('TTS speak 오류:', err);
    }
  };

  const handleSearch = async () => {
    try {
      if (isListening) {
        await stopListening();
      }
      
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }

      if (locationText === '현재 위치') {
        const currentLocation = await getCurrentLocation();
        if (type === 'departure') {
          navigation.navigate('DepartureConfirm', {
            searchedLocation: currentLocation
          });
        } else {
          navigation.navigate('ArrivalConfirm', {
            departureLocation: departureLocation!,
            searchedLocation: currentLocation
          });
        }
        return;
      }

      const encodedKeyword = encodeURIComponent(locationText);
      
      const options = {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          appKey: TMAP_API_KEY
        }
      };

      const response = await fetch(
        `https://apis.openapi.sk.com/tmap/pois?version=1&searchKeyword=${encodedKeyword}&searchType=all&searchtypCd=A&reqCoordType=WGS84GEO&resCoordType=WGS84GEO&page=1&count=20&multiPoint=N&poiGroupYn=N`,
        options
      );

      const data = await response.json();
      console.log('API Response:', data);

      if (data.searchPoiInfo.pois.poi && data.searchPoiInfo.pois.poi.length > 0) {
        const firstResult = data.searchPoiInfo.pois.poi[0];
        const searchedLocation: Location = {
          latitude: Number(firstResult.noorLat),
          longitude: Number(firstResult.noorLon),
          name: firstResult.name
        };
        
        // 검색 결과를 음성으로 내
        speak(`${searchedLocation.name}을 ${type === 'departure' ? '출발지' : '도착지'}로 설정하시겠습니까?`);

        if (type === 'departure') {
          navigation.navigate('DepartureConfirm', {
            searchedLocation
          });
        } else {
          navigation.navigate('ArrivalConfirm', {
            departureLocation: departureLocation!,
            searchedLocation
          });
        }
      } else {
        speak('검색 결과를 찾을 수 없습니다.');
        Alert.alert('검색 실패', '검색 결과를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('Search Error:', error);
      Alert.alert('오류', '검색 중 오류가 발생했습니다.');
    }
  };

  return (
    <View style={CommonStyles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: Color.textPrimary }]}
          placeholder={`${type === 'departure' ? '출발지' : '도착지'}를 입력하세요`}
          placeholderTextColor={Color.textSecondary}
          value={locationText}
          onChangeText={setLocationText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity 
          style={[
            styles.voiceButton,
            isListening && styles.voiceButtonActive
          ]}
          onPress={() => {
            if (isListening) {
              stopListening();
            } else {
              startListening();
            }
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.voiceButtonText}>
            {isListening ? '말씀해주세요...' : '눌러서 음성 입력'}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={styles.searchButton}
        onPress={handleSearch}
      >
        <Text style={styles.searchButtonText}>검색</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',
    padding: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: Color.backgroundsPrimary,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: Color.backgroundsPrimary,
    color: Color.textPrimary,
  },
  searchButton: {
    backgroundColor: Color.secondary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '90%',
  },
  searchButtonText: {
    color: Color.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  voiceButton: {
    backgroundColor: Color.secondary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '90%',
    marginTop: 10,
  },
  voiceButtonActive: {
    backgroundColor: Color.bLUE,
  },
  voiceButtonText: {
    color: Color.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LocationSet; 