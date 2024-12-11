import React, { useEffect, useState } from "react";
import { View, Text, TouchableWithoutFeedback, Alert, PermissionsAndroid, Platform} from "react-native";
import { CommonStyles, LocationConfirmStyles, SheetStyles, Color } from '../styles/GlobalStyles';
import { useTheme } from "../ThemeContext";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Location } from '../types';
import {useNavigation} from "@react-navigation/native";
import Geolocation from '@react-native-community/geolocation';
import MapPreview from './MapPreview';

type DepartureConfirmNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'DepartureConfirm'
>;

const DepartureConfirm = () => {
    const theme = useTheme();

    const navigation = useNavigation<DepartureConfirmNavigationProp>();
    const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: '위치 권한 요청',
                        message: '앱에서 위치 정보를 사용합니다.',
                        buttonNeutral: '나중에',
                        buttonNegative: '취소',
                        buttonPositive: '허용',
                    },
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert('위치 권한이 거부되었습니다.');
                }
            } catch (err) {
                console.warn(err);
            }
        }
    };

    useEffect(() => {
        const getCurrentLocation = async () => {
            await requestLocationPermission();
            Geolocation.getCurrentPosition(
                position => {
                    setCurrentLocation({
                        name: '현재 위치',
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                error => {
                    Alert.alert('위치를 가져올 수 없습니다.', error.message);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
            );
        };

        getCurrentLocation();
    }, []);

    // 다음 화면으로 이동하는 함수
    const handlePress = () => {
        if (currentLocation) {
            navigation.navigate('ArrivalConfirm', {
                departureLocation: currentLocation,
            });
        } else {
            Alert.alert('현재 위치를 가져오는 중입니다. 잠시 후 다시 시도해주세요.');
        }
    };


    return (
        <View style={[CommonStyles.container, { backgroundColor: theme.colors.background }]}>
            <MapPreview location={currentLocation} markerTitle="출발지"/>
            <TouchableWithoutFeedback onPress={handlePress}>
                <View style={SheetStyles.container}>
                    <View style={SheetStyles.resizeIndicator} />
                    <View style={SheetStyles.titleAndControls}>
                        <Text style={[SheetStyles.titleText, { color: theme.colors.text }]}>지도</Text>
                    </View>
                    <View style={SheetStyles.sheetTextContainer}>
                        <View style={SheetStyles.sheetText}>
                            <Text style={SheetStyles.optionalLine}>
                                <Text style={{ color: Color.textPrimary }}>출발지</Text>
                                <Text style={{ color: Color.textSecondary }}>를</Text>
                            </Text>
                            <Text style={[SheetStyles.mainLine, { color: theme.colors.text }]}>
                                상도역 5번 출구
                            </Text>
                            <Text style={[SheetStyles.comment, { color: theme.colors.textSecondary }]}>
                                로 설정합니다
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </View>
    );
};

export default DepartureConfirm;
