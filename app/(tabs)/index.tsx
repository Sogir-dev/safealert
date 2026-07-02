import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Coordinates = {
  latitude: string;
  longitude: string;
};

export default function HomeScreen() {
  const [userName, setUserName] = useState('');
  const [greeting, setGreeting] = useState('');

  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [alertSent, setAlertSent] = useState(false);

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [savedContact, setSavedContact] = useState({ name: '', phone: '' });
  const [savedFullName, setSavedFullName] = useState('');
  const [savedMedicalInfo, setSavedMedicalInfo] = useState({
    bloodGroup: '',
    allergies: '',
    condition: '',
  });
  const [trustedContacts, setTrustedContacts] = useState<
    { name: string; phone: string }[]
  >([]);
  const [smsSent, setSmsSent] = useState(false);

  useEffect(() => {
    loadSavedData();
    loadUserGreeting();
  }, []);


  useEffect(() => {
    if (!sosActive || alertSent) return;

    if (countdown === 0) {
      triggerEmergencyAlert();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [sosActive, countdown, alertSent]);

  async function loadSavedData() {
    const contact = await AsyncStorage.getItem('emergencyContact');
    const medicalInfo = await AsyncStorage.getItem('medicalInfo');
    const fullName = await AsyncStorage.getItem('fullName');
    const trusted = await AsyncStorage.getItem('trustedContacts');

    if (fullName) setSavedFullName(fullName);
    if (contact) setSavedContact(JSON.parse(contact));
    if (medicalInfo) setSavedMedicalInfo(JSON.parse(medicalInfo));
    if (trusted) setTrustedContacts(JSON.parse(trusted));
  }

  async function getCurrentLocation(saveHistory = false): Promise<Coordinates | null> {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return null;
    }

    const currentLocation = await Location.getCurrentPositionAsync({});

    const lat = currentLocation.coords.latitude.toString();
    const lng = currentLocation.coords.longitude.toString();

    setLatitude(lat);
    setLongitude(lng);

    if (saveHistory) {
      setAlertSent(true);
      await saveEmergencyHistory(lat, lng);
    }

    return { latitude: lat, longitude: lng };
  }

  async function saveEmergencyHistory(lat: string, lng: string) {
    const newHistory = {
      contact: savedContact.name || 'No contact',
      latitude: lat,
      longitude: lng,
      time: new Date().toLocaleString(),
    };

    const oldHistory = await AsyncStorage.getItem('emergencyHistory');
    const historyArray = oldHistory ? JSON.parse(oldHistory) : [];

    await AsyncStorage.setItem(
      'emergencyHistory',
      JSON.stringify([newHistory, ...historyArray])
    );
  }

  function activateSOS() {
    setSosActive(true);
    setAlertSent(false);
    setSmsSent(false);
    setCountdown(3);
    setLatitude('');
    setLongitude('');
  }

  function cancelSOS() {
    setSosActive(false);
    setAlertSent(false);
    setSmsSent(false);
    setCountdown(3);
    setLatitude('');
    setLongitude('');
  }

  function callEmergencyContact() {
    if (savedContact.phone === '') {
      Alert.alert('No Contact', 'Please save an emergency contact in Profile first.');
      return;
    }

    Linking.openURL(`tel:${savedContact.phone}`);
  }

  function callEmergencyNumber(number: string) {
    Linking.openURL(`tel:${number}`);
  }

  async function openMaps() {
    let lat = latitude;
    let lng = longitude;

    if (lat === '' || lng === '') {
      const coords = await getCurrentLocation(false);
      if (!coords) return;

      lat = coords.latitude;
      lng = coords.longitude;
    }

    Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`);
  }

  function buildAlertMessage(lat: string, lng: string) {
    const mapLink = `https://maps.google.com/?q=${lat},${lng}`;

    return `
🚨 EMERGENCY SOS ALERT 🚨

My name is ${savedFullName || 'Not set'}.

I need immediate assistance.

📍 Live Location:
${mapLink}

👤 Emergency Contact:
Name: ${savedContact.name || 'Not set'}
Phone: ${savedContact.phone || 'Not set'}

🩺 Medical Information:
Blood Group: ${savedMedicalInfo.bloodGroup || 'Not set'}
Allergies: ${savedMedicalInfo.allergies || 'Not set'}
Condition: ${savedMedicalInfo.condition || 'Not set'}

⏰ Sent:
${new Date().toLocaleString()}

Please contact me or emergency services immediately.
`;
  }

  async function openWhatsAppMessage() {
    let lat = latitude;
    let lng = longitude;

    if (lat === '' || lng === '') {
      const coords = await getCurrentLocation(false);
      if (!coords) return;

      lat = coords.latitude;
      lng = coords.longitude;
    }

    Linking.openURL(
      `whatsapp://send?text=${encodeURIComponent(buildAlertMessage(lat, lng))}`
    );
  }

  async function triggerEmergencyAlert() {
    const coords = await getCurrentLocation(true);
    if (!coords) return;

    const recipients = [
      savedContact.phone,
      ...trustedContacts.map((c) => c.phone),
    ].filter((phone) => phone.trim() !== '');

    if (recipients.length === 0) {
      Alert.alert(
        'No Contacts Saved',
        'Add an emergency contact or trusted contact in Profile to auto-send an SMS alert.'
      );
      return;
    }

    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('SMS Unavailable', 'This device cannot send SMS messages.');
      return;
    }

    const message = buildAlertMessage(coords.latitude, coords.longitude);
    const { result } = await SMS.sendSMSAsync(recipients, message);

    if (result === 'sent' || result === 'unknown') {
      setSmsSent(true);
    }
  }

  async function loadUserGreeting() {
  const savedProfile = await AsyncStorage.getItem('userProfile');

  if (savedProfile) {
    const profile = JSON.parse(savedProfile);
    setUserName(profile.fullName);
  }

  const hour = new Date().getHours();
  console.log('Current Hour:', hour);

  if (hour >= 5 && hour < 12) {
  setGreeting('Good Morning');
} else if (hour >= 12 && hour < 17) {
  setGreeting('Good Afternoon');
} else {
  setGreeting('Good Evening');
}
  }

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container}>
      <View style={{ marginBottom: 25 }}>
  <Text
    style={{
      color: 'white',
      fontSize: 30,
      fontWeight: 'bold',
    }}
  >
    👋 {greeting}
  </Text>

  <Text
    style={{
      color: '#60A5FA',
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 5,
    }}
  >
    {userName}
  </Text>

  <Text
    style={{
      color: '#9CA3AF',
      marginTop: 8,
      fontSize: 15,
    }}
  >
    Stay safe. Your emergency tools are ready.
  </Text>
</View>
      <Text style={styles.subtitle}>Emergency help, one tap away.</Text>

      <View style={[styles.statusBanner, sosActive ? styles.statusDanger : styles.statusSafe]}>
        <Text style={styles.statusText}>
          {sosActive ? '🔴 EMERGENCY ACTIVE' : '🟢 STATUS: SAFE'}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.sosButton, sosActive && styles.sosButtonActive]}
        onPress={activateSOS}
      >
        <Text style={styles.sosText}>{sosActive ? 'ACTIVE' : 'SOS'}</Text>
      </TouchableOpacity>

      {sosActive && (
        <View style={styles.alertBox}>
          <Text style={styles.alertTitle}>
            {alertSent ? 'Alert Sent Successfully' : 'Emergency Mode Activated'}
          </Text>

          {!alertSent ? (
            <>
              <Text style={styles.countdownText}>{countdown}</Text>
              <Text style={styles.alertText}>Sending alert in {countdown} seconds...</Text>
            </>
          ) : (
            <>
              <Text style={styles.alertText}>
                {smsSent
                  ? `SMS alert sent to ${savedContact.name || 'contact'}${
                      trustedContacts.length > 0
                        ? ` and ${trustedContacts.length} trusted contact(s)`
                        : ''
                    }`
                  : 'Could not auto-send SMS. Use WhatsApp below or add contacts in Profile.'}
              </Text>

              <Text style={styles.alertText}>
                Location: {latitude}, {longitude}
              </Text>

              <TouchableOpacity style={styles.mapButton} onPress={openMaps}>
                <Text style={styles.mapButtonText}>Open Location in Maps</Text>
              </TouchableOpacity>

              {!smsSent && (
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={triggerEmergencyAlert}
                >
                  <Text style={styles.mapButtonText}>Retry SMS Alert</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsAppMessage}>
                <Text style={styles.whatsappButtonText}>
                  Send Emergency Message on WhatsApp
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={cancelSOS}>
            <Text style={styles.cancelButtonText}>
              {alertSent ? 'Reset SOS' : 'Cancel SOS'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.quickActionsGrid}>
        <TouchableOpacity style={styles.gridActionButton} onPress={callEmergencyContact}>
          <Text style={styles.gridActionText}>📞</Text>
          <Text style={styles.gridActionLabel}>Call Contact</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridActionButton} onPress={openWhatsAppMessage}>
          <Text style={styles.gridActionText}>💬</Text>
          <Text style={styles.gridActionLabel}>WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridActionButton} onPress={openMaps}>
          <Text style={styles.gridActionText}>📍</Text>
          <Text style={styles.gridActionLabel}>Open Maps</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridActionButton}
          onPress={() => callEmergencyNumber('112')}
        >
          <Text style={styles.gridActionText}>🚑</Text>
          <Text style={styles.gridActionLabel}>Emergency</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Emergency Services</Text>

        <TouchableOpacity style={styles.serviceButton} onPress={() => callEmergencyNumber('112')}>
          <Text style={styles.serviceButtonText}>🚔 Call Police - 112</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.serviceButton} onPress={() => callEmergencyNumber('112')}>
          <Text style={styles.serviceButtonText}>🚑 Call Ambulance - 112</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.serviceButton} onPress={() => callEmergencyNumber('112')}>
          <Text style={styles.serviceButtonText}>🚒 Call Fire Service - 112</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  container: {
    backgroundColor: '#0B1220',
    padding: 20,
    paddingTop: 70,
    paddingBottom: 120,
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 25,
  },
  statusBanner: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 25,
  },
  statusSafe: {
    backgroundColor: '#14532D',
  },
  statusDanger: {
    backgroundColor: '#7F1D1D',
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sosButton: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#DC2626',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  sosButtonActive: {
    backgroundColor: '#991B1B',
  },
  sosText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  alertBox: {
    backgroundColor: '#7F1D1D',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  alertTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  countdownText: {
    color: 'white',
    fontSize: 45,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  alertText: {
    color: '#FECACA',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 5,
  },
  cancelButton: {
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  cancelButtonText: {
    color: '#FCA5A5',
    fontSize: 15,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#1F2937',
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  serviceButton: {
    backgroundColor: '#111827',
    padding: 13,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#374151',
  },
  serviceButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mapButton: {
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  mapButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  whatsappButton: {
    backgroundColor: '#16A34A',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  whatsappButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridActionButton: {
    width: '48%',
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  gridActionText: {
    fontSize: 28,
    marginBottom: 6,
  },
  gridActionLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});