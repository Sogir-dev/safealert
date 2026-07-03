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

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [password, setPassword] = useState('');
  const emailRef = useRef<TextInput>(null);
const phoneRef = useRef<TextInput>(null);
const securityQuestionRef = useRef<TextInput>(null);
const securityAnswerRef = useRef<TextInput>(null);
const passwordRef = useRef<TextInput>(null);
const [showPassword, setShowPassword] = useState(false);

  async function register() {
    if (
      !fullName ||
      !email ||
      !phone ||
      !securityQuestion ||
      !securityAnswer ||
      !password
    ) {
      Alert.alert('Missing Information', 'Please fill all fields.');
      return;
    }

    const passwordSalt = generateSalt();
    const passwordHash = hashWithSalt(password, passwordSalt);

    const securityAnswerSalt = generateSalt();
    const securityAnswerHash = hashWithSalt(
      securityAnswer.trim().toLowerCase(),
      securityAnswerSalt
    );

    const user = {
      fullName,
      email: email.trim(),
      phone,
      passwordSalt,
      passwordHash,
      securityQuestion,
      securityAnswerSalt,
      securityAnswerHash,
    };

    await AsyncStorage.setItem('safealertUser', JSON.stringify(user));
    await AsyncStorage.setItem(
    'userProfile',
    JSON.stringify({
        fullName,
        email: email.trim(),
        phone,
    })
    );

    Alert.alert('Account Created', 'You can now login.');
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
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Full name"
        placeholderTextColor="#9CA3AF"
        value={fullName}
        onChangeText={setFullName}
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
        />

      <TextInput
        ref={emailRef}
        style={styles.input}
        placeholder="Email address"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        returnKeyType="next"
        onSubmitEditing={() => phoneRef.current?.focus()}
        />

      <TextInput
        ref={phoneRef}
        style={styles.input}
        placeholder="Phone number"
        placeholderTextColor="#9CA3AF"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        returnKeyType="next"
        onSubmitEditing={() => securityQuestionRef.current?.focus()}
        />

      <TextInput
        ref={securityQuestionRef}
        style={styles.input}
        placeholder="Security question e.g. First pet's name?"
        placeholderTextColor="#9CA3AF"
        value={securityQuestion}
        onChangeText={setSecurityQuestion}
        returnKeyType="next"
        onSubmitEditing={() => securityAnswerRef.current?.focus()}
        />

      <TextInput
        ref={securityAnswerRef}
        style={styles.input}
        placeholder="Answer to your security question"
        placeholderTextColor="#9CA3AF"
        value={securityAnswer}
        onChangeText={setSecurityAnswer}
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
            onSubmitEditing={register}
        />

        <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
        >
            <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={24}
            color="#9CA3AF"
            />
        </TouchableOpacity>
        </View>

      <Text style={styles.helperText}>
        We&apos;ll use this security question to verify it&apos;s you if you ever need to reset
        your password.
      </Text>

      <TouchableOpacity style={styles.button} onPress={register}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  </KeyboardAvoidingView>
);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1220', justifyContent: 'center', padding: 25 },
  title: { color: 'white', fontSize: 34, fontWeight: 'bold', textAlign: 'center', marginBottom: 25 },
  input: { backgroundColor: '#111827', color: 'white', padding: 14, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#374151' },
  helperText: { color: '#6B7280', fontSize: 12, marginTop: -4, marginBottom: 12, lineHeight: 16 },
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
