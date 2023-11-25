import React, { useEffect, useState } from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { Text, View } from '../Themed';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { loginJwt, loginLocal, saveJwt } from '@/api';
const EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL;
const EXPO_PUBLIC_USER_EMAIL = process.env.EXPO_PUBLIC_USER_EMAIL;
const EXPO_PUBLIC_USER_PASSWORD = process.env.EXPO_PUBLIC_USER_PASSWORD;

export default function AuthViewLocal() {
  const router = useRouter();
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(EXPO_PUBLIC_USER_EMAIL || '');
  const [password, setPassword] = useState<string>(
    EXPO_PUBLIC_USER_PASSWORD || '',
  );
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.dark : Colors.light,
  };

  const login = async () => {
    setIsloading(true);
    try {
      const jwt = await loginJwt({ email, password });
      await saveJwt(jwt);
      setTimeout(() => {
        router.push('/(tabs)/');
      }, 500);
      setIsloading(false);
    } catch (error) {
      setIsloading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        minHeight: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <View>
        {isLoading && <ActivityIndicator size="large" />}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text>Name: </Text>
          <TextInput
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text>Password: </Text>
          <TextInput
            placeholder="Enter your password"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
        </View>
        <Button title="Login" onPress={login} />
      </View>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor.background}
      />
    </View>
  );
}
