import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const [contactName, setContactName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contact, setContact] = useState({ name: '', phone: '' });
  const [fullName, setFullName] = useState('');
  const [savedFullName, setSavedFullName] = useState('');

  const [profileName, setProfileName] = useState('');
const [profileEmail, setProfileEmail] = useState('');
const [profilePhone, setProfilePhone] = useState('');

  const fullNameRef = useRef<TextInput>(null);

const contactPhoneRef = useRef<TextInput>(null);

const allergiesRef = useRef<TextInput>(null);
const conditionRef = useRef<TextInput>(null);

const trustedPhoneRef = useRef<TextInput>(null);
const [currentPassword, setCurrentPassword] = useState('');
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');

const [showCurrentPassword, setShowCurrentPassword] = useState(false);
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  

  const [bloodGroup, setBloodGroup] = useState('');
  const [allergies, setAllergies] = useState('');
  const [condition, setCondition] = useState('');
  const [medicalInfo, setMedicalInfo] = useState({
    bloodGroup: '',
    allergies: '',
    condition: '',
  });

  const [trustedName, setTrustedName] = useState('');
  const [trustedPhone, setTrustedPhone] = useState('');
  const [trustedContacts, setTrustedContacts] = useState<
    { name: string; phone: string }[]
  >([]);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [])
  );

  async function loadProfileData() {
    const savedContact = await AsyncStorage.getItem('emergencyContact');
    const savedMedicalInfo = await AsyncStorage.getItem('medicalInfo');
    const savedTrustedContacts = await AsyncStorage.getItem('trustedContacts');
    const savedName = await AsyncStorage.getItem('fullName');

    if (savedName) {
    setSavedFullName(savedName);
    }

    const savedUserProfile = await AsyncStorage.getItem('userProfile');

    if (savedUserProfile) {
      const profile = JSON.parse(savedUserProfile);
      setProfileName(profile.fullName || '');
      setProfileEmail(profile.email || '');
      setProfilePhone(profile.phone || '');
    }
    

    const savedProfileImage = await AsyncStorage.getItem('profileImage');

    if (savedProfileImage) {
    setProfileImage(savedProfileImage);
    }

    if (savedContact) setContact(JSON.parse(savedContact));
    if (savedMedicalInfo) setMedicalInfo(JSON.parse(savedMedicalInfo));
    if (savedTrustedContacts) setTrustedContacts(JSON.parse(savedTrustedContacts));
  }

  async function saveContact() {
    if (contactName.trim() === '' || contactPhone.trim() === '') {
      Alert.alert('Missing Information', 'Please enter contact name and phone number.');
      return;
    }

    const newContact = { name: contactName, phone: contactPhone };
    await AsyncStorage.setItem('emergencyContact', JSON.stringify(newContact));

    setContact(newContact);
    setContactName('');
    setContactPhone('');
    Alert.alert('Saved', 'Emergency contact saved.');
  }

  async function editContact() {
    await AsyncStorage.removeItem('emergencyContact');
    setContact({ name: '', phone: '' });
  }

  async function saveMedicalInfo() {
    if (bloodGroup.trim() === '' || allergies.trim() === '' || condition.trim() === '') {
      Alert.alert('Missing Information', 'Please fill all medical information.');
      return;
    }

    const newMedicalInfo = { bloodGroup, allergies, condition };
    await AsyncStorage.setItem('medicalInfo', JSON.stringify(newMedicalInfo));

    setMedicalInfo(newMedicalInfo);
    setBloodGroup('');
    setAllergies('');
    setCondition('');
    Alert.alert('Saved', 'Medical information saved.');
  }

  async function editMedicalInfo() {
    await AsyncStorage.removeItem('medicalInfo');
    setMedicalInfo({ bloodGroup: '', allergies: '', condition: '' });
  }

  async function addTrustedContact() {
    if (trustedName.trim() === '' || trustedPhone.trim() === '') {
      Alert.alert('Missing Information', 'Please enter name and phone number.');
      return;
    }

    const newContact = {
      name: trustedName,
      phone: trustedPhone,
    };

    const updatedContacts = [...trustedContacts, newContact];

    setTrustedContacts(updatedContacts);

    await AsyncStorage.setItem(
      'trustedContacts',
      JSON.stringify(updatedContacts)
    );

    setTrustedName('');
    setTrustedPhone('');

    Alert.alert('Success', 'Trusted contact added.');
  }

  async function deleteTrustedContact(index: number) {
    const updatedContacts = trustedContacts.filter((_, i) => i !== index);

    setTrustedContacts(updatedContacts);

    await AsyncStorage.setItem(
      'trustedContacts',
      JSON.stringify(updatedContacts)
    );
  }

  async function pickProfileImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
    });

    if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);
        await AsyncStorage.setItem('profileImage', imageUri);
    }
    }

    async function saveFullName() {
        if (fullName.trim() === '') {
            Alert.alert('Missing Information', 'Please enter your full name.');
            return;
        }

        await AsyncStorage.setItem('fullName', fullName);
        setSavedFullName(fullName);
        setFullName('');

        Alert.alert('Saved', 'Full name saved.');
        }

        async function editFullName() {
        await AsyncStorage.removeItem('fullName');
        setSavedFullName('');
        }

        async function updateUserProfile() {
          if (
            profileName.trim() === '' ||
            profileEmail.trim() === '' ||
            profilePhone.trim() === ''
          ) {
            Alert.alert('Missing Information', 'Please fill all profile fields.');
            return;
          }

          const updatedProfile = {
            fullName: profileName,
            email: profileEmail,
            phone: profilePhone,
          };

          await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
          await AsyncStorage.setItem('fullName', profileName);

          const savedUser = await AsyncStorage.getItem('safealertUser');

          if (savedUser) {
            const user = JSON.parse(savedUser);

            const updatedUser = {
              ...user,
              fullName: profileName,
              email: profileEmail,
              phone: profilePhone,
            };

            await AsyncStorage.setItem('safealertUser', JSON.stringify(updatedUser));
          }

          setSavedFullName(profileName);

          Alert.alert('Profile Updated', 'Your profile information has been updated.');
        }

        async function changePassword() {
          if (
            currentPassword.trim() === '' ||
            newPassword.trim() === '' ||
            confirmPassword.trim() === ''
          ) {
            Alert.alert('Missing Information', 'Please fill all password fields.');
            return;
          }

          if (newPassword !== confirmPassword) {
            Alert.alert('Password Mismatch', 'New password and confirm password do not match.');
            return;
          }

          const savedUser = await AsyncStorage.getItem('safealertUser');

          if (!savedUser) {
            Alert.alert('No Account Found', 'Please register again.');
            return;
          }

          const user = JSON.parse(savedUser);

          if (currentPassword !== user.password) {
            Alert.alert('Incorrect Password', 'Your current password is incorrect.');
            return;
          }

          const updatedUser = {
            ...user,
            password: newPassword,
          };

          await AsyncStorage.setItem('safealertUser', JSON.stringify(updatedUser));

          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');

          Alert.alert('Password Updated', 'Your password has been changed successfully.');
        }

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Manage your emergency profile.</Text>

      <View style={styles.photoSection}>
        {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
            <View style={styles.profilePlaceholder}>
            <Text style={styles.profilePlaceholderText}>👤</Text>
            </View>
        )}

        <TouchableOpacity style={styles.saveButton} onPress={pickProfileImage}>
            <Text style={styles.saveButtonText}>
            {profileImage ? 'Change Photo' : 'Choose Photo'}
            </Text>
        </TouchableOpacity>

        {profileImage !== '' && (
            <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={async () => {
                await AsyncStorage.removeItem('profileImage');
                setProfileImage('');
                }}
            >
                <Text style={styles.removePhotoButtonText}>
                Remove Photo
                </Text>
            </TouchableOpacity>
            )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>

          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor="#9CA3AF"
            value={profileName}
            onChangeText={setProfileName}
            returnKeyType="next"
          />

          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#9CA3AF"
            value={profileEmail}
            onChangeText={setProfileEmail}
            keyboardType="email-address"
            returnKeyType="next"
          />

          <TextInput
            style={styles.input}
            placeholder="Phone number"
            placeholderTextColor="#9CA3AF"
            value={profilePhone}
            onChangeText={setProfilePhone}
            keyboardType="phone-pad"
            returnKeyType="done"
            onSubmitEditing={updateUserProfile}
          />

          <TouchableOpacity style={styles.saveButton} onPress={updateUserProfile}>
            <Text style={styles.saveButtonText}>Update Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Change Password</Text>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Current password"
              placeholderTextColor="#9CA3AF"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrentPassword}
              returnKeyType="next"
            />

            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              <Ionicons
                name={showCurrentPassword ? 'eye-off' : 'eye'}
                size={24}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="New password"
              placeholderTextColor="#9CA3AF"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              returnKeyType="next"
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
              style={styles.passwordInput}
              placeholder="Confirm new password"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              returnKeyType="done"
              onSubmitEditing={changePassword}
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

          <TouchableOpacity style={styles.saveButton} onPress={changePassword}>
            <Text style={styles.saveButtonText}>Update Password</Text>
          </TouchableOpacity>
        </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Emergency Contact</Text>

        {contact.name === '' ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Contact name"
              placeholderTextColor="#9CA3AF"
              value={contactName}
              onChangeText={setContactName}
              returnKeyType="next"
              onSubmitEditing={() => contactPhoneRef.current?.focus()}
            />

            <TextInput
              ref={contactPhoneRef}
              style={styles.input}
              placeholder="Phone number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={contactPhone}
              onChangeText={setContactPhone}
              returnKeyType="done"
              onSubmitEditing={saveContact}
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveContact}>
              <Text style={styles.saveButtonText}>Save Contact</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.cardText}>Name: {contact.name}</Text>
            <Text style={styles.cardText}>Phone: {contact.phone}</Text>

            <TouchableOpacity style={styles.editButton} onPress={editContact}>
              <Text style={styles.editButtonText}>Edit Contact</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Medical Information</Text>

        {medicalInfo.bloodGroup === '' ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Blood group e.g. O+"
              placeholderTextColor="#9CA3AF"
              value={bloodGroup}
              onChangeText={setBloodGroup}
              returnKeyType="next"
              onSubmitEditing={() => allergiesRef.current?.focus()}
            />

            <TextInput
              ref={allergiesRef}
              style={styles.input}
              placeholder="Allergies"
              placeholderTextColor="#9CA3AF"
              value={allergies}
              onChangeText={setAllergies}
              returnKeyType="next"
              onSubmitEditing={() => conditionRef.current?.focus()}
            />

            <TextInput
              ref={conditionRef}
              style={styles.input}
              placeholder="Medical condition"
              placeholderTextColor="#9CA3AF"
              value={condition}
              onChangeText={setCondition}
              returnKeyType="done"
              onSubmitEditing={saveMedicalInfo}
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveMedicalInfo}>
              <Text style={styles.saveButtonText}>Save Medical Info</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.cardText}>Blood Group: {medicalInfo.bloodGroup}</Text>
            <Text style={styles.cardText}>Allergies: {medicalInfo.allergies}</Text>
            <Text style={styles.cardText}>Condition: {medicalInfo.condition}</Text>

            <TouchableOpacity style={styles.editButton} onPress={editMedicalInfo}>
              <Text style={styles.editButtonText}>Edit Medical Info</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Trusted Contacts</Text>

        <TextInput
          style={styles.input}
          placeholder="Contact Name"
          placeholderTextColor="#9CA3AF"
          value={trustedName}
          onChangeText={setTrustedName}
          returnKeyType="next"
          onSubmitEditing={() => trustedPhoneRef.current?.focus()}
        />

        <TextInput
          ref={trustedPhoneRef}
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          value={trustedPhone}
          onChangeText={setTrustedPhone}
          returnKeyType="done"
          onSubmitEditing={addTrustedContact}
        />

        <TouchableOpacity style={styles.saveButton} onPress={addTrustedContact}>
          <Text style={styles.saveButtonText}>Add Trusted Contact</Text>
        </TouchableOpacity>

        {trustedContacts.map((item, index) => (
          <View key={index} style={styles.trustedContactItem}>
            <Text style={styles.cardText}>
              {item.name} - {item.phone}
            </Text>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteTrustedContact(index)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
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
    padding: 20,
    paddingTop: 80,
    paddingBottom: 120,
  },
  title: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#D1D5DB',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
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
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#111827',
    color: 'white',
    padding: 13,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#374151',
  },
  saveButton: {
    backgroundColor: '#16A34A',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  editButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  trustedContactItem: {
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: '#DC2626',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  photoSection: {
  alignItems: 'center',
  marginBottom: 25,
},

profileImage: {
  width: 120,
  height: 120,
  borderRadius: 60,
  marginBottom: 12,
},

profilePlaceholder: {
  width: 120,
  height: 120,
  borderRadius: 60,
  backgroundColor: '#1F2937',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 12,
},

profilePlaceholderText: {
  fontSize: 50,
},

removePhotoButton: {
  backgroundColor: '#DC2626',
  padding: 12,
  borderRadius: 10,
  alignItems: 'center',
  marginTop: 10,
  width: 160,
},

removePhotoButtonText: {
  color: 'white',
  fontSize: 15,
  fontWeight: 'bold',
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
});