// screens/TitleScreen.tsx

import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { TitleScreenStyles, CommonStyles } from '../styles/GlobalStyles';
import { useTheme } from '../ThemeContext';

const TitleScreen = () => {
    const theme = useTheme();

    return (
        <View style={[CommonStyles.container, { backgroundColor: theme.colors.background }]}>
            <SafeAreaView style={CommonStyles.safeAreaView}>
                <View style={TitleScreenStyles.titleContainer}>
                    <Text style={[TitleScreenStyles.title, { color: theme.colors.text }]}>MIND EYE</Text>
                </View>
            </SafeAreaView>
        </View>
    );
};

export default TitleScreen;
