import React, { useEffect, useState } from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  useColorScheme,
} from 'react-native';
import { Text, View } from '../Themed';
import styles from './DriverTypes.styles';
import { Coordinates, GoogleData } from '@/types';
import DriverTypeRow from '../DriverTypeRow/DriverTypeRow';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

export default function DriverTypes() {
  const [fromLocation, setFromLocation] = useState<Coordinates>();
  const [toLocation, setToLocation] = useState<Coordinates>();
  const params = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    console.log(params);
    if (params) {
      setFromLocation({
        latitude: parseFloat(params.startLat as string),
        longitude: parseFloat(params.startLng as string),
      });
      setToLocation({
        latitude: parseFloat(params.endLat as string),
        longitude: parseFloat(params.endLng as string),
      });
    } else {
      console.warn('no params');
    }
  }, []);

  const handleConfirm = () => {
    router.push({
      pathname: '/modal',
      params: {
        viewType: 'FIND_DRIVER_VIEW',
        startLat: fromLocation?.latitude || '',
        startLng: fromLocation?.longitude || '',
        endLat: toLocation?.latitude || '',
        endLng: toLocation?.longitude || '',
      },
    });
  };

  return (
    <View style={styles.driverTypesContainer}>
      <Text>Driver types</Text>
      <DriverTypeRow />
      <Button title="Confirm" onPress={handleConfirm} />
    </View>
  );
}
