import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type HistoryItem = {
  contact: string;
  latitude: string;
  longitude: string;
  time: string;
};

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  async function loadHistory() {
    const savedHistory = await AsyncStorage.getItem('emergencyHistory');

    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }

  async function clearHistory() {
    await AsyncStorage.removeItem('emergencyHistory');
    setHistory([]);
  }

  function confirmClearHistory() {
    Alert.alert(
      'Clear History',
      'This will permanently delete all recorded emergency alerts.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearHistory },
      ]
    );
  }

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerTextBlock}>
          <Text style={styles.title}>Emergency History</Text>
          <Text style={styles.subtitle}>
            {history.length > 0
              ? `${history.length} alert${history.length > 1 ? 's' : ''} recorded`
              : 'A record of every SOS alert you send'}
          </Text>
        </View>

        <View style={styles.headerIconBadge}>
          <Ionicons name="time-outline" size={24} color="#F87171" />
        </View>
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBadge}>
            <Ionicons name="shield-checkmark-outline" size={30} color="#4ADE80" />
          </View>
          <Text style={styles.emptyTitle}>No Emergency History</Text>
          <Text style={styles.emptyText}>
            Your SOS alerts will show up here whenever you trigger an emergency.
          </Text>
        </View>
      ) : (
        <>
          <TouchableOpacity style={styles.clearButton} onPress={confirmClearHistory}>
            <Ionicons name="trash-outline" size={16} color="#FCA5A5" />
            <Text style={styles.clearButtonText}>Clear History</Text>
          </TouchableOpacity>

          {history.map((item, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardIconBadge}>
                  <Ionicons name="alert-circle" size={18} color="#F87171" />
                </View>

                <View style={styles.cardHeaderTextBlock}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle}>Alert Sent</Text>
                    {index === 0 && (
                      <View style={styles.latestBadge}>
                        <Text style={styles.latestBadgeText}>Latest</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardTime}>{item.time}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={15} color="#9CA3AF" />
                <Text style={styles.infoRowText}>{item.contact}</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={15} color="#9CA3AF" />
                <Text style={styles.infoRowText}>
                  {item.latitude}, {item.longitude}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.mapButton}
                onPress={() =>
                  Linking.openURL(
                    `https://maps.google.com/?q=${item.latitude},${item.longitude}`
                  )
                }
              >
                <Ionicons name="map-outline" size={16} color="white" />
                <Text style={styles.mapButtonText}>Open in Maps</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}
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
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    backgroundColor: '#161F2E',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  clearButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(220, 38, 38, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.35)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  clearButtonText: {
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
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  cardIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderTextBlock: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
  cardTime: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 2,
  },
  latestBadge: {
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  latestBadgeText: {
    color: '#4ADE80',
    fontSize: 11,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 8,
  },
  infoRowText: {
    color: '#D1D5DB',
    fontSize: 15,
    flexShrink: 1,
  },
  mapButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
  },
  mapButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
