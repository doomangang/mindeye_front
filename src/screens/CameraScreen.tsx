import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { CameraStyles } from '../styles/GlobalStyles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import Tts from 'react-native-tts';

const CameraScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RouteProp<RootStackParamList, 'CameraScreen'>>();
    const { departureLocation, arrivalLocation } = route.params;

    const speak = async (text: string) => {
        try {
            await Tts.speak(text);
        } catch (err) {
            console.warn('TTS speak 오류:', err);
        }
    };

    useEffect(() => {
        // 화면 진입 시 안내 메시지 재생
        const message = '후면 카메라 방향은 길쪽으로, 휴대전화를 약간 기울여주세요';
        speak(message);

        // 5초 후 자동으로 TmapView로 이동
        const timer = setTimeout(() => {
            navigation.navigate('TmapView', {
                departureLocation,
                arrivalLocation
            });
        }, 5000);

        return () => {
            clearTimeout(timer);
            Tts.stop();  // 화면 이동 시 음성 중지
        };
    }, []);

    return (
        <View style={CameraStyles.container}>
            <View style={CameraStyles.mainContent}>
                <View style={CameraStyles.cameraPreview}>
                    <Image 
                        source={require('../../assets/images/TiltPhone.png')}
                        style={CameraStyles.tiltPhoneImage}
                    />
                </View>
                <Text style={CameraStyles.instructionText}>
                    <Text style={CameraStyles.normalText}>
                        후면 카메라 방향은{' '}
                    </Text>
                    <Text style={CameraStyles.highlightText}>
                        길쪽으로 {'\n'} 
                    </Text>
                    <Text style={CameraStyles.normalText}> 휴대전화를{' '} </Text>
                    <Text style={CameraStyles.highlightText}>
                        약간 기울여주세요
                    </Text>
                </Text>
            </View>
        </View>
    );
};

export default CameraScreen;
