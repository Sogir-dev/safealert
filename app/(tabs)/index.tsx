import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
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
  const [smsSending, setSmsSending] = useState(false);
  const isSendingSmsRef = useRef(false);

  const pulseAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      loadSavedData();
      loadUserGreeting();
    }, [])
  );

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

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: sosActive ? 700 : 1400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [sosActive, pulseAnim]);

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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setSosActive(true);
    setAlertSent(false);
    setSmsSent(false);
    setSmsSending(false);
    setCountdown(3);
    setLatitude('');
    setLongitude('');
  }

  function handleSosTap() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function cancelSOS() {
    setSosActive(false);
    setAlertSent(false);
    setSmsSent(false);
    setSmsSending(false);
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
    if (isSendingSmsRef.current) return;
    isSendingSmsRef.current = true;
    setSmsSending(true);

    try {
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
    } finally {
      isSendingSmsRef.current = false;
      setSmsSending(false);
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

  const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.55] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerTextBlock}>
          <Text style={styles.greetingText}>👋 {greeting}</Text>
          <Text style={styles.userNameText}>{userName || 'Welcome'}</Text>
          <Text style={styles.taglineText}>Stay safe. Your emergency tools are ready.</Text>
        </View>

        <View style={styles.headerIconBadge}>
          <Ionicons name="shield-checkmark" size={26} color="#4ADE80" />
        </View>
      </View>

      <View
        style={[
          styles.statusBanner,
          sosActive ? styles.statusDanger : styles.statusSafe,
        ]}
      >
        <Ionicons
          name={sosActive ? 'warning' : 'shield-checkmark-outline'}
          size={18}
          color={sosActive ? '#FCA5A5' : '#4ADE80'}
        />
        <Text
          style={[
            styles.statusText,
            { color: sosActive ? '#FCA5A5' : '#4ADE80' },
          ]}
        >
          {sosActive ? 'EMERGENCY ACTIVE' : 'STATUS: SAFE'}
        </Text>
      </View>

      <View style={styles.sosWrapper}>
        <Animated.View
          style={[
            styles.sosPulseRing,
            { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
          ]}
        />

        <TouchableOpacity
          style={[styles.sosButton, sosActive && styles.sosButtonActive]}
          onPress={sosActive ? undefined : handleSosTap}
          onLongPress={sosActive ? undefined : activateSOS}
          delayLongPress={600}
          activeOpacity={0.85}
        >
          <Ionicons name={sosActive ? 'alert' : 'warning'} size={30} color="white" />
          <Text style={styles.sosText}>{sosActive ? 'ACTIVE' : 'SOS'}</Text>
        </TouchableOpacity>
      </View>

      {!sosActive && <Text style={styles.sosHintText}>Press and hold to activate</Text>}

      {sosActive && (
        <View style={styles.alertBox}>
          <View style={styles.alertTitleRow}>
            <Ionicons
              name={alertSent ? 'checkmark-circle' : 'time'}
              size={20}
              color="#FCA5A5"
            />
            <Text style={styles.alertTitle}>
              {alertSent ? 'Alert Sent Successfully' : 'Emergency Mode Activated'}
            </Text>
          </View>

          {!alertSent ? (
            <>
              <Text style={styles.countdownText}>{countdown}</Text>
              <Text style={styles.alertText}>Sending alert in {countdown} seconds...</Text>
            </>
          ) : (
            <>
              <Text style={styles.alertText}>
                {smsSending
                  ? 'Sending SMS alert...'
                  : smsSent
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
                <Ionicons name="map-outline" size={16} color="white" />
                <Text style={styles.mapButtonText}>Open Location in Maps</Text>
              </TouchableOpacity>

              {!smsSent && !smsSending && (
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={triggerEmergencyAlert}
                >
                  <Ionicons name="refresh" size={16} color="white" />
                  <Text style={styles.mapButtonText}>Retry SMS Alert</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsAppMessage}>
                <Ionicons name="logo-whatsapp" size={16} color="white" />
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
          <View style={[styles.gridIconBadge, { backgroundColor: 'rgba(96, 165, 250, 0.15)' }]}>
            <Ionicons name="call" size={20} color="#60A5FA" />
          </View>
          <Text style={styles.gridActionLabel}>Call Contact</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridActionButton} onPress={openWhatsAppMessage}>
          <View style={[styles.gridIconBadge, { backgroundColor: 'rgba(37, 211, 102, 0.15)' }]}>
            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
          </View>
          <Text style={styles.gridActionLabel}>WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridActionButton} onPress={openMaps}>
          <View style={[styles.gridIconBadge, { backgroundColor: 'rgba(251, 191, 36, 0.15)' }]}>
            <Ionicons name="location" size={20} color="#FBBF24" />
          </View>
          <Text style={styles.gridActionLabel}>Open Maps</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridActionButton}
          onPress={() => callEmergencyNumber('112')}
        >
          <View style={[styles.gridIconBadge, { backgroundColor: 'rgba(248, 113, 113, 0.15)' }]}>
            <Ionicons name="medkit" size={20} color="#F87171" />
          </View>
          <Text style={styles.gridActionLabel}>Emergency</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeaderRow}>
          <View style={[styles.sectionIconBadge, { backgroundColor: 'rgba(248, 113, 113, 0.15)' }]}>
            <Ionicons name="call-outline" size={18} color="#F87171" />
          </View>
          <Text style={styles.cardTitle}>Emergency Services</Text>
        </View>

        <TouchableOpacity style={styles.serviceButton} onPress={() => callEmergencyNumber('112')}>
          <Ionicons name="shield-outline" size={18} color="#60A5FA" />
          <Text style={styles.serviceButtonText}>Call Police - 112</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.serviceButton} onPress={() => callEmergencyNumber('112')}>
          <Ionicons name="medkit-outline" size={18} color="#F87171" />
          <Text style={styles.serviceButtonText}>Call Ambulance - 112</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.serviceButton} onPress={() => callEmergencyNumber('112')}>
          <Ionicons name="flame-outline" size={18} color="#FBBF24" />
          <Text style={styles.serviceButtonText}>Call Fire Service - 112</Text>
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
    paddingTop: 60,
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  headerTextBlock: {
    flex: 1,
    paddingRight: 12,
  },
  greetingText: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
  },
  userNameText: {
    color: '#60A5FA',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  taglineText: {
    color: '#9CA3AF',
    marginTop: 8,
    fontSize: 14,
  },
  headerIconBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 28,
    borderWidth: 1,
  },
  statusSafe: {
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    borderColor: 'rgba(22, 163, 74, 0.35)',
  },
  statusDanger: {
    backgroundColor: 'rgba(220, 38, 38, 0.12)',
    borderColor: 'rgba(220, 38, 38, 0.35)',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.4,
  },
  sosWrapper: {
    width: 170,
    height: 170,
    alignSelf: 'center',
    marginBottom: 28,
  },
  sosPulseRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#DC2626',
  },
  sosButton: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  sosButtonActive: {
    backgroundColor: '#991B1B',
  },
  sosHintText: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
    marginTop: -18,
    marginBottom: 20,
  },
  sosText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 6,
  },
  alertBox: {
    backgroundColor: '#2A1418',
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.35)',
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  alertTitle: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  countdownText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  alertText: {
    color: '#FECACA',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 5,
  },
  cancelButton: {
    backgroundColor: '#161F2E',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  cancelButtonText: {
    color: '#FCA5A5',
    fontSize: 15,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#161F2E',
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  sectionIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
  serviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0F172A',
    padding: 13,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  serviceButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  mapButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  mapButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  whatsappButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#16A34A',
    padding: 12,
    borderRadius: 10,
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
    backgroundColor: '#161F2E',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  gridIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gridActionLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
