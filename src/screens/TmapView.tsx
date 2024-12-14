import React, { useEffect, useState, useRef } from 'react';
import { View, Alert, Text, Animated, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { View, Alert, Text, Animated, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { RootStackParamList, Location } from '../types';
import { TMAP_API_KEY } from '@env';
import { Color, CommonStyles, NavigationStyles, SheetStyles } from '../styles/GlobalStyles';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Geolocation from '@react-native-community/geolocation';
import BottomSheet from '../components/BottomSheet';

type TmapViewRouteProp = RouteProp<RootStackParamList, 'TmapView'>;

interface NavigationPoint {
    description: string;
    turnType: number;
    distance: number;
    time: number;
    latitude?: number;
    longitude?: number;
    index: number;
    pointIndex: number;
    name: string;
    direction: string;
    intersectionName: string;
    nearPoiX: string;
    nearPoiY: string;
    nearPoiName: string;
    pointType: string;
    facilityType: string;
    facilityName: string;
    totalDistance?: number;
    totalTime?: number;
    lineIndex?: number;
    roadType?: number;
    categoryRoadType?: number;
}

interface DistanceResponse {
    distanceInfo: {
        distance: number;
    };
}

// TurnType enum 추가
enum TurnType {
    // 기본
    STRAIGHT = 11,
    LEFT = 12,
    RIGHT = 13,
    U_TURN = 14,
    LEFT_8 = 16,
    LEFT_10 = 17,
    RIGHT_2 = 18,
    RIGHT_4 = 19,

    // 경유지
    WAYPOINT = 184,
    WAYPOINT_1 = 185,
    WAYPOINT_2 = 186,
    WAYPOINT_3 = 187,
    WAYPOINT_4 = 188,
    WAYPOINT_5 = 189,

    // 특수 구조물
    OVERPASS = 125,
    UNDERGROUND = 126,
    STAIRS = 127,
    SLOPE = 128,
    STAIRS_SLOPE = 129,

    // 시작/종료
    START = 200,
    DESTINATION = 201,

    // 횡단보도
    CROSSWALK = 211,
    CROSSWALK_LEFT = 212,
    CROSSWALK_RIGHT = 213,
    CROSSWALK_8 = 214,
    CROSSWALK_10 = 215,
    CROSSWALK_2 = 216,
    CROSSWALK_4 = 217,

    // 기타
    ELEVATOR = 218,
    STRAIGHT_TEMP = 233,
}

// DirectionIcons 업데이트
const DirectionIcons = {
    left: require('../../assets/images/CornerUpLeft.png'),
    right: require('../../assets/images/CornerUpRight.png'),
    straight: require('../../assets/images/Straight.png'),
    uturn: require('../../assets/images/UTurn.png'),
    crosswalk: require('../../assets/images/Crosswalk.png'),
    stairs: require('../../assets/images/Stairs.png'),
    elevator: require('../../assets/images/Elevator.png'),
};

// getDirectionIcon 함수 업데이트
const getDirectionIcon = (turnType: number) => {
    switch (turnType) {
        case TurnType.LEFT:
        case TurnType.LEFT_8:
        case TurnType.LEFT_10:
            return DirectionIcons.left;
            
        case TurnType.RIGHT:
        case TurnType.RIGHT_2:
        case TurnType.RIGHT_4:
            return DirectionIcons.right;
            
        case TurnType.U_TURN:
            return DirectionIcons.uturn;
            
        case TurnType.CROSSWALK:
        case TurnType.CROSSWALK_LEFT:
        case TurnType.CROSSWALK_RIGHT:
        case TurnType.CROSSWALK_8:
        case TurnType.CROSSWALK_10:
        case TurnType.CROSSWALK_2:
        case TurnType.CROSSWALK_4:
            return DirectionIcons.crosswalk;
            
        case TurnType.STAIRS:
        case TurnType.SLOPE:
        case TurnType.STAIRS_SLOPE:
            return DirectionIcons.stairs;
            
        case TurnType.ELEVATOR:
            return DirectionIcons.elevator;
            
        case TurnType.STRAIGHT:
        case TurnType.STRAIGHT_TEMP:
        default:
            return DirectionIcons.straight;
    }
};

// 회전 타입 설명을 위한 새로운 함수
const getTurnTypeDescription = (turnType: number): string => {
    switch (turnType) {
        case TurnType.STRAIGHT: return '직진';
        case TurnType.LEFT: return '좌회전';
        case TurnType.RIGHT: return '우회전';
        case TurnType.U_TURN: return 'U턴';
        case TurnType.LEFT_8: return '8시 방향 좌회전';
        case TurnType.LEFT_10: return '10시 방향 좌회전';
        case TurnType.RIGHT_2: return '2시 방향 우회전';
        case TurnType.RIGHT_4: return '4시 방향 우회전';
        case TurnType.CROSSWALK: return '횡단보도';
        case TurnType.STAIRS: return '계단';
        case TurnType.ELEVATOR: return '엘리베이터';
        case TurnType.START: return '출발지';
        case TurnType.DESTINATION: return '목적지';
        default: return '안내 없음';
    }
};

interface RoutePoint {
    type: 'Point' | 'LineString';
    description: string;
    turnType: number;
    distance: number;
    time: number;
    index: number;
    pointIndex: number;
    name: string;
    direction: string;
    intersectionName: string;
    nearPoiX: string;
    nearPoiY: string;
    nearPoiName: string;
    pointType: string;
    facilityType: string;
    facilityName: string;
    totalDistance?: number;
    totalTime?: number;
    lineIndex?: number;
    roadType?: number;
    categoryRoadType?: number;
    coordIndex: number;  // coords 배열의 인덱스 참조
    timestamp?: number;  // 프레임 단위의 타임스탬프
    geometry: {
        type: 'Point' | 'LineString';
        coordinates: number[] | number[][];
    };
}

// 프레임을 초로 변환하는 상수 추가
const FRAME_TO_MS = 0.0417 * 1000; // 0.0417초를 밀리초로 변환

const TmapView = () => {
    const [key, setKey] = useState(0);
    const route = useRoute<TmapViewRouteProp>();
    const { departureLocation, arrivalLocation } = route.params;
    const [routeCoords, setRouteCoords] = useState<Array<{ latitude: number; longitude: number }>>([]);
    const mapRef = useRef<MapView>(null);
    const [navigationPoints, setNavigationPoints] = useState<RoutePoint[]>([]);
    const [currentPointIndex, setCurrentPointIndex] = useState(0);
    const [showSheet, setShowSheet] = useState(false);
    const [isFollowingUser, setIsFollowingUser] = useState(false);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [lastAnnouncedIndex, setLastAnnouncedIndex] = useState(-1);
    const [currentSegment, setCurrentSegment] = useState<RoutePoint | null>(null);
    const [coords, setCoords] = useState<Array<{latitude: number; longitude: number}>>([]);


    // BottomSheet 높이와 지도 중심 조정을 위한 상수 정
    const SCREEN_HEIGHT = Dimensions.get('window').height;
    const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.5;
    const VISIBLE_MAP_HEIGHT = SCREEN_HEIGHT - BOTTOM_SHEET_HEIGHT;
    // const CENTER_OFFSET = VISIBLE_MAP_HEIGHT / 4;

    const MAP_PADDING = {
        top: 0,
        right: 50,
        bottom: BOTTOM_SHEET_HEIGHT,
        left: 50,
    const MAP_PADDING = {
        top: 0,
        right: 50,
        bottom: BOTTOM_SHEET_HEIGHT,
        left: 50,
    };

    useEffect(() => {
        if (departureLocation && arrivalLocation) {
            console.log('경로 탐색 시작:', { departureLocation, arrivalLocation });
            findRoute(departureLocation, arrivalLocation);
        }
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
            
            // // 전체 응답 데이터를 자세히 로깅
            // console.log('=== 원본 API 응답 데이터 ===');
            // console.log(JSON.stringify(data, null, 2));

            if (data.features) {
                const newCoords: Array<{latitude: number; longitude: number}> = [];
                const points: RoutePoint[] = [];
                
                data.features.forEach((feature: any) => {
                    let coordIndex = newCoords.length;  // 현재 좌표의 시작 인덱스

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
            
            // // 전체 응답 데이터를 자세히 로깅
            // console.log('=== 원본 API 응답 데이터 ===');
            // console.log(JSON.stringify(data, null, 2));

            if (data.features) {
                const newCoords: Array<{latitude: number; longitude: number}> = [];
                const points: RoutePoint[] = [];
                
                data.features.forEach((feature: any) => {
                    let coordIndex = newCoords.length;  // 현재 좌표의 시작 인덱스

                    if (feature.geometry.type === 'LineString') {
                        // LineString의 경우 모든 좌표를 경로 좌표로 추가
                        // LineString의 경우 모든 좌표를 경로 좌표로 추가
                        feature.geometry.coordinates.forEach((coord: number[]) => {
                            newCoords.push({
                            newCoords.push({
                                latitude: coord[1],
                                longitude: coord[0]
                            });
                        });
                    } else if (feature.geometry.type === 'Point') {
                        // Point의 경우 단일 좌표 추가
                        newCoords.push({
                            latitude: feature.geometry.coordinates[1],
                            longitude: feature.geometry.coordinates[0]
                        });
                    }

                    points.push({
                        type: feature.geometry.type,
                        description: feature.properties.description || '',
                        turnType: feature.properties.turnType || 0,
                        distance: feature.properties.distance || 0,
                        time: feature.properties.time || 0,
                        index: feature.properties.index || 0,
                        pointIndex: feature.properties.pointIndex || 0,
                        name: feature.properties.name || '',
                        direction: feature.properties.direction || '',
                        intersectionName: feature.properties.intersectionName || '',
                        nearPoiX: feature.properties.nearPoiX || '',
                        nearPoiY: feature.properties.nearPoiY || '',
                        nearPoiName: feature.properties.nearPoiName || '',
                        pointType: feature.properties.pointType || '',
                        facilityType: feature.properties.facilityType || '',
                        facilityName: feature.properties.facilityName || '',
                        totalDistance: feature.properties.totalDistance,
                        totalTime: feature.properties.totalTime,
                        lineIndex: feature.properties.lineIndex,
                        roadType: feature.properties.roadType,
                        categoryRoadType: feature.properties.categoryRoadType,
                        coordIndex: coordIndex,  // 해당 포인트의 좌표 인덱스 저장
                        timestamp: feature.properties.timestamp,
                        geometry: {
                            type: feature.geometry.type,
                            coordinates: feature.geometry.coordinates,
                        },
                    });
                });
                
                console.log('경로 좌표 수:', newCoords.length);
                console.log('내비게이션 포인트 수:', points.length);
                
                setCoords(newCoords);
                setRouteCoords(newCoords);
                setNavigationPoints(points);
                if (points.length > 0) {
                    setCurrentSegment(points[0]);
                }
            } else {
                console.error('경로 데이터가 없습니다:', data);
                Alert.alert('오류', '경로를 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('경로 탐색 오류:', error);
            Alert.alert('오류', '경로 탐색 중 오류가 발생했습니다.');
        }
    };

    const calculateDistance = async (start: Location, end: Location) => {
        console.log('=== 거리 계산 시작 ===');
        console.log('시작 지점:', start);
        console.log('끝 지점:', end);

        const options: RequestInit = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                appKey: TMAP_API_KEY
            }
        };

        try {
            const url = `https://apis.openapi.sk.com/tmap/routes/distance?version=1&startX=${start.longitude}&startY=${start.latitude}&endX=${end.longitude}&endY=${end.latitude}&reqCoordType=WGS84GEO`;
            console.log('요청 URL:', url);

            const response = await fetch(url, options);
            const data = await response.json();
            console.log('거리 계산 응답:', data);

            if (data.distanceInfo) {
                return data.distanceInfo.distance;
            } else {
                console.error('거리 정보가 없습니다:', data);
                return null;
            }
        } catch (error) {
            console.error('거리 계산 중 오류 발생:', error);
            return null;
            console.error('거리 계산 중 오류 발생:', error);
            return null;
        }
    };

    const showNavigationMessage = (message: string) => {
        setShowSheet(true);
    };

    const checkNavigationPoint = async (currentLocation: Location) => {
        console.log('=== 내비게이션 포인트 체크 ===');
        console.log('현재 위치:', currentLocation);
        console.log('현재 포인트 인덱스:', currentPointIndex);

        if (currentPointIndex >= navigationPoints.length) {
            console.log('모든 포인트 통과');
            return;
        }

        // 다음 Point 진입 전환점 찾기
        const nextPointIndex = navigationPoints.findIndex((point, index) => 
            index > currentPointIndex && point.type === 'Point'
        );

        console.log('다음 Point 타입 인덱스:', nextPointIndex);

        if (nextPointIndex === -1) {
            console.log('더 이상의 전환점이 없습니다');
            return;
        }

        const nextPoint = navigationPoints[nextPointIndex];
        console.log('다음 전환점 상세:', nextPoint);

        // coords 배열에서 해당 좌표 가져오기
        const nextPointCoord = coords[nextPoint.coordIndex];
        console.log('다음 전환점 좌표:', nextPointCoord);

        // 현재 위치에서 다음 전환점까지의 거리 계산
        const distance = await calculateDistance(currentLocation, {
            latitude: nextPointCoord.latitude,
            longitude: nextPointCoord.longitude,
            name: ''
        });

        if (distance === null) return;

        console.log('다음 전환점까지 거리:', distance, 'm');

        // 거리에 따른 안내
        if (distance <= 5) {  // 5m 이내: 전환점 도착
            if (lastAnnouncedIndex !== nextPointIndex) {
                showNavigationMessage(nextPoint.description);
                setLastAnnouncedIndex(nextPointIndex);
                setCurrentPointIndex(nextPointIndex + 1);  // 다음 세그먼트로 이동
                setCurrentSegment(navigationPoints[nextPointIndex + 1]);
            }
        } else if (distance <= 20) {  // 20m 이내: 전환점 접근
            if (lastAnnouncedIndex !== nextPointIndex) {
                const message = getTurnTypePreMessage(nextPoint.turnType);
                showNavigationMessage(message);
                setLastAnnouncedIndex(nextPointIndex);
            }
        } else if (distance <= 50 && nextPoint.turnType !== TurnType.STRAIGHT) {  // 50m 이내: 사전 안내
            if (lastAnnouncedIndex !== nextPointIndex) {
                const message = `${Math.round(distance)}m 앞에서 ${getTurnTypeDescription(nextPoint.turnType)}입니다`;
                showNavigationMessage(message);
                setLastAnnouncedIndex(nextPointIndex);
            }
        }

        // 현재 진행 중인 LineString 구간 표시
        const currentLineString = navigationPoints[currentPointIndex];
        if (currentLineString?.type === 'LineString' && 
            (!currentSegment || currentSegment.description !== currentLineString.description)) {
            setCurrentSegment(currentLineString);
            if (lastAnnouncedIndex !== currentPointIndex) {
                showNavigationMessage(currentLineString.description);
                setLastAnnouncedIndex(currentPointIndex);
            }
        }
    };

    // 회전 안내 사전 메시지
    const getTurnTypePreMessage = (turnType: number): string => {
        switch (turnType) {
            case TurnType.LEFT:
            case TurnType.LEFT_8:
            case TurnType.LEFT_10:
                return "잠시 후 좌회전입니다";
            case TurnType.RIGHT:
            case TurnType.RIGHT_2:
            case TurnType.RIGHT_4:
                return "잠시 후 우회전입니다";
            case TurnType.U_TURN:
                return "잠시 후 유턴입니다";
            case TurnType.CROSSWALK:
                return "잠시 후 횡단보도입니다";
            case TurnType.STAIRS:
                return "잠시 후 계단입니다";
            case TurnType.ELEVATOR:
                return "잠시 후 엘리베이터입니다";
            default:
                return "";
        }
    };

    const showNavigationMessage = (message: string) => {
        setShowSheet(true);
    };

    const checkNavigationPoint = async (currentLocation: Location) => {
        console.log('=== 내비게이션 포인트 체크 ===');
        console.log('현재 위치:', currentLocation);
        console.log('현재 포인트 인덱스:', currentPointIndex);

        if (currentPointIndex >= navigationPoints.length) {
            console.log('모든 포인트 통과');
            return;
        }

        // 다음 Point 진입 전환점 찾기
        const nextPointIndex = navigationPoints.findIndex((point, index) => 
            index > currentPointIndex && point.type === 'Point'
        );

        console.log('다음 Point 타입 인덱스:', nextPointIndex);

        if (nextPointIndex === -1) {
            console.log('더 이상의 전환점이 없습니다');
            return;
        }

        const nextPoint = navigationPoints[nextPointIndex];
        console.log('다음 전환점 상세:', nextPoint);

        // coords 배열에서 해당 좌표 가져오기
        const nextPointCoord = coords[nextPoint.coordIndex];
        console.log('다음 전환점 좌표:', nextPointCoord);

        // 현재 위치에서 다음 전환점까지의 거리 계산
        const distance = await calculateDistance(currentLocation, {
            latitude: nextPointCoord.latitude,
            longitude: nextPointCoord.longitude,
            name: ''
        });

        if (distance === null) return;

        console.log('다음 전환점까지 거리:', distance, 'm');

        // 거리에 따른 안내
        if (distance <= 5) {  // 5m 이내: 전환점 도착
            if (lastAnnouncedIndex !== nextPointIndex) {
                showNavigationMessage(nextPoint.description);
                setLastAnnouncedIndex(nextPointIndex);
                setCurrentPointIndex(nextPointIndex + 1);  // 다음 세그먼트로 이동
                setCurrentSegment(navigationPoints[nextPointIndex + 1]);
            }
        } else if (distance <= 20) {  // 20m 이내: 전환점 접근
            if (lastAnnouncedIndex !== nextPointIndex) {
                const message = getTurnTypePreMessage(nextPoint.turnType);
                showNavigationMessage(message);
                setLastAnnouncedIndex(nextPointIndex);
            }
        } else if (distance <= 50 && nextPoint.turnType !== TurnType.STRAIGHT) {  // 50m 이내: 사전 안내
            if (lastAnnouncedIndex !== nextPointIndex) {
                const message = `${Math.round(distance)}m 앞에서 ${getTurnTypeDescription(nextPoint.turnType)}입니다`;
                showNavigationMessage(message);
                setLastAnnouncedIndex(nextPointIndex);
            }
        }

        // 현재 진행 중인 LineString 구간 표시
        const currentLineString = navigationPoints[currentPointIndex];
        if (currentLineString?.type === 'LineString' && 
            (!currentSegment || currentSegment.description !== currentLineString.description)) {
            setCurrentSegment(currentLineString);
            if (lastAnnouncedIndex !== currentPointIndex) {
                showNavigationMessage(currentLineString.description);
                setLastAnnouncedIndex(currentPointIndex);
            }
        }
    };

    // 회전 안내 사전 메시지
    const getTurnTypePreMessage = (turnType: number): string => {
        switch (turnType) {
            case TurnType.LEFT:
            case TurnType.LEFT_8:
            case TurnType.LEFT_10:
                return "잠시 후 좌회전입니다";
            case TurnType.RIGHT:
            case TurnType.RIGHT_2:
            case TurnType.RIGHT_4:
                return "잠시 후 우회전입니다";
            case TurnType.U_TURN:
                return "잠시 후 유턴입니다";
            case TurnType.CROSSWALK:
                return "잠시 후 횡단보도입니다";
            case TurnType.STAIRS:
                return "잠시 후 계단입니다";
            case TurnType.ELEVATOR:
                return "잠시 후 엘리베이터입니다";
            default:
                return "";
        }
    };

    useEffect(() => {
        if (routeCoords.length > 0 && mapRef.current) {
            const coordinates = [
                departureLocation,
                arrivalLocation,
                ...routeCoords
            ];

            // 먼저 전체 경로를 보여줌
            mapRef.current.fitToCoordinates(
                coordinates,
                {
                    // edgePadding: MAP_PADDING,
                    edgePadding: {
                        top: 0,
                        right: 50,
                        bottom: 0,
                        left: 50
                    },
                    animated: true,
                }
            );

            // 5초 후에 사용자 위치 추적 모드로 전환
            setTimeout(() => {
                setIsFollowingUser(true);
                Geolocation.getCurrentPosition(
                    position => {
                        mapRef.current?.animateToRegion({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            latitudeDelta: 0.002,
                            longitudeDelta: 0.002,
                        }, 1000);
                    },
                    error => console.error(error),
                    { enableHighAccuracy: true }
                );
            }, 5000);
        if (routeCoords.length > 0 && mapRef.current) {
            const coordinates = [
                departureLocation,
                arrivalLocation,
                ...routeCoords
            ];

            // 먼저 전체 경로를 보여줌
            mapRef.current.fitToCoordinates(
                coordinates,
                {
                    // edgePadding: MAP_PADDING,
                    edgePadding: {
                        top: 0,
                        right: 50,
                        bottom: 0,
                        left: 50
                    },
                    animated: true,
                }
            );

            // 5초 후에 사용자 위치 추적 모드로 전환
            setTimeout(() => {
                setIsFollowingUser(true);
                Geolocation.getCurrentPosition(
                    position => {
                        mapRef.current?.animateToRegion({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            latitudeDelta: 0.002,
                            longitudeDelta: 0.002,
                        }, 1000);
                    },
                    error => console.error(error),
                    { enableHighAccuracy: true }
                );
            }, 5000);
        }
    }, [routeCoords]);

    // 현재 위치가 변경될 때마다 체크
    useEffect(() => {
        const watchId = Geolocation.watchPosition(
            position => {
                const currentLocation: Location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    name: ''
                };

                if (isFollowingUser && mapRef.current) {
                    mapRef.current.animateToRegion({
                        latitude: currentLocation.latitude,
                        longitude: currentLocation.longitude,
                        latitudeDelta: 0.002,
                        longitudeDelta: 0.002,
                    }, 1000);
                }

                checkNavigationPoint(currentLocation);
            },
            error => console.error(error),
            { 
                enableHighAccuracy: true, 
                distanceFilter: 10,
                interval: 1000,
                fastestInterval: 500
            }
        );

        return () => Geolocation.clearWatch(watchId);
    }, [currentPointIndex, navigationPoints, isFollowingUser]);

    // 지도 터치 시 사용자 위치 추적 모드 해제
    const handleMapTouch = () => {
        setIsFollowingUser(false);
    };

    const handleLocationButtonPress = () => {
        setIsFollowingUser(true);
        if (mapRef.current) {
            Geolocation.getCurrentPosition(
                position => {
                    mapRef.current?.animateToRegion({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        latitudeDelta: 0.002,
                        longitudeDelta: 0.002,
                    }, 1000);
                },
                error => console.error(error),
                { enableHighAccuracy: true }
            );
        }
    };

    // moveAlongPath 함수 수정
    const moveAlongPath = () => {
        let currentIndex = 0;
        let startTime = Date.now();

        const interval = setInterval(() => {
            if (currentIndex >= routeCoords.length - 1) {
                clearInterval(interval);
                return;
            }

            const currentTime = Date.now() - startTime;

            // 현재 구간의 시작점과 끝점 찾기
            let currentSegment = null;
            let nextPoint = null;
            let prevPoint = null;

            // 경로 상 현재 위치 계산
            for (let i = 0; i < navigationPoints.length; i++) {
                if (navigationPoints[i].type === 'Point' && navigationPoints[i].timestamp !== undefined) {
                    if (navigationPoints[i].timestamp * FRAME_TO_MS > currentTime) {
                        currentSegment = navigationPoints[i-1];
                        nextPoint = navigationPoints[i];
                        prevPoint = navigationPoints[i-2]?.type === 'Point' ? navigationPoints[i-2] : null;
                        break;
                    }
                }
            }

            // LineString 구간에서 마커 이동
            if (currentSegment && nextPoint && currentSegment.type === 'LineString') {
                const startTime = prevPoint?.timestamp || 0;
                const endTime = nextPoint.timestamp || 0;
                const totalTime = endTime - startTime;
                const currentTime = (Date.now() - startTime) / FRAME_TO_MS;
                const progress = Math.min(currentTime / totalTime, 1);

                if (currentSegment?.geometry?.coordinates && Array.isArray(currentSegment.geometry.coordinates)) {
                    const coordinates = currentSegment.geometry.coordinates as [number, number][];
                    const segmentCount = coordinates.length - 1;
                    const segmentIndex = Math.min(
                        Math.floor(progress * segmentCount),
                        segmentCount - 1
                    );
                    const segmentProgress = (progress * segmentCount) % 1;

                    if (coordinates[segmentIndex] && coordinates[segmentIndex + 1]) {
                        const newPosition = interpolatePosition(
                            {
                                latitude: coordinates[segmentIndex][1],
                                longitude: coordinates[segmentIndex][0]
                            },
                            {
                                latitude: coordinates[segmentIndex + 1][1],
                                longitude: coordinates[segmentIndex + 1][0]
                            },
                            segmentProgress
                        );

                        setCurrentPosition({
                            ...newPosition,
                            name: ''
                        });
                    }
                }
            }

        }, 16); // 약 60fps로 업데이트

        return () => clearInterval(interval);
    };

    // 두 점 사이의 위치를 계산하는 보간 함수
    const interpolatePosition = (start: any, end: any, fraction: number) => {
        return {
            latitude: start.latitude + (end.latitude - start.latitude) * fraction,
            longitude: start.longitude + (end.longitude - start.longitude) * fraction
        };
    };

    return (
        <View style={[CommonStyles.container, { position: 'relative' }]}>
            <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            <View style={styles.mapContainer}>
                <MapView
                    key={key}
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                        latitude: (departureLocation.latitude + arrivalLocation.latitude) / 2,
                        longitude: (departureLocation.longitude + arrivalLocation.longitude) / 2,
                        latitudeDelta: 0.02,
                        longitudeDelta: 0.02,
                    }}
                    showsUserLocation={true}
                    onPanDrag={handleMapTouch}
                    followsUserLocation={isFollowingUser}
                    // 기본 패딩 설정
                    paddingAdjustmentBehavior="automatic"
                    mapPadding={{
                        top: 0,
                        right: 0,
                        bottom: BOTTOM_SHEET_HEIGHT,
                        left: 0,
                    }}
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

                <TouchableOpacity 
                    style={[
                        styles.locationButton,
                        isFollowingUser && styles.locationButtonActive
                    ]}
                    onPress={handleLocationButtonPress}
                >
                    <Text style={{ color: Color.textPrimary }}>📍</Text>
                </TouchableOpacity>
            </View>

            {showSheet && (
                <View style={styles.bottomSheetContainer} pointerEvents="box-none">
                    <View style={styles.bottomSheetContent} pointerEvents="box-none">
                        <BottomSheet 
                            image={currentSegment?.type === 'Point' ? 
                                getDirectionIcon(currentSegment.turnType) : 
                                DirectionIcons.straight}
                        >
                            <View style={SheetStyles.sheetTextContainer}>
                                <Text style={[SheetStyles.mainLine, {color: Color.textPrimary}]}>
                                    {currentSegment?.description || ''}
                                </Text>
                            </View>
                        </BottomSheet>
                    </View>
                </View>
            )}
        <View style={[CommonStyles.container, { position: 'relative' }]}>
            <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            <View style={styles.mapContainer}>
                <MapView
                    key={key}
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                        latitude: (departureLocation.latitude + arrivalLocation.latitude) / 2,
                        longitude: (departureLocation.longitude + arrivalLocation.longitude) / 2,
                        latitudeDelta: 0.02,
                        longitudeDelta: 0.02,
                    }}
                    showsUserLocation={true}
                    onPanDrag={handleMapTouch}
                    followsUserLocation={isFollowingUser}
                    // 기본 패딩 설정
                    paddingAdjustmentBehavior="automatic"
                    mapPadding={{
                        top: 0,
                        right: 0,
                        bottom: BOTTOM_SHEET_HEIGHT,
                        left: 0,
                    }}
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

                <TouchableOpacity 
                    style={[
                        styles.locationButton,
                        isFollowingUser && styles.locationButtonActive
                    ]}
                    onPress={handleLocationButtonPress}
                >
                    <Text style={{ color: Color.textPrimary }}>📍</Text>
                </TouchableOpacity>
            </View>

            {showSheet && (
                <View style={styles.bottomSheetContainer} pointerEvents="box-none">
                    <View style={styles.bottomSheetContent} pointerEvents="box-none">
                        <BottomSheet 
                            image={currentSegment?.type === 'Point' ? 
                                getDirectionIcon(currentSegment.turnType) : 
                                DirectionIcons.straight}
                        >
                            <View style={SheetStyles.sheetTextContainer}>
                                <Text style={[SheetStyles.mainLine, {color: Color.textPrimary}]}>
                                    {currentSegment?.description || ''}
                                </Text>
                            </View>
                        </BottomSheet>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    mapContainer: {
    mapContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
    },
    map: {
        flex: 1,
        flex: 1,
        width: '100%',
        height: '100%',
    },
    bottomSheetContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '100%',
        zIndex: 2,
        backgroundColor: 'transparent',
    },
    bottomSheetContent: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    locationButton: {
        position: 'absolute',
        bottom: 400,  // BottomSheet 위로 올리기
        right: 20,
        backgroundColor: Color.backgroundsPrimary,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 3,  // BottomSheet의 zIndex보다 높게 설정
    },
    locationButtonActive: {
        backgroundColor: Color.bLUE,  // 추적 모드일 때 파란색으로 변경
    },
    locationButtonIcon: {
        width: 24,
        height: 24,
        tintColor: Color.textPrimary,  // 아이콘 색상을 흰색으로
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
        zIndex: 4,  // BottomSheet(2)와 locationButton(3)보다 높게 설정
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
    bottomSheetContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '100%',
        zIndex: 2,
        backgroundColor: 'transparent',
    },
    bottomSheetContent: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    locationButton: {
        position: 'absolute',
        bottom: 400,  // BottomSheet 위로 올리기
        right: 20,
        backgroundColor: Color.backgroundsPrimary,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 3,  // BottomSheet의 zIndex보다 높게 설정
    },
    locationButtonActive: {
        backgroundColor: Color.bLUE,  // 추적 모드일 때 파란색으로 변경
    },
    locationButtonIcon: {
        width: 24,
        height: 24,
        tintColor: Color.textPrimary,  // 아이콘 색상을 흰색으로
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
        zIndex: 4,  // BottomSheet(2)와 locationButton(3)보다 높게 설정
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

export default TmapView;