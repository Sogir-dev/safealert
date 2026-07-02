import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  useEffect(() => {
    checkLoginStatus();
  }, []);

  async function checkLoginStatus() {
    setTimeout(async () => {
      const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');

      if (isLoggedIn === 'true') {
        router.replace('/(tabs)');
      } else {
        router.replace('/welcome');
      }
    }, 2000);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🆘</Text>
      <Text style={styles.title}>SafeAlert</Text>
      <Text style={styles.subtitle}>Emergency help, one tap away.</Text>

      <ActivityIndicator size="large" color="#DC2626" style={styles.loader} />

      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
  },
  logo: {
    fontSize: 85,
    marginBottom: 12,
  },
  title: {
    color: 'white',
    fontSize: 44,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#D1D5DB',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 8,
  },
  loader: {
    marginTop: 35,
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 15,
    marginTop: 12,
  },
});