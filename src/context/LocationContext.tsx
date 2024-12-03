// LocationContext.tsx

import React, { createContext, useState, ReactNode } from 'react';
import { Location } from '../types';

interface LocationContextProps {
    departureLocation: Location | null;
    setDepartureLocation: (location: Location) => void;
    arrivalLocation: Location | null;
    setArrivalLocation: (location: Location) => void;
}

export const LocationContext = createContext<LocationContextProps>({
    departureLocation: null,
    setDepartureLocation: () => {},
    arrivalLocation: null,
    setArrivalLocation: () => {},
});

interface LocationProviderProps {
    children: ReactNode;
}

export const LocationProvider = ({ children }: LocationProviderProps) => {
    const [departureLocation, setDepartureLocation] = useState<Location | null>(null);
    const [arrivalLocation, setArrivalLocation] = useState<Location | null>(null);

    return (
        <LocationContext.Provider
            value={{
                departureLocation,
                setDepartureLocation,
                arrivalLocation,
                setArrivalLocation,
            }}
        >
            {children}
        </LocationContext.Provider>
    );
};
