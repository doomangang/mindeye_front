import React, { useMemo, useRef, useState } from 'react';
import { Image, StyleSheet, Dimensions, LayoutChangeEvent } from 'react-native';
import GorhomBottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { SheetStyles, Color } from '../styles/GlobalStyles';

interface BottomSheetProps {
    children: React.ReactNode;
    image?: any;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ children, image }) => {
    const [sheetSize, setSheetSize] = useState({ width: 0, height: 0 }); // Bottom Sheet 크기 상태
    const sheetRef = useRef<GorhomBottomSheet>(null);
    const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

    const imageSize = Math.min(sheetSize.width, sheetSize.height) * 0.7;
    const handleLayout = (event: LayoutChangeEvent) => {
        const {width, height} = event.nativeEvent.layout;
        setSheetSize({width, height});
    };

    return (
        <GorhomBottomSheet
            ref={sheetRef}
            snapPoints={snapPoints}
            enablePanDownToClose={false}
            index={2}
            style={styles.sheet}
            backgroundStyle={styles.background}
            handleIndicatorStyle={styles.indicator}
        >
            <BottomSheetView 
                style={SheetStyles.sheetTextContainer}
                onLayout={handleLayout}
            >
                {children}
                {image && (
                    <Image 
                        source={image}
                        style={{
                            width: imageSize, 
                            height: imageSize,
                            alignSelf: 'center',
                            marginTop: 15
                        }}
                        resizeMode='contain'
                    />
                )}
            </BottomSheetView>
        </GorhomBottomSheet>
    );
};

const styles = StyleSheet.create({
    sheet: {
        zIndex: 1000,
        elevation: 10,
    },
    background: {
        backgroundColor: Color.vibrantFillsVibrantTertiaryDark,
    },
    indicator: {
        backgroundColor: '#A0A0A0',
        width: 50,
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 50,
        color: Color.textPrimary,
    },
});

export default BottomSheet;