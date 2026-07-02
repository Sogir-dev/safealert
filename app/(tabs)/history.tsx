import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
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

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>Emergency History</Text>

      {history.length === 0 ? (
        <Text style={styles.subtitle}>No emergency history yet.</Text>
      ) : (
        <>
          <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
            <Text style={styles.clearButtonText}>Clear History</Text>
          </TouchableOpacity>

          {history.map((item, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>Alert Sent</Text>
              <Text style={styles.cardText}>Contact: {item.contact}</Text>
              <Text style={styles.cardText}>Time: {item.time}</Text>
              <Text style={styles.cardText}>
                Location: {item.latitude}, {item.longitude}
              </Text>

              <TouchableOpacity
                style={styles.mapButton}
                onPress={() =>
                  Linking.openURL(
                    `https://maps.google.com/?q=${item.latitude},${item.longitude}`
                  )
                }
              >
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
    paddingTop: 80,
    paddingBottom: 120,
  },
  title: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    color: '#D1D5DB',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  clearButton: {
    backgroundColor: '#DC2626',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  clearButtonText: {
    color: 'white',
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardText: {
    color: '#D1D5DB',
    fontSize: 15,
    marginBottom: 5,
  },
  mapButton: {
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  mapButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
});