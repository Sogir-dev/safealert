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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  async function resetPassword() {
    if (!email || !newPassword || !confirmPassword) {
      Alert.alert('Missing Information', 'Please fill all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    const savedUser = await AsyncStorage.getItem('safealertUser');

    if (!savedUser) {
      Alert.alert('No Account Found', 'Please create an account first.');
      return;
    }

    const user = JSON.parse(savedUser);

    if (email !== user.email) {
      Alert.alert('Account Not Found', 'No account found with this email.');
      return;
    }

    const updatedUser = {
      ...user,
      password: newPassword,
    };

    await AsyncStorage.setItem('safealertUser', JSON.stringify(updatedUser));

    Alert.alert('Password Reset', 'Your password has been reset successfully.');
    router.replace('/login');
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
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your email and create a new password.</Text>

        <TextInput
          style={styles.input}
          placeholder="Registered email"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          returnKeyType="next"
          onSubmitEditing={() => newPasswordRef.current?.focus()}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            ref={newPasswordRef}
            style={styles.passwordInput}
            placeholder="New password"
            placeholderTextColor="#9CA3AF"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          />

          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowNewPassword(!showNewPassword)}
          >
            <Ionicons
              name={showNewPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordContainer}>
          <TextInput
            ref={confirmPasswordRef}
            style={styles.passwordInput}
            placeholder="Confirm new password"
            placeholderTextColor="#9CA3AF"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            returnKeyType="done"
            onSubmitEditing={resetPassword}
          />

          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-off' : 'eye'}
              size={24}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={resetPassword}>
          <Text style={styles.buttonText}>Reset Password</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={styles.link}>Back to Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0B1220',
    justifyContent: 'center',
    padding: 25,
  },
  title: {
    color: 'white',
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#D1D5DB',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 25,
  },
  input: {
    backgroundColor: '#111827',
    color: 'white',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
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
  eyeButton: {
    padding: 8,
  },
  button: {
    backgroundColor: '#DC2626',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
  },
  link: {
    color: '#60A5FA',
    textAlign: 'center',
    marginTop: 18,
    fontWeight: 'bold',
  },
});