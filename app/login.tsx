import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { hashWithSalt } from '@/utils/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const passwordRef = useRef<TextInput>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function login() {
    const savedUser = await AsyncStorage.getItem('safealertUser');

    if (!savedUser) {
      Alert.alert('No Account Found', 'Please create an account first.');
      return;
    }

    const user = JSON.parse(savedUser);
    const enteredHash = hashWithSalt(password, user.passwordSalt);

    if (
      email.trim().toLowerCase() === user.email.trim().toLowerCase() &&
      enteredHash === user.passwordHash
    ) {
      await AsyncStorage.setItem('isLoggedIn', 'true');
      router.replace('/(tabs)');
    } else {
      Alert.alert('Login Failed', 'Email or password is incorrect.');
    }
  }

  return (
    <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#0B1220' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
        <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        >
        <Text style={styles.title}>Welcome Back</Text>

       <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            />

       <View style={styles.passwordContainer}>
        <TextInput
            ref={passwordRef}
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            returnKeyType="done"
            onSubmitEditing={login}
        />

        <TouchableOpacity
        onPress={() => setShowPassword(!showPassword)}
        style={{ padding: 8 }}
        >
            <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={24}
            color="#9CA3AF"
            />
        </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={login}>
            <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/forgot-password')}>
            <Text style={styles.link}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={styles.link}>
            Don&apos;t have an account? Register
            </Text>
        </TouchableOpacity>
        </ScrollView>
    </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220', justifyContent: 'center', padding: 25 },
  title: { color: 'white', fontSize: 34, fontWeight: 'bold', textAlign: 'center', marginBottom: 25 },
  input: { backgroundColor: '#111827', color: 'white', padding: 14, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#374151' },
  button: { backgroundColor: '#DC2626', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontSize: 17, fontWeight: 'bold' },
  link: { color: '#60A5FA', textAlign: 'center', marginTop: 18, fontWeight: 'bold' },

  passwordContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#111827',
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#374151',
  paddingHorizontal: 12,
  marginBottom: 12,
},

passwordInput: {
  flex: 1,
  color: 'white',
  paddingVertical: 13,
  fontSize: 15,
},
});
