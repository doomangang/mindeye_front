import React, { useEffect, useState, useRef } from 'react';
import { View, Alert, Text, Animated, StyleSheet, Image } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { RootStackParamList, Location } from '../types';
import { TMAP_API_KEY } from '@env';
import { Color, CommonStyles, NavigationStyles, SheetStyles } from '../styles/GlobalStyles';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CameraScreen from './CameraScreen';
import Geolocation from '@react-native-community/geolocation';
import BottomSheet from '../components/BottomSheet';

type TmapViewRouteProp = RouteProp<RootStackParamList, 'TmapView'>;
type TmapViewNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TmapView'>;

interface NavigationPoint {
    description: string;
    turnType: number;
    distance: number;
    time: number;
}

interface DistanceResponse {
    distanceInfo: {
        distance: number;
        // 다른 필요한 필드들...
    };
}

const TmapView = () => {
    const [key, setKey] = useState(0);
    const route = useRoute<TmapViewRouteProp>();
    const { departureLocation, arrivalLocation } = route.params;
    const [routeCoords, setRouteCoords] = useState<Array<{ latitude: number; longitude: number }>>([]);
    const mapRef = useRef<MapView>(null);
    const navigation = useNavigation<TmapViewNavigationProp>();
    const [navigationPoints, setNavigationPoints] = useState<NavigationPoint[]>([]);
    const [currentPointIndex, setCurrentPointIndex] = useState(0);
    const [showSheet, setShowSheet] = useState(false);
    const sheetAnim = useRef(new Animated.Value(1000)).current;

    useEffect(() => {
        if (departureLocation && arrivalLocation) {
            console.log('경로 탐색 시작:', { departureLocation, arrivalLocation });
            findRoute(departureLocation, arrivalLocation);
        }
    }, []);

    useEffect(() => {
        if (routeCoords.length > 0) {
            // 3초 후 바로 BottomSheet 표시
            const timer = setTimeout(() => {
                if (navigationPoints.length > 0) {
                    setShowSheet(true);
                }
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [routeCoords, navigationPoints]);

    useEffect(() => {
        console.log('showSheet changed:', showSheet);
    }, [showSheet]);

    const findRoute = async (departure: Location, arrival: Location) => {
        const options: RequestInit = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                appKey: TMAP_API_KEY
            },
            body: JSON.stringify({
                startX: departure.longitude,
                startY: departure.latitude,
                endX: arrival.longitude,
                endY: arrival.latitude,
                reqCoordType: 'WGS84GEO',
                resCoordType: 'WGS84GEO',  // EPSG3857 대신 WGS84GEO 사용
                startName: encodeURIComponent('출발'),
                endName: encodeURIComponent('도착'),
                searchOption: '0',
                sort: 'index'
            })
        };

        try {
            const response = await fetch(
                'https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1', 
                options
            );
            const data = await response.json();
            
            if (data.features) {
                const coords: Array<{latitude: number; longitude: number}> = [];
                const points: NavigationPoint[] = [];
                
                for (const feature of data.features) {
                    if (feature.geometry.type === 'LineString') {
                        feature.geometry.coordinates.forEach((coord: any[]) => {
                            coords.push({
                                latitude: coord[1],
                                longitude: coord[0]
                            });
                        });
                        
                        if (feature.properties.description) {
                            points.push({
                                description: feature.properties.description,
                                turnType: feature.properties.turnType || 0,
                                distance: feature.properties.distance || 0,
                                time: feature.properties.time || 0
                            });
                        }
                    }
                }

                console.log('경로 좌표 설정:', coords.length);
                setRouteCoords(coords);
                setNavigationPoints(points);
                setKey(prev => prev + 1);

                if (coords.length > 0 && mapRef.current) {
                    mapRef.current.fitToCoordinates(
                        [departure, arrival, ...coords],
                        {
                            edgePadding: { 
                                top: 100, 
                                right: 100, 
                                bottom: 100, 
                                left: 100 
                            },
                            animated: true,
                        }
                    );
                }
            }
        } catch (error) {
            console.error("경로 검색 오류:", error);
            Alert.alert('경로를 찾을 수 없습니다.');
        }
    };

    const calculateDistance = async (start: Location, end: Location) => {
        const options: RequestInit = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                appKey: TMAP_API_KEY
            }
        };

        try {
            const response = await fetch(
                `https://apis.openapi.sk.com/tmap/routes/distance?version=1&startX=${start.longitude}&startY=${start.latitude}&endX=${end.longitude}&endY=${end.latitude}&reqCoordType=WGS84GEO`,
                options
            );
            const data: DistanceResponse = await response.json();
            return data.distanceInfo.distance;
        } catch (error) {
            console.error("거리 계산 오류:", error);
            return null;
        }
    };

    const showNavigationMessage = (message: string) => {
        setShowSheet(true);
    };

    const checkNavigationPoint = async (currentLocation: Location) => {
        if (currentPointIndex < navigationPoints.length) {
            const nextPoint = navigationPoints[currentPointIndex];
            
            // 현재 위치와 다음 안내 포인트까지의 거리 계산
            const distance = await calculateDistance(currentLocation, {
                latitude: routeCoords[currentPointIndex].latitude,
                longitude: routeCoords[currentPointIndex].longitude,
                name: ''
            });

            // 20미터 이내로 접근하면 다음 안내
            if (distance !== null && distance <= 20) {
                showNavigationMessage(nextPoint.description);
                setCurrentPointIndex(prev => prev + 1);
            }
        }
    };

    // 현재 위치가 변경될 때마다 체크
    useEffect(() => {
        const watchId = Geolocation.watchPosition(
            position => {
                const currentLocation: Location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    name: ''
                };
                checkNavigationPoint(currentLocation);
            },
            error => console.error(error),
            { enableHighAccuracy: true, distanceFilter: 10 }
        );

        return () => Geolocation.clearWatch(watchId);
    }, [currentPointIndex, navigationPoints]);

    return (
        <View style={[CommonStyles.container, { position: 'relative' }]}>
            <MapView
                key={key}
                ref={mapRef}
                style={[CommonStyles.map, { zIndex: 1 }]}
                initialRegion={{
                    latitude: (departureLocation.latitude + arrivalLocation.latitude) / 2,
                    longitude: (departureLocation.longitude + arrivalLocation.longitude) / 2,
                    latitudeDelta: Math.abs(departureLocation.latitude - arrivalLocation.latitude) * 1.5,
                    longitudeDelta: Math.abs(departureLocation.longitude - arrivalLocation.longitude) * 1.5,
                }}
                showsUserLocation={true}
                zIndex={1}
            >
                <Marker coordinate={departureLocation} title="출발지" />
                <Marker coordinate={arrivalLocation} title="도착지" pinColor="blue" />
                {routeCoords.length > 0 && (
                    <Polyline 
                        key={`polyline-${key}`}
                        coordinates={routeCoords} 
                        strokeColor="#FF0000"
                        strokeWidth={5}
                        lineDashPattern={[1]}
                    />
                )}
            </MapView>
            {showSheet && (
                <View style={styles.bottomSheetContainer}>
                    <BottomSheet image={require('../../assets/images/WarningSign.png')}>
                        <View style={SheetStyles.sheetTextContainer}>
                            <Text style={[SheetStyles.mainLine, {color: Color.textPrimary}]}>
                                {navigationPoints[currentPointIndex]?.description}
                            </Text>
                        </View>
                    </BottomSheet>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    bottomSheetContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        elevation: 10,
        height: '100%',
    }
});

export default TmapView;
