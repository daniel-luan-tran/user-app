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
import { checkUserRole, checkUser } from '@/api';
import { Account } from '@/types';
import { useNavigation, useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

const _apiUrl = process.env.EXPO_PUBLIC_API_URL;
enum Status {
  FINDING_DRIVER = 'FINDING_DRIVER',
  FOUND_DRIVER = 'FOUND_DRIVER',
  STOPPED_FIND_DRIVER = 'STOPPED_FIND_DRIVER',
}

export default function FindDriver() {
  const [socket, setSocket] = useState<Socket>();
  const [status, setStatus] = useState<Status>();
  const [disconnectCountdown, setDisconnectCountdown] = useState<number>(0);
  const [activeIntervals, setActiveIntervals] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [user, setUser] = useState<Account | undefined>();
  const isDarkMode = useColorScheme() === 'dark';
  const timeoutConnect = 60; // Second
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
      setIsValidRole(true);
      try {
        const _user = await checkUserRole();
        if (!_user) setIsValidRole(false);
        setIsValidRole(true);
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
        const data = await checkUser();
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

  useEffect(() => {
    // if (status) {
    //   const timerId = setInterval(() => {
    //     setDisconnectCountdown((prevCount) => prevCount - 1);
    //   }, 1000);
    //   setActiveIntervals((prevIds) => [
    //     ...prevIds,
    //     timerId as unknown as number,
    //   ]);
    // } else {
    //   activeIntervals.forEach((intervalId) => clearInterval(intervalId));
    // }
    console.log('status', status);
    console.log('loading', loading);
  }, [status, loading]);

  const driverRequest = async () => {
    // setDisconnectCountdown(timeoutConnect);
    setLoading(true);
    const _socket = await connectSocket();
    setConnecting(true);
    if (_socket) {
      setStatus(Status.FINDING_DRIVER);

      if (params) {
        _socket.on('connect', () => {
          _socket.emit('driverRequest', {
            from: {
              startLat: parseFloat(params.startLat as string),
              startLng: parseFloat(params.startLng as string),
            },
            to: {
              latitude: parseFloat(params.endLat as string),
              longitude: parseFloat(params.endLng as string),
            },
          });

          _socket.on('acceptPassenger', (data) => {
            console.log('driverLocation', data);
            setLoading(false);
            setStatus(Status.FOUND_DRIVER);
          });
        });
      }

      _socket.on('disconnect', () => {
        setStatus(Status.STOPPED_FIND_DRIVER);
      });

      _socket.on('driverDisconnect', () => {
        _socket.disconnect();
      });

      setSocket(_socket);
      // setInterval(() => {
      //   _socket.disconnect();
      // }, timeoutConnect * 1000);
    }
  };

  const onDisconnectSocket = async () => {
    console.log(_apiUrl);
    if (_apiUrl) {
      socket?.emit('passengerDisconnect');
      // socket?.disconnect();
      if (socket?.disconnected) {
        setStatus(Status.STOPPED_FIND_DRIVER);
        setConnecting(false);
        setLoading(false);
      }
    }
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

      <View>
        {status === Status.FINDING_DRIVER && loading ? (
          <ActivityIndicator size="large" />
        ) : (
          (status === Status.STOPPED_FIND_DRIVER || !status) && (
            <Button title="Find driver" onPress={driverRequest} />
          )
        )}

        {connecting && status !== Status.STOPPED_FIND_DRIVER && (
          <Button
            title="Stop finding"
            onPress={onDisconnectSocket}
            color={'grey'}
          />
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
          {/* {status &&
              `Will disconnect in ${disconnectCountdown} second${
                disconnectCountdown > 1 ? 's' : ''
              }`} */}
        </Text>
      </View>
    </SafeAreaView>
  );
}
