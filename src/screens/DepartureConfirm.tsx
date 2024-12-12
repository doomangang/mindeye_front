import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker } from 'react-native-maps';
import { RootStackParamList, Location } from '../types';
import { Color, CommonStyles, SheetStyles } from '../styles/GlobalStyles';
import BottomSheet from '../components/BottomSheet';

type DepartureConfirmRouteProp = RouteProp<RootStackParamList, 'DepartureConfirm'>;

const DepartureConfirm = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<DepartureConfirmRouteProp>();
    const { searchedLocation } = route.params;
    const [selectedLocation, setSelectedLocation] = useState<Location>(searchedLocation);

    // BottomSheet 높이를 고려한 지도 중심 조정을 위한 상수
    const BOTTOM_SHEET_HEIGHT = Dimensions.get('window').height * 0.5;
    const MAP_PADDING = {
        top: 100,
        right: 50,
        bottom: BOTTOM_SHEET_HEIGHT + 100,
        left: 50,
    };

    return (
        <View style={CommonStyles.container}>
            <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            <MapView
                style={CommonStyles.map}
                initialRegion={{
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                }}
                paddingAdjustmentBehavior="automatic"
                mapPadding={MAP_PADDING}
            >
                <Marker
                    coordinate={selectedLocation}
                    draggable
                    onDragEnd={(e) => setSelectedLocation({
                        ...selectedLocation,
                        latitude: e.nativeEvent.coordinate.latitude,
                        longitude: e.nativeEvent.coordinate.longitude,
                    })}
                />
            </MapView>
            <BottomSheet>
                <View style={SheetStyles.sheetTextContainer}>
                    <Text style={SheetStyles.mainLine}>
                        {selectedLocation.name}
                    </Text>
                    <TouchableOpacity 
                        style={styles.confirmButton}
                        onPress={() => navigation.navigate('LocationSet', {
                            type: 'arrival',
                            departureLocation: selectedLocation
                        })}
                    >
                        <Text style={styles.buttonText}>출발지로 설정</Text>
                    </TouchableOpacity>
                </View>
            </BottomSheet>
        </View>
    );
};

const styles = StyleSheet.create({
    confirmButton: {
        backgroundColor: Color.bLUE,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
        marginTop: 20,
    },
    buttonText: {
        color: Color.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        backgroundColor: Color.backgroundsPrimary,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    backButtonText: {
        color: Color.textPrimary,
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default DepartureConfirm;
