import React from "react";
import { View, Text, TouchableWithoutFeedback } from "react-native";
import { CommonStyles, LocationConfirmStyles, SheetStyles, Color } from '../styles/GlobalStyles';
import { useTheme } from "../ThemeContext";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import {NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Location } from '../types';
import {useNavigation, useRoute, RouteProp} from "@react-navigation/native";
import MapPreview from './MapPreview.tsx';


type ArrivalConfirmNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'ArrivalConfirm'
>;

type ArrivalConfirmRouteProp = RouteProp<RootStackParamList, 'ArrivalConfirm'>;

const ArrivalConfirm = () => {
    const theme = useTheme();

    const navigation = useNavigation<ArrivalConfirmNavigationProp>();
    const route = useRoute<ArrivalConfirmRouteProp>();

    const { departureLocation } = route.params;

    const arrivalLocation: Location = {
        name: '임의 장소',
        latitude: 37.564991,
        longitude: 126.983937,
    };

    const handlePress = () => {
        navigation.navigate('TmapView', {
            departureLocation: departureLocation,
            arrivalLocation: arrivalLocation,
        });
    };

    return (
        <View style={[CommonStyles.container, { backgroundColor: theme.colors.background }]}>
            <MapPreview location={arrivalLocation} markerTitle="도착지" />
            <TouchableWithoutFeedback onPress={handlePress}>
                <View style={SheetStyles.container}>
                    <View style={SheetStyles.resizeIndicator} />
                    <View style={SheetStyles.titleAndControls}>
                        <Text style={[SheetStyles.titleText, { color: theme.colors.text }]}>지도</Text>
                    </View>
                    <View style={SheetStyles.sheetTextContainer}>
                        <View style={SheetStyles.sheetText}>
                            <Text style={SheetStyles.optionalLine}>
                                <Text style={{ color: Color.textPrimary }}>도착지</Text>
                                <Text style={{ color: Color.textSecondary }}>를</Text>
                            </Text>
                            <Text style={[SheetStyles.mainLine, { color: theme.colors.text }]}>
                                중앙대학교 310관
                            </Text>
                            <Text style={[SheetStyles.comment, { color: theme.colors.textSecondary }]}>
                                으로 설정합니다
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </View>
    );
};

export default ArrivalConfirm;
