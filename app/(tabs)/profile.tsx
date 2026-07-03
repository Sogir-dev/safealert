import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { generateSalt, hashWithSalt } from '@/utils/auth';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function CollapsibleSection({
  icon,
  color,
  title,
  subtitle,
  expanded,
  onToggle,
  children,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  title: string;
  subtitle?: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.sectionHeaderRow}
        activeOpacity={0.7}
        onPress={onToggle}
      >
        <View style={styles.sectionHeaderLeft}>
          <View style={[styles.sectionIconBadge, { backgroundColor: `${color}26` }]}>
            <Ionicons name={icon} size={18} color={color} />
          </View>
          <View style={styles.sectionHeaderTextWrap}>
            <Text style={styles.cardTitle}>{title}</Text>
            {!expanded && subtitle ? (
              <Text style={styles.cardSubtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#6B7280"
        />
      </TouchableOpacity>

      {expanded && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
}

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

  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    password: false,
    contact: false,
    medical: false,
    trusted: false,
  });

  function toggleSection(key: keyof typeof expandedSections) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Haptics.selectionAsync();
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

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

          if (hashWithSalt(currentPassword, user.passwordSalt) !== user.passwordHash) {
            Alert.alert('Incorrect Password', 'Your current password is incorrect.');
            return;
          }

          const passwordSalt = generateSalt();
          const passwordHash = hashWithSalt(newPassword, passwordSalt);

          const updatedUser = {
            ...user,
            passwordSalt,
            passwordHash,
          };

          await AsyncStorage.setItem('safealertUser', JSON.stringify(updatedUser));

          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');

          Alert.alert('Password Updated', 'Your password has been changed successfully.');
        }

  const displayName = profileName || savedFullName || 'Your Name';
  const initial = displayName.trim().charAt(0).toUpperCase() || 'U';

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroBanner} />

      <View style={styles.photoSection}>
        {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
            <View style={styles.profilePlaceholder}>
            <Text style={styles.profilePlaceholderText}>{initial}</Text>
            </View>
        )}

        <Text style={styles.displayName}>{displayName}</Text>
        {profileEmail !== '' && (
          <Text style={styles.displayEmail}>{profileEmail}</Text>
        )}

        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusPillText}>SafeAlert Protected</Text>
        </View>

        <View style={styles.photoButtonRow}>
            <TouchableOpacity style={styles.photoActionButton} onPress={pickProfileImage}>
                <Ionicons name="camera-outline" size={16} color="#60A5FA" />
                <Text style={styles.photoActionButtonText}>
                {profileImage ? 'Change Photo' : 'Add Photo'}
                </Text>
            </TouchableOpacity>

            {profileImage !== '' && (
                <TouchableOpacity
                    style={[styles.photoActionButton, styles.photoActionButtonDanger]}
                    onPress={async () => {
                    await AsyncStorage.removeItem('profileImage');
                    setProfileImage('');
                    }}
                >
                    <Ionicons name="trash-outline" size={16} color="#FCA5A5" />
                    <Text style={[styles.photoActionButtonText, styles.photoActionButtonTextDanger]}>
                    Remove
                    </Text>
                </TouchableOpacity>
                )}
        </View>
        </View>

        <CollapsibleSection
          icon="person-outline"
          color="#60A5FA"
          title="Personal Information"
          subtitle={profileEmail || profilePhone || undefined}
          expanded={expandedSections.personal}
          onToggle={() => toggleSection('personal')}
        >
          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor="#6B7280"
            value={profileName}
            onChangeText={setProfileName}
            returnKeyType="next"
          />

          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#6B7280"
            value={profileEmail}
            onChangeText={setProfileEmail}
            keyboardType="email-address"
            returnKeyType="next"
          />

          <TextInput
            style={styles.input}
            placeholder="Phone number"
            placeholderTextColor="#6B7280"
            value={profilePhone}
            onChangeText={setProfilePhone}
            keyboardType="phone-pad"
            returnKeyType="done"
            onSubmitEditing={updateUserProfile}
          />

          <TouchableOpacity style={styles.saveButton} onPress={updateUserProfile}>
            <Text style={styles.saveButtonText}>Update Profile</Text>
          </TouchableOpacity>
        </CollapsibleSection>

        <CollapsibleSection
          icon="lock-closed-outline"
          color="#A78BFA"
          title="Change Password"
          expanded={expandedSections.password}
          onToggle={() => toggleSection('password')}
        >
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Current password"
              placeholderTextColor="#6B7280"
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
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="New password"
              placeholderTextColor="#6B7280"
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
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm new password"
              placeholderTextColor="#6B7280"
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
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={changePassword}>
            <Text style={styles.saveButtonText}>Update Password</Text>
          </TouchableOpacity>
        </CollapsibleSection>

      <CollapsibleSection
        icon="call-outline"
        color="#F87171"
        title="Emergency Contact"
        subtitle={contact.name ? `${contact.name} • ${contact.phone}` : undefined}
        expanded={expandedSections.contact}
        onToggle={() => toggleSection('contact')}
      >
        {contact.name === '' ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Contact name"
              placeholderTextColor="#6B7280"
              value={contactName}
              onChangeText={setContactName}
              returnKeyType="next"
              onSubmitEditing={() => contactPhoneRef.current?.focus()}
            />

            <TextInput
              ref={contactPhoneRef}
              style={styles.input}
              placeholder="Phone number"
              placeholderTextColor="#6B7280"
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
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={16} color="#9CA3AF" />
              <Text style={styles.infoRowText}>{contact.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={16} color="#9CA3AF" />
              <Text style={styles.infoRowText}>{contact.phone}</Text>
            </View>

            <TouchableOpacity style={styles.editButton} onPress={editContact}>
              <Ionicons name="create-outline" size={16} color="white" />
              <Text style={styles.editButtonText}>Edit Contact</Text>
            </TouchableOpacity>
          </>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        icon="medkit-outline"
        color="#FBBF24"
        title="Medical Information"
        subtitle={
          medicalInfo.bloodGroup
            ? `${medicalInfo.bloodGroup} • ${medicalInfo.allergies}`
            : undefined
        }
        expanded={expandedSections.medical}
        onToggle={() => toggleSection('medical')}
      >
        {medicalInfo.bloodGroup === '' ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Blood group e.g. O+"
              placeholderTextColor="#6B7280"
              value={bloodGroup}
              onChangeText={setBloodGroup}
              returnKeyType="next"
              onSubmitEditing={() => allergiesRef.current?.focus()}
            />

            <TextInput
              ref={allergiesRef}
              style={styles.input}
              placeholder="Allergies"
              placeholderTextColor="#6B7280"
              value={allergies}
              onChangeText={setAllergies}
              returnKeyType="next"
              onSubmitEditing={() => conditionRef.current?.focus()}
            />

            <TextInput
              ref={conditionRef}
              style={styles.input}
              placeholder="Medical condition"
              placeholderTextColor="#6B7280"
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
            <View style={styles.infoRow}>
              <Ionicons name="water-outline" size={16} color="#9CA3AF" />
              <Text style={styles.infoRowText}>Blood Group: {medicalInfo.bloodGroup}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="alert-circle-outline" size={16} color="#9CA3AF" />
              <Text style={styles.infoRowText}>Allergies: {medicalInfo.allergies}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="pulse-outline" size={16} color="#9CA3AF" />
              <Text style={styles.infoRowText}>Condition: {medicalInfo.condition}</Text>
            </View>

            <TouchableOpacity style={styles.editButton} onPress={editMedicalInfo}>
              <Ionicons name="create-outline" size={16} color="white" />
              <Text style={styles.editButtonText}>Edit Medical Info</Text>
            </TouchableOpacity>
          </>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        icon="people-outline"
        color="#34D399"
        title="Trusted Contacts"
        subtitle={
          trustedContacts.length > 0
            ? `${trustedContacts.length} contact${trustedContacts.length > 1 ? 's' : ''} saved`
            : undefined
        }
        expanded={expandedSections.trusted}
        onToggle={() => toggleSection('trusted')}
      >
        <TextInput
          style={styles.input}
          placeholder="Contact Name"
          placeholderTextColor="#6B7280"
          value={trustedName}
          onChangeText={setTrustedName}
          returnKeyType="next"
          onSubmitEditing={() => trustedPhoneRef.current?.focus()}
        />

        <TextInput
          ref={trustedPhoneRef}
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="#6B7280"
          keyboardType="phone-pad"
          value={trustedPhone}
          onChangeText={setTrustedPhone}
          returnKeyType="done"
          onSubmitEditing={addTrustedContact}
        />

        <TouchableOpacity style={styles.saveButton} onPress={addTrustedContact}>
          <Text style={styles.saveButtonText}>Add Trusted Contact</Text>
        </TouchableOpacity>

        {trustedContacts.length > 0 && (
          <View style={styles.contactList}>
            {trustedContacts.map((item, index) => (
              <View key={index} style={styles.contactRow}>
                <View style={styles.contactAvatar}>
                  <Text style={styles.contactAvatarText}>
                    {item.name.trim().charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>

                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  <Text style={styles.contactPhone}>{item.phone}</Text>
                </View>

                <TouchableOpacity
                  style={styles.contactDeleteButton}
                  onPress={() => deleteTrustedContact(index)}
                >
                  <Ionicons name="trash-outline" size={18} color="#F87171" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </CollapsibleSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  container: {
    paddingBottom: 120,
  },
  heroBanner: {
    height: 130,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  photoSection: {
    alignItems: 'center',
    marginTop: -60,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  profileImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: '#0B1220',
  },
  profilePlaceholder: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#0B1220',
  },
  profilePlaceholderText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
  },
  displayName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 14,
    textAlign: 'center',
  },
  displayEmail: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  statusPillText: {
    color: '#4ADE80',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  photoButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  photoActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  photoActionButtonDanger: {
    borderColor: 'rgba(220, 38, 38, 0.4)',
  },
  photoActionButtonText: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: 'bold',
  },
  photoActionButtonTextDanger: {
    color: '#FCA5A5',
  },
  card: {
    backgroundColor: '#161F2E',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
  },
  sectionHeaderTextWrap: {
    flexShrink: 1,
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
  cardSubtitle: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 2,
  },
  sectionBody: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
    paddingTop: 16,
  },
  cardText: {
    color: '#D1D5DB',
    fontSize: 15,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0F172A',
    color: 'white',
    padding: 13,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2D3748',
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
  },
  editButtonText: {
    color: 'white',
    fontSize: 15,
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
  contactList: {
    marginTop: 14,
    gap: 10,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 10,
    gap: 12,
  },
  contactAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#134E4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAvatarText: {
    color: '#5EEAD4',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  contactPhone: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 2,
  },
  contactDeleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
  },

  passwordContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#0F172A',
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#2D3748',
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
