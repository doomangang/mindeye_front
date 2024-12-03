// screens/TitleScreen.tsx

import React from 'react';
import { View, StyleSheet, Text, SafeAreaView } from 'react-native';
import { FontFamily, FontSize } from '../styles/GlobalStyles';
import { useTheme } from '../ThemeContext';

const TitleScreen = () => {
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <SafeAreaView style={styles.safeAreaView}>
                <View style={styles.titleContainer}>
                    <Text style={[styles.title, { color: theme.colors.text }]}>MIND EYE</Text>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeAreaView: {
        flex: 1,
    },
    titleContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: FontSize.tITLE_size,
        lineHeight: 41,
        fontWeight: '800',
        fontFamily: FontFamily.tITLE,
        textAlign: 'center',
    },
});

export default TitleScreen;
