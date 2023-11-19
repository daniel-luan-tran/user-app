import {
  GooglePlaceData,
  GooglePlaceDetail,
} from 'react-native-google-places-autocomplete';

export type GoogleData = {
  data: GooglePlaceData;
  details?: GooglePlaceDetail;
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type DriverType = {
  id: number;
  name: string;
};

export type Account = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  active: boolean;
  azureOid: string;
  phoneNumber: string;
  address: string;
  displayName: string;
  User: User | null;
};

export type Driver = {
  accountId: string;
  account: Account;
  driverTypeId: number;
  driverType: DriverType;
  // currentPlace?: Coordinates;
};

export type User = {
  accountId: string;
  account: Account;
  // currentPlace?: Coordinates;
};
