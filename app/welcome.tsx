import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🆘</Text>
      <Text style={styles.title}>SafeAlert</Text>
      <Text style={styles.subtitle}>Emergency help, one tap away.</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/register')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.loginText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220', alignItems: 'center', justifyContent: 'center', padding: 25 },
  logo: { fontSize: 80 },
  title: { color: 'white', fontSize: 42, fontWeight: 'bold', marginTop: 10 },
  subtitle: { color: '#D1D5DB', fontSize: 18, textAlign: 'center', marginTop: 8, marginBottom: 35 },
  button: { backgroundColor: '#DC2626', padding: 15, borderRadius: 12, width: '100%', alignItems: 'center', marginBottom: 18 },
  buttonText: { color: 'white', fontSize: 17, fontWeight: 'bold' },
  loginText: { color: '#60A5FA', fontSize: 15, fontWeight: 'bold' },
});