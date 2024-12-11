// types.ts

export type RootStackParamList = {
    TitleScreen: undefined;
    DepartureConfirm: undefined;
    ArrivalConfirm: { departureLocation: Location };
    TmapView: { departureLocation: Location; arrivalLocation: Location };
    CameraScreen: undefined;
};

export interface Location {
    name: string;
    latitude: number;
    longitude: number;
}
