import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { driverAPI } from '../services/api';
import { useAuth } from './AuthContext';

interface LocationContextType {
  location: Location.LocationObject | null;
  errorMsg: string | null;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  isTracking: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [subscription, setSubscription] = useState<Location.LocationSubscription | null>(null);
  const { user } = useAuth();

  const startTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Get current location first
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // Send to server
      if (user) {
        await driverAPI.updateLocation(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude
        );
      }

      // Start watching location
      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 50, // Or when moved 50 meters
        },
        async (newLocation) => {
          setLocation(newLocation);

          // Send to server
          if (user) {
            try {
              await driverAPI.updateLocation(
                newLocation.coords.latitude,
                newLocation.coords.longitude
              );
            } catch (error) {
              console.error('Failed to update location:', error);
            }
          }
        }
      );

      setSubscription(sub);
      setIsTracking(true);
    } catch (error) {
      setErrorMsg('Failed to start location tracking');
      console.error(error);
    }
  };

  const stopTracking = () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
    setIsTracking(false);
  };

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  return (
    <LocationContext.Provider
      value={{ location, errorMsg, startTracking, stopTracking, isTracking }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
