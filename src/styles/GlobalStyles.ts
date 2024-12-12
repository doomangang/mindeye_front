// GlobalStyles.ts

import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { FlexAlignType } from 'react-native';

/* Fonts */
export const FontFamily = {
    tITLE: "KoddiUD OnGothic",
    sFPro: "SF Pro Display",
};

/* Font Sizes */
export const FontSize = {
    tITLE_size: 34,
    size_9xl: 30, // 예시: 추가
    body: 21, // 예시: 기본 본문 크기
};

/* Colors */
export const Color = {
    backgroundsPrimary: "#1c1c1e",
    textPrimary: "#FFFFFF",
    textSecondary: "#AAAAAA",
    vibrantFillsVibrantTertiaryDark: "#252525",
    vibrantLabelsVibrantSecondaryDark: "#FFFFFF",
    vibrantLabelsVibrantTertiaryDark: "#FFFFFF",
    graysBlack: "#000000",
    labelsPrimary: "#FFFFFF",
    secondary: "rgba(235, 235, 245, 0.6)",
    bLUE: "#0a84ff",
    yELLOW: "#FFD60A",
};

/* Paddings */
export const Padding = {
    p_2xl: 21,
    p_base: 16,
    p_7xs: 8,
    p_m: 12,
};

/* Borders */
export const Border = {
    br_10xs_5: 5,
    br_3xs: 12,
};

/* Common Styles - 공통으로 사용되는 기본 스타일 */
export const CommonStyles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        backgroundColor: Color.backgroundsPrimary,
    },
    safeAreaView: {
        flex: 1,
    },
    map: {
        flex: 1,
        ...StyleSheet.absoluteFillObject,
    },
    sheet: {
        position: "absolute",
        bottom: 0,
        width: '100%',
        height: '50%',
        backgroundColor: Color.vibrantFillsVibrantTertiaryDark,
        borderTopLeftRadius: Border.br_3xs,
        borderTopRightRadius: Border.br_3xs,
        alignItems: "center",
        paddingTop: Padding.p_m,
    },
});

/* Camera Styles */
export const CameraStyles = StyleSheet.create({
    container: {
        ...CommonStyles.container,
        backgroundColor: Color.backgroundsPrimary,
    },
    mainContent: {
        flex: 1,
        alignItems: 'center' as FlexAlignType,
        justifyContent: 'center',
        padding: 20,
    },
    cameraPreview: {
        width: '80%',
        aspectRatio: 1,
        marginBottom: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    instructionText: {
        textAlign: 'center',
        lineHeight: 28,
        marginHorizontal: 20,
    },
    normalText: {
        color: Color.textPrimary,
        fontSize: FontSize.body,
        fontFamily: FontFamily.tITLE,
        fontWeight: '700' as const,
    },
    highlightText: {
        color: Color.yELLOW,
        fontSize: FontSize.body,
        fontFamily: FontFamily.tITLE,
        fontWeight: '700' as const,
    },
    tiltPhoneImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain'
    }
});

/* Title Screen Styles */
export const TitleScreenStyles = StyleSheet.create({
    titleContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center' as FlexAlignType,
    },
    title: {
        fontSize: FontSize.tITLE_size,
        lineHeight: 41,
        fontWeight: '800' as const,
        fontFamily: FontFamily.tITLE,
        textAlign: 'center',
    },
});

/* Location (Departure & Arrival) Confirm Styles */
export const LocationConfirmStyles = StyleSheet.create({
    container: CommonStyles.container,
    mapFrameIcon: {
        width: '100%',
        height: '60%',
        position: "absolute",
        top: 0,
    },
    sheetIphone: CommonStyles.sheet,
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
    closeButton: {
        width: 20,
        height: 20,
        borderRadius: 80,
        backgroundColor: Color.vibrantFillsVibrantTertiaryDark,
        justifyContent: "center",
        alignItems: "center",
    },
});

/* Navigation Styles */
export const NavigationStyles = StyleSheet.create({
    container: CommonStyles.container,
    map: CommonStyles.map,
    infoPanel: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 15,
        borderRadius: Border.br_3xs,
        elevation: 5,
    },
    infoText: {
        fontSize: FontSize.body,
        marginVertical: 5,
    },
    startButton: {
        position: 'absolute',
        bottom: 30,
        backgroundColor: Color.bLUE,
        padding: 15,
        borderRadius: Border.br_3xs,
        alignSelf: 'center',
    },
    buttonText: {
        color: Color.textPrimary,
        fontSize: FontSize.body,
        fontWeight: '600' as const,
    },
});

/* Sheet Styles - 공통으로 사용되는 시트 관련 스타일 */
export const SheetStyles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '50%',
        backgroundColor: Color.vibrantFillsVibrantTertiaryDark,
        borderTopLeftRadius: Border.br_3xs,
        borderTopRightRadius: Border.br_3xs,
        alignItems: 'center' as FlexAlignType,
        paddingTop: Padding.p_m,
    },
    resizeIndicator: {
        width: 36,
        height: 5,
        backgroundColor: Color.vibrantLabelsVibrantTertiaryDark,
        borderRadius: Border.br_10xs_5,
        marginBottom: Padding.p_m,
    },
    titleAndControls: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: '90%',
        marginBottom: Padding.p_m,
    },
    sheetTextContainer: {
        alignItems: "flex-start" as FlexAlignType,
        justifyContent: "space-between",
        width: '100%',
        paddingHorizontal: Padding.p_base,
        marginTop: Padding.p_base,
    },
    sheetText: {
        alignSelf: "flex-start" as FlexAlignType,
        justifyContent: "flex-start",
        width: '80%',
        padding: Padding.p_m,
    },
    titleText: {
        fontSize: FontSize.size_9xl,
        fontFamily: FontFamily.tITLE,
        fontWeight: '700' as const,
    },
    optionalLine: {
        fontSize: FontSize.body,
        fontFamily: FontFamily.tITLE,
        fontWeight: '500' as const,
        textAlign: 'left',
        marginBottom: Padding.p_m,
    },
    mainLine: {
        fontSize: FontSize.tITLE_size,
        fontFamily: FontFamily.tITLE,
        fontWeight: '700' as const,
        textAlign: 'left',
        marginBottom: Padding.p_m,
    },
    comment: {
        fontSize: FontSize.body,
        fontFamily: FontFamily.tITLE,
        fontWeight: '500' as const,
        textAlign: 'left',
    },
    imageContainer: {
        width: '70%',
        aspectRatio: 1,
        alignSelf: 'center',
        resizeMode: 'contain'
    },
});