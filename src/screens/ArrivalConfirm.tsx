import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MapView, { Marker } from 'react-native-maps';
import { RootStackParamList, Location } from '../types';
import { Color, CommonStyles, SheetStyles } from '../styles/GlobalStyles';
import BottomSheet from '../components/BottomSheet';

type ArrivalConfirmRouteProp = RouteProp<RootStackParamList, 'ArrivalConfirm'>;

const ArrivalConfirm = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<ArrivalConfirmRouteProp>();
    const { departureLocation, searchedLocation } = route.params;
    const [selectedLocation, setSelectedLocation] = useState<Location>(searchedLocation);

    const handleConfirm = () => {
        navigation.navigate('CameraScreen', {
            departureLocation: departureLocation,
            arrivalLocation: selectedLocation
        });
    };

    return (
        <View style={CommonStyles.container}>
            <MapView
                style={CommonStyles.map}
                initialRegion={{
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                }}
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
                        onPress={handleConfirm}
                    >
                        <Text style={styles.buttonText}>도착지로 설정</Text>
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
});

export default ArrivalConfirm;
