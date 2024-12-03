import React from "react";
import { StyleSheet, View, Text, TouchableWithoutFeedback} from "react-native";
import { FontFamily, Border, Color, Padding, FontSize } from "../styles/GlobalStyles";
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
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <MapPreview location={arrivalLocation} markerTitle="도착지" />
            <TouchableWithoutFeedback onPress={handlePress}>
                <View style={styles.sheetIphone}>
                    <View style={styles.resizeIndicator}>
                        <View style={styles.resizeIndicatorInner} />
                    </View>
                    <View style={styles.titleAndControls}>
                        <Text style={[styles.titleText, { color: theme.colors.text }]}>지도</Text>
                        {/*<View style={[styles.closeButton, styles.xFlexBox]}>*/}
                        {/*    <Text style={[styles.x, styles.xTypo]}>X</Text>*/}
                        {/*</View>*/}
                    </View>
                    <View style={styles.sheetTextContainer}>
                        <View style={styles.sheetText}>
                            <Text style={styles.optionalLine}>
                                <Text style={{ color: Color.textPrimary }}>도착지</Text>
                                <Text style={{ color: Color.textSecondary }}>를</Text>
                            </Text>
                            <Text style={[styles.mainLine, { color: theme.colors.text }]}>
                                중앙대학교 310관
                            </Text>
                            <Text style={[styles.comment, { color: theme.colors.textSecondary }]}>
                                으로 설정합니다
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },
    mapFrameIcon: {
        width: wp('100%'),
        height: hp('60%'),
        position: "absolute",
        top: 0,
    },
    sheetIphone: {
        position: "absolute",
        bottom: 0,
        width: wp('100%'),
        height: hp('50%'),
        backgroundColor: Color.vibrantFillsVibrantTertiaryDark,
        borderTopLeftRadius: Border.br_3xs,
        borderTopRightRadius: Border.br_3xs,
        alignItems: "center",
        paddingTop: Padding.p_m,
    },
    resizeIndicator: {
        width: 36,
        height: 5,
        backgroundColor: Color.vibrantLabelsVibrantTertiaryDark,
        borderRadius: Border.br_10xs_5,
        marginBottom: Padding.p_m,
    },
    resizeIndicatorInner: {
        flex: 1,
    },
    titleAndControls: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: wp(90), // 90% 화면 너비
        marginBottom: Padding.p_m,
    },
    titleText: {
        fontSize: FontSize.size_9xl,
        fontFamily: FontFamily.tITLE,
        fontWeight: "700",
    },
    xFlexBox: {
        justifyContent: "center",
        alignItems: "center",
    },
    xTypo: {
        textAlign: "center",
        fontFamily: FontFamily.sFPro,
        fontWeight: "600",
    },
    x: {
        fontSize: FontSize.size_9xl,
        color: Color.vibrantLabelsVibrantSecondaryDark,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        flex: 1,
    },
    closeButton: {
        width: 20,
        height: 20,
        borderRadius: 80,
        backgroundColor: Color.vibrantFillsVibrantTertiaryDark,
        justifyContent: "center",
        alignItems: "center",
    },
    closeButtonText: {
        fontSize: FontSize.body,
        color: Color.vibrantLabelsVibrantSecondaryDark,
    },
    sheetTextContainer: {
        alignItems: "center",
        justifyContent: "space-between",
        width: wp(100),
        paddingHorizontal: Padding.p_base,
        marginTop: Padding.p_base,
    },
    sheetText: {
        alignItems: "flex-start",
        justifyContent: "flex-start",
        width: wp(80),
        padding: Padding.p_m,
    },
    mainLine: {
        fontSize: FontSize.tITLE_size,
        fontFamily: FontFamily.tITLE,
        fontWeight: "700",
        textAlign: 'left',
        marginBottom: Padding.p_m,
    },
    optionalLine: {
        fontSize: FontSize.body,
        fontFamily: FontFamily.tITLE,
        fontWeight: "500",
        textAlign: 'left',
        marginBottom: Padding.p_m,
    },
    comment: {
        fontSize: FontSize.body,
        fontFamily: FontFamily.tITLE,
        fontWeight: "500",
        textAlign: 'left',
    },
});

export default ArrivalConfirm;
