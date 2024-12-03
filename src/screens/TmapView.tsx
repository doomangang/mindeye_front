import React, { useEffect, useState, useRef } from 'react';
import { View, Alert } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { RootStackParamList, Location } from '../types';
import proj4 from 'proj4';
import { TMAP_API_KEY } from '@env';

type TmapViewRouteProp = RouteProp<RootStackParamList, 'TmapView'>;

// EPSG:3857에서 WGS84로 변환 설정
const EPSG3857 = 'EPSG:3857';
const WGS84 = 'WGS84';

const convertEPSG3857ToWGS84 = (x: number, y: number) => {
    const [longitude, latitude] = proj4(EPSG3857, WGS84, [x, y]);
    return { latitude, longitude };
};

const TmapView = () => {
    const route = useRoute<TmapViewRouteProp>();
    const { departureLocation, arrivalLocation } = route.params;

    const [routeCoords, setRouteCoords] = useState<Array<{ latitude: number; longitude: number }>>([]);
    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        if (departureLocation && arrivalLocation) {
            findRoute(departureLocation, arrivalLocation);
        } else {
            Alert.alert('출발지나 도착지 정보가 없습니다.');
        }
    }, [arrivalLocation, departureLocation]);

    const findRoute = (departure: Location, arrival: Location) => {
        fetch('https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'appKey': TMAP_API_KEY,
            },
            body: JSON.stringify({
                startX: departure.longitude.toString(),
                startY: departure.latitude.toString(),
                endX: arrival.longitude.toString(),
                endY: arrival.latitude.toString(),
                reqCoordType: 'WGS84GEO',
                resCoordType: 'EPSG3857',
                startName: departure.name,
                endName: arrival.name,
            }),
        })
            .then(response => response.json())
            .then(data => {
                console.log("API response", data);
                const features = data.features;
                const coords = [];

                for (let i = 0; i < features.length; i++) {
                    const geometry = features[i].geometry;

                    if (geometry.type === 'LineString') {
                        const lineCoords = geometry.coordinates;
                        for (let j = 0; j < lineCoords.length; j++) {
                            const { latitude, longitude } = convertEPSG3857ToWGS84(
                                lineCoords[j][0],
                                lineCoords[j][1]
                            );

                            coords.push({ latitude, longitude });
                        }
                    }
                }

                setRouteCoords(coords);

                // 지도에 경로가 모두 보이도록 조정
                if (coords.length > 0 && mapRef.current) {
                    mapRef.current.fitToCoordinates(coords, {
                        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                        animated: true,
                    });
                }
            })
            .catch(error => console.error(error));
    };

    return (
        <View style={{ flex: 1 }}>
            <MapView
                ref={mapRef}
                style={{ flex: 1 }}
                initialRegion={{
                    latitude: departureLocation.latitude,
                    longitude: departureLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                showsUserLocation={true}
            >
                <Marker coordinate={departureLocation} title="출발지" />
                <Marker coordinate={arrivalLocation} title="도착지" pinColor="blue" />
                {routeCoords.length > 0 && (
                    <Polyline coordinates={routeCoords} strokeColor="#DD0000" strokeWidth={3} />
                )}
            </MapView>
        </View>
    );
};

export default TmapView;
