import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Location } from '../types';
import { Color, CommonStyles } from '../styles/GlobalStyles';
import Voice, { SpeechResultsEvent } from 'react-native-voice';
import { TMAP_API_KEY } from '@env';

type ArrivalSetRouteProp = RouteProp<RootStackParamList, 'ArrivalSet'>;

const ArrivalSet = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ArrivalSetRouteProp>();
  const { departureLocation } = route.params;
  const [arrivalText, setArrivalText] = useState('');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechResults = (e: SpeechResultsEvent) => {
    if (e.value) {
      setArrivalText(e.value[0]);
      setIsListening(false);
    }
  };

  const startListening = async () => {
    try {
      await Voice.start('ko-KR');
      setIsListening(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async () => {
    try {
        const encodedKeyword = encodeURIComponent(arrivalText);
        
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
            
            navigation.navigate('ArrivalConfirm', {
                departureLocation,
                searchedLocation
            });
        } else {
            Alert.alert('검색 실패', '검색 결과를 찾을 수 없습니다.');
        }
    } catch (error) {
        console.error('API Error:', error);
        Alert.alert('오류', '위치 검색 중 오류가 발생했습니다.');
    }
  };

  return (
    <View style={CommonStyles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="도착지를 입력하세요"
          value={arrivalText}
          onChangeText={setArrivalText}
        />
        <TouchableOpacity 
          style={styles.voiceButton}
          onPress={isListening ? stopListening : startListening}
        >
          <Text style={styles.voiceButtonText}>
            {isListening ? '음성 입력 중지' : '음성 입력'}
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
    marginBottom: 10,
    backgroundColor: Color.backgroundsPrimary,
  },
  voiceButton: {
    backgroundColor: Color.backgroundsPrimary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  voiceButtonText: {
    color: Color.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
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
});

export default ArrivalSet; 