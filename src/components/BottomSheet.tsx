import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import GorhomBottomSheet from '@gorhom/bottom-sheet';
import { SheetStyles } from '../styles/GlobalStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BottomSheetProps {
    children: React.ReactNode;
    onClose?: () => void;
}

const BottomSheet: React.FC<BottomSheetProps> = ({ children, onClose }) => {
    const sheetRef = useRef<GorhomBottomSheet>(null);
    const snapPoints = useMemo(() => ['25%', '50%', '90%'], []);

    return (
        <View style={styles.container}>
            <GorhomBottomSheet
                ref={sheetRef}
                snapPoints={snapPoints}
                enablePanDownToClose
                index={0}
                onClose={onClose}
                style={styles.sheet}
            >
                <View style={styles.contentContainer}>
                    <View style={SheetStyles.resizeIndicator} />
                    {children}
                </View>
            </GorhomBottomSheet>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        width: SCREEN_WIDTH,
        alignItems: 'center',
    },
    sheet: {
        width: '100%',
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
    },
});

export default BottomSheet;