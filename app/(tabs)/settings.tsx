import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function InfoCard({
  icon,
  color,
  title,
  children,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.sectionHeaderRow}>
        <View style={[styles.sectionIconBadge, { backgroundColor: `${color}26` }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>

      {children}
    </View>
  );
}

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

  function confirmLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('isLoggedIn');
          router.replace('/welcome');
        },
      },
    ]);
  }

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerTextBlock}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage SafeAlert preferences and app data.</Text>
        </View>

        <View style={styles.headerIconBadge}>
          <Ionicons name="settings-outline" size={24} color="#60A5FA" />
        </View>
      </View>

      <InfoCard icon="information-circle-outline" color="#60A5FA" title="About SafeAlert">
        <Text style={styles.cardText}>
          SafeAlert is an emergency SOS app designed to help users quickly alert trusted contacts,
          share live location, and provide medical information during emergencies.
        </Text>
      </InfoCard>

      <InfoCard icon="code-slash-outline" color="#A78BFA" title="App Version">
        <View style={styles.versionRow}>
          <Text style={styles.cardText}>Current version</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionBadgeText}>1.0.0</Text>
          </View>
        </View>
      </InfoCard>

      <InfoCard icon="shield-checkmark-outline" color="#4ADE80" title="Privacy">
        <Text style={styles.cardText}>
          Your emergency contact, medical information, and history are currently stored locally on
          your device using AsyncStorage.
        </Text>
      </InfoCard>

      <InfoCard icon="warning-outline" color="#F87171" title="Danger Zone">
        <TouchableOpacity style={styles.dangerRow} onPress={clearAllData}>
          <View style={styles.dangerRowLeft}>
            <Ionicons name="trash-outline" size={18} color="#F87171" />
            <Text style={styles.dangerRowText}>Clear All App Data</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
        </TouchableOpacity>

        <View style={styles.dangerDivider} />

        <TouchableOpacity style={styles.dangerRow} onPress={confirmLogout}>
          <View style={styles.dangerRowLeft}>
            <Ionicons name="log-out-outline" size={18} color="#F87171" />
            <Text style={styles.dangerRowText}>Logout</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#6B7280" />
        </TouchableOpacity>
      </InfoCard>
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
    paddingTop: 60,
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTextBlock: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 6,
  },
  headerIconBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(96, 165, 250, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
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
  cardText: {
    color: '#D1D5DB',
    fontSize: 15,
    lineHeight: 22,
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  versionBadge: {
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  versionBadgeText: {
    color: '#A78BFA',
    fontSize: 13,
    fontWeight: 'bold',
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  dangerRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dangerRowText: {
    color: '#F87171',
    fontSize: 15,
    fontWeight: 'bold',
  },
  dangerDivider: {
    height: 1,
    backgroundColor: '#1F2937',
  },
});
