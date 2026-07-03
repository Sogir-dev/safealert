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
import { generateSalt, hashWithSalt } from '@/utils/auth';

type Step = 'email' | 'question' | 'reset';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  async function verifyEmail() {
    if (!email) {
      Alert.alert('Missing Information', 'Please enter your registered email.');
      return;
    }

    const savedUser = await AsyncStorage.getItem('safealertUser');

    if (!savedUser) {
      Alert.alert('No Account Found', 'Please create an account first.');
      return;
    }

    const user = JSON.parse(savedUser);

    if (email.trim().toLowerCase() !== user.email.trim().toLowerCase()) {
      Alert.alert('Account Not Found', 'No account found with this email.');
      return;
    }

    setSecurityQuestion(user.securityQuestion);
    setStep('question');
  }

  async function verifySecurityAnswer() {
    if (!securityAnswer.trim()) {
      Alert.alert('Missing Information', 'Please answer the security question.');
      return;
    }

    const savedUser = await AsyncStorage.getItem('safealertUser');
    const user = JSON.parse(savedUser!);

    const enteredHash = hashWithSalt(
      securityAnswer.trim().toLowerCase(),
      user.securityAnswerSalt
    );

    if (enteredHash !== user.securityAnswerHash) {
      Alert.alert('Incorrect Answer', 'That answer does not match our records.');
      return;
    }

    setStep('reset');
  }

  async function resetPassword() {
    if (!newPassword || !confirmPassword) {
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

    const passwordSalt = generateSalt();
    const passwordHash = hashWithSalt(newPassword, passwordSalt);

    const updatedUser = {
      ...user,
      passwordSalt,
      passwordHash,
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

        {step === 'email' && (
          <>
            <Text style={styles.subtitle}>Enter your registered email to get started.</Text>

            <TextInput
              style={styles.input}
              placeholder="Registered email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              returnKeyType="done"
              onSubmitEditing={verifyEmail}
            />

            <TouchableOpacity style={styles.button} onPress={verifyEmail}>
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'question' && (
          <>
            <Text style={styles.subtitle}>Answer your security question to verify it&apos;s you.</Text>

            <View style={styles.questionBox}>
              <Ionicons name="help-circle-outline" size={18} color="#60A5FA" />
              <Text style={styles.questionText}>{securityQuestion}</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Your answer"
              placeholderTextColor="#9CA3AF"
              value={securityAnswer}
              onChangeText={setSecurityAnswer}
              returnKeyType="done"
              onSubmitEditing={verifySecurityAnswer}
            />

            <TouchableOpacity style={styles.button} onPress={verifySecurityAnswer}>
              <Text style={styles.buttonText}>Verify</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'reset' && (
          <>
            <Text style={styles.subtitle}>Create a new password for your account.</Text>

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
          </>
        )}

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
  questionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#111827',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#374151',
    padding: 14,
    marginBottom: 12,
  },
  questionText: {
    color: '#D1D5DB',
    fontSize: 15,
    flexShrink: 1,
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
