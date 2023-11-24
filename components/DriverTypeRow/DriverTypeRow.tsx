import React, { useEffect, useState, useMemo } from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  useColorScheme,
  Image,
} from 'react-native';
import { Text, View } from '../Themed';
import styles from './DriverTypeRow.styles';
import {
  GooglePlaceData,
  GooglePlaceDetail,
  GooglePlacesAutocomplete,
} from 'react-native-google-places-autocomplete';
import { DriverType, GoogleData } from '@/types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getImage } from '@/utilities/getDriverImage';
import { getDriverTypes } from '@/api';
import DropDownPicker from 'react-native-dropdown-picker';

interface DriverTypeRowProps {
  onChangeDriverType: (value: number | null) => void;
}

export default function DriverTypeRow({
  onChangeDriverType,
}: DriverTypeRowProps) {
  const [driverType, setDriverType] = useState<number | null>(null);
  const [driverTypeList, setDriverTypeList] = useState<DriverType[]>([]);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    const getDriverTypeList = async () => {
      const _driverTypes = await getDriverTypes();
      console.log('_driverTypes', _driverTypes);
      setDriverTypeList(_driverTypes);
    };
    getDriverTypeList();
  }, []);

  const driverTypeSelected = useMemo(() => {
    return driverTypeList.find((item) => item.id == driverType);
  }, [driverType]);

  return (
    <>
      <View style={styles.driverTypeRowContainer}>
        <View style={styles.leftContainer}>
          <Image
            style={styles.image}
            source={getImage(driverTypeSelected?.name || '')}
          />
          <Text style={styles.driverName}>{driverTypeSelected?.name}</Text>
        </View>
        {driverTypeSelected && (
          <View style={styles.rightContainer}>
            <Ionicons name="pricetag" />
            <Text style={styles.price}>${driverTypeSelected?.priceUsd}</Text>
          </View>
        )}
      </View>
      <View>
        <DropDownPicker
          open={open}
          value={driverType}
          items={driverTypeList.map((item) => {
            return {
              label: item.name,
              value: item.id,
            };
          })}
          setOpen={setOpen}
          setValue={setDriverType}
          setItems={setDriverTypeList}
          onSelectItem={(value) => {
            setDriverType(value.value || null);
            onChangeDriverType(value.value || null);
          }}
        />
      </View>
    </>
  );
}
