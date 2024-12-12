// types.ts

export type RootStackParamList = {
    LocationSet: {
        type: 'departure' | 'arrival';
        departureLocation?: Location;
    };
    DepartureConfirm: {
        searchedLocation: Location;
    };
    ArrivalConfirm: {
        departureLocation: Location;
        searchedLocation: Location;
    };
    TmapView: { 
        departureLocation: Location; 
        arrivalLocation: Location 
    };
    CameraScreen: {
        departureLocation: Location;
        arrivalLocation: Location;
    };
};

export interface Location {
    name: string;
    latitude: number;
    longitude: number;
}
