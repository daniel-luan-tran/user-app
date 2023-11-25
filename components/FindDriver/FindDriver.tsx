import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  useColorScheme,
} from 'react-native';
import { Text, View } from '../Themed';
import Colors from '@/constants/Colors';
import io, { Socket } from 'socket.io-client';
import { connectSocket } from '@/api/connectSocket';
import { checkUserRole, checkUser, checkJwt } from '@/api';
import { Account, Coordinates, Driver } from '@/types';
import { useNavigation, useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import RouteMap from '../RouteMap/RouteMap';

enum Status {
  FINDING_DRIVER = 'FINDING_DRIVER',
  FOUND_DRIVER = 'FOUND_DRIVER',
  STOPPED_FIND_DRIVER = 'STOPPED_FIND_DRIVER',
}

export default function FindDriver() {
  const [socket, setSocket] = useState<Socket>();
  const [status, setStatus] = useState<Status>();
  const [loading, setLoading] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [user, setUser] = useState<Account | undefined>();
  const [driverLocation, setDriverLocation] = useState<Coordinates>();
  const [driverAccount, setDriverAccount] = useState<Driver>();
  const [passengerAccepted, setPassengerAccepted] = useState<boolean>(false);

  const isDarkMode = useColorScheme() === 'dark';
  const navigation = useNavigation();
  const params = useLocalSearchParams();

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.dark : Colors.light,
  };

  const [isValidRole, setIsValidRole] = useState<boolean>(false);
  const router = useRouter();

  const handleOpenUpdateProfile = () => {
    router.push('/(tabs)/');
  };

  useEffect(() => {
    const checkValidRole = async () => {
      try {
        const _user = await checkUserRole();
        if (!_user) setIsValidRole(false);
        else setIsValidRole(true);
      } catch (error) {
        setIsValidRole(false);
      }
    };

    checkValidRole();
    navigation.addListener('focus', (payload) => {
      checkValidRole();
    });
  }, []);

  useEffect(() => {
    const getUser = async () => {
      try {
        const data = await checkJwt();
        if (!data) return;
        setUser(data);
      } catch (error) {
        setUser(undefined);
      }
    };
    getUser();
    navigation.addListener('focus', (payload) => {
      getUser();
    });
  }, []);

  const driverRequest = async () => {
    setLoading(true);
    const _socket = await connectSocket();
    setConnecting(true);
    if (_socket) {
      setStatus(Status.FINDING_DRIVER);

      if (params) {
        _socket.on('connect', () => {
          _socket.emit('driverRequest', {
            passengerRoute: {
              from: {
                startLat: parseFloat(params.startLat as string),
                startLng: parseFloat(params.startLng as string),
              },
              to: {
                endLat: parseFloat(params.endLat as string),
                endLng: parseFloat(params.endLng as string),
              },
            },
            passengerAccount: user,
            driverTypeId: parseInt(params.driverType as string),
          });

          _socket.on('acceptPassenger', (data) => {
            console.log('Drive info', data);
            setDriverLocation(data.driverLocation);
            setDriverAccount(data.driverAccount);
            setLoading(false);
            setStatus(Status.FOUND_DRIVER);
            setPassengerAccepted(true);
          });

          _socket.on('passengerRequest', (data) => {
            console.log('passengerRequest', data);
            _socket.emit('foundDriver', {
              from: {
                startLat: parseFloat(params.startLat as string),
                startLng: parseFloat(params.startLng as string),
              },
              to: {
                endLat: parseFloat(params.endLat as string),
                endLng: parseFloat(params.endLng as string),
              },
            });
          });

          _socket.on('updatedBooking', () => {
            _socket.disconnect();
            setStatus(Status.STOPPED_FIND_DRIVER);
            setConnecting(false);
            setLoading(false);
            setPassengerAccepted(false);
          });
        });
      }

      _socket.on('disconnect', () => {
        setStatus(Status.STOPPED_FIND_DRIVER);
        setDriverLocation(undefined);
        setPassengerAccepted(false);
      });

      _socket.on('driverDisconnect', () => {
        _socket.disconnect();
      });

      setSocket(_socket);
    }
  };

  const onDisconnectSocket = async () => {
    socket?.emit('passengerDisconnect');
    // socket?.disconnect();
    setStatus(Status.STOPPED_FIND_DRIVER);
    setConnecting(false);
    setLoading(false);
    setPassengerAccepted(false);
  };

  const onCancelBooking = async () => {
    socket?.emit('userCancelBooking');
  };

  if (!isValidRole)
    return (
      <SafeAreaView>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={backgroundStyle.backgroundColor.background}
        />
        <View
          style={{
            marginTop: 'auto',
            marginBottom: 'auto',
          }}
        >
          <Text style={{ marginBottom: 10, textAlign: 'center' }}>
            You are Passenger or Driver?
          </Text>
          <Button
            title="Log in and update your profile"
            onPress={handleOpenUpdateProfile}
          />
        </View>
      </SafeAreaView>
    );

  return (
    <SafeAreaView>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor.background}
      />

      <View
        style={{
          height: 700,
          padding: 10,
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {driverLocation && (
          <View style={{ height: '80%' }}>
            <RouteMap
              driverLocationParam={driverLocation}
              driverAccountParam={driverAccount}
            />
          </View>
        )}
        {status === Status.FINDING_DRIVER && loading ? (
          <ActivityIndicator size="large" />
        ) : (
          (status === Status.STOPPED_FIND_DRIVER || !status) && (
            <Button title="Find driver" onPress={driverRequest} />
          )
        )}

        {connecting && status !== Status.STOPPED_FIND_DRIVER && (
          <View>
            {passengerAccepted ? (
              <Button
                title="Cancel booking"
                onPress={onCancelBooking}
                color={'grey'}
              />
            ) : (
              <Button
                title="Stop finding"
                onPress={onDisconnectSocket}
                color={'grey'}
              />
            )}
          </View>
        )}
        <Text
          style={{
            color:
              status === Status.FINDING_DRIVER
                ? 'orange'
                : status === Status.FOUND_DRIVER
                ? 'green'
                : 'red',
          }}
        >
          Status:{' '}
          {status === Status.FINDING_DRIVER
            ? 'Finding driver!'
            : status === Status.FOUND_DRIVER
            ? 'Found driver!'
            : 'Stopped finding!'}
        </Text>
      </View>
    </SafeAreaView>
  );
}
