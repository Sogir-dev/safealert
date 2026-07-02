import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export default function SettingsScreen() {
  async function clearAllData() {
    Alert.alert(
      'Clear All Data',
      'This will delete emergency contact, medical information, trusted contacts, and history.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove([
              'emergencyContact',
              'medicalInfo',
              'trustedContacts',
              'emergencyHistory',
            ]);

            Alert.alert('Data Cleared', 'All SafeAlert data has been deleted.');
          },
        },
      ]
    );
  }

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Manage SafeAlert preferences and app data.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>About SafeAlert</Text>
        <Text style={styles.cardText}>
          SafeAlert is an emergency SOS app designed to help users quickly alert trusted contacts,
          share live location, and provide medical information during emergencies.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>App Version</Text>
        <Text style={styles.cardText}>Version 1.0.0</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Privacy</Text>
        <Text style={styles.cardText}>
          Your emergency contact, medical information, and history are currently stored locally on
          your device using AsyncStorage.
        </Text>
      </View>

      <TouchableOpacity style={styles.dangerButton} onPress={clearAllData}>
        <Text style={styles.dangerButtonText}>Clear All App Data</Text>
      </TouchableOpacity>

      <TouchableOpacity
          style={styles.dangerButton}
          onPress={async () => {
            await AsyncStorage.removeItem('isLoggedIn');
            router.replace('/welcome');
          }}
        >
          <Text style={styles.dangerButtonText}>Logout</Text>
        </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  container: {
    padding: 20,
    paddingTop: 80,
    paddingBottom: 120,
  },
  title: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#D1D5DB',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
  },
  card: {
    backgroundColor: '#1F2937',
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
  },
  cardTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardText: {
    color: '#D1D5DB',
    fontSize: 15,
    lineHeight: 22,
  },
  dangerButton: {
    backgroundColor: '#DC2626',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  dangerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});