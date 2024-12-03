// components/MapPreview.tsx

import React, { useRef, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';
import { Location } from '../types';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {Border, Color, Padding} from "../styles/GlobalStyles";

interface MapPreviewProps {
    location?: Location | null;
    markerTitle?: string;
}

const MapPreview = ({ location, markerTitle }: MapPreviewProps) => {
    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        if (location && mapRef.current) {
            mapRef.current.animateToRegion(
                {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                },
                1000 // 애니메이션 지속 시간 (밀리초)
            );
        }
    }, [location]);

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: location ? location.latitude : 37.564362,
                    longitude: location ? location.longitude : 126.977011,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                {location && (
                    <Marker
                        coordinate={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                        }}
                        title={markerTitle}
                    />
                )}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        width: wp('100%'),
        height: hp('50%'),
        borderTopLeftRadius: Border.br_3xs,
        borderTopRightRadius: Border.br_3xs,
        alignItems: "center",
        paddingTop: Padding.p_m,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});

export default MapPreview;
