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
    showMarker?: boolean;
}

const MapPreview = ({ location, markerTitle, showMarker = true }: MapPreviewProps) => {
    if (!location) return null;

    return (
        <MapView
            style={styles.map}
            initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            }}
        >
            {showMarker && location && (
                <Marker
                    coordinate={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                    }}
                    title={markerTitle}
                />
            )}
        </MapView>
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
