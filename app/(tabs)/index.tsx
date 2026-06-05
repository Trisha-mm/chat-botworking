import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { router } from 'expo-router';

const STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
];

const BILL_STAGES = [
  {
    status: 'Introduced',
    color: '#B091A4',
    what: 'A legislator formally proposes the bill. It gets a number and is sent to a committee for review.',
    lobbying: 'Most impactful time to act. Call your rep, attend hearings, and get organizations to weigh in before the committee votes.',
    voting: 'No vote yet, but contact your representative now to shape the bill before it reaches the floor.',
  },
  {
    status: 'Engrossed',
    color: '#F5908E',
    what: 'The bill passed one chamber (House or Senate) and has been officially rewritten to include all amendments.',
    lobbying: 'Lobby the second chamber now. The bill can still be amended or killed before it clears both sides.',
    voting: 'Contact your senators (if it started in the House) or representatives in the other chamber.',
  },
  {
    status: 'Enrolled',
    color: '#E08A88',
    what: "Both chambers passed the bill. It's printed in its final form and sent to the Governor to sign or veto.",
    lobbying: "Last chance — contact the Governor's office directly. Public pressure here can still flip the outcome.",
    voting: 'Public legislative voting is over. The Governor decides. But pressure on their office still matters.',
  },
  {
    status: 'Passed',
    color: '#4CAF50',
    what: 'The Governor signed it into law. It takes effect on its stated date.',
    lobbying: 'Now regulatory agencies who write the rules decide how the law is actually enforced.',
    voting: 'Use this as an election issue. Support or oppose legislators at the ballot box based on this vote.',
  },
  {
    status: 'Vetoed',
    color: '#FF5722',
    what: 'The Governor rejected the bill. The legislature can attempt an override with a supermajority vote (usually 2/3).',
    lobbying: 'Push legislators hard for a veto override with calls and pressure.',
    voting: 'Watch how your reps vote on the override for the next election.',
  },
  {
    status: 'Failed',
    color: '#9E9E9E',
    what: 'The bill did not pass: it died in committee, was voted down, or the session ended before a vote.',
    lobbying: 'The issue can be reintroduced next session. Build coalitions now for a stronger push next year.',
    voting: 'If this issue matters to you, note which legislators voted against it.',
  },
];

export default function HomeScreen() {
  const [reauthModalVisible, setReauthModalVisible] = useState(false);
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [selectedState, setSelectedState] = useState({ code: 'GA', name: 'Georgia' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    // Empty dependency array — runs once on mount only
    // Uses a ref-style pattern to avoid re-render loop
    let initialLoad = true;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (initialLoad) {
        initialLoad = false;
        setAuthLoaded(true);
        return;
      }
      // Only redirect if auth changes AFTER initial load
      if (!user) {
        router.replace('/login');
      }
    });
    return () => unsubscribe();
  }, []); // ← empty array, not [authLoaded]

  useEffect(() => {
    AsyncStorage.setItem('selectedState', JSON.stringify(selectedState));
  }, [selectedState]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('isLoggedIn');
            router.replace('/login');
          } catch {
            Alert.alert('Error', 'Failed to logout. Please try again.');
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (currentUser?.email) setEmail(currentUser.email);
            setReauthModalVisible(true);
          },
        },
      ]
    );
  };

  const handleReauth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    setIsDeleting(true);
    try {
      let user = currentUser || auth.currentUser;
      if (!user) {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        const cred = await signInWithEmailAndPassword(auth, email, password);
        user = cred.user;
      }
      if (!user) throw new Error('Unable to authenticate user');
      const credential = EmailAuthProvider.credential(email, password);
      const result = await reauthenticateWithCredential(user, credential);
      await new Promise((r) => setTimeout(r, 200));
      const userToDelete = auth.currentUser || result.user;
      if (!userToDelete) throw new Error('Authentication state corrupted');
      await deleteUser(userToDelete);
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('isLoggedIn');
      setReauthModalVisible(false);
      setEmail('');
      setPassword('');
      router.replace('/login');
      Alert.alert('Success', 'Your account has been deleted successfully.');
    } catch (error: any) {
      const codes: Record<string, string> = {
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
        'auth/user-not-found': 'Account not found. Please check your email address.',
        'auth/invalid-email': 'Invalid email address format.',
        'auth/too-many-requests': 'Too many failed attempts. Please wait and try again later.',
        'auth/requires-recent-login': 'Please verify your credentials and try again.',
        'auth/network-request-failed': 'Network error. Please check your connection.',
        'auth/user-disabled': 'This account has been disabled. Please contact support.',
      };
      Alert.alert('Error', codes[error.code] ?? `Error: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!authLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* Reauth Modal — unchanged */}
      <Modal
        animationType="fade"
        transparent
        visible={reauthModalVisible}
        onRequestClose={() => {
          if (!isDeleting) { setReauthModalVisible(false); setEmail(''); setPassword(''); }
        }}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Your Identity</Text>
            <Text style={styles.modalText}>Please enter your email and password to delete your account</Text>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your email"
              placeholderTextColor="#B091A4"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isDeleting}
            />
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor="#B091A4"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!isDeleting}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => { setReauthModalVisible(false); setEmail(''); setPassword(''); }}
                disabled={isDeleting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, isDeleting && styles.confirmButtonDisabled]}
                onPress={handleReauth}
                disabled={isDeleting}
              >
                <Text style={styles.confirmButtonText}>{isDeleting ? 'Deleting...' : 'Delete Account'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* State Picker Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={stateModalVisible}
        onRequestClose={() => setStateModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.stateModalContent}>
            <View style={styles.stateModalHeader}>
              <Text style={styles.modalTitle}>Choose a State</Text>
              <TouchableOpacity onPress={() => setStateModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B5B5B" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {STATES.map((s) => (
                <TouchableOpacity
                  key={s.code}
                  style={[styles.stateRow, selectedState.code === s.code && styles.stateRowSelected]}
                  onPress={() => { setSelectedState(s); setStateModalVisible(false); }}
                >
                  <Text style={[styles.stateRowText, selectedState.code === s.code && styles.stateRowTextSelected]}>
                    {s.name}
                  </Text>
                  {selectedState.code === s.code && (
                    <Ionicons name="checkmark" size={18} color="#F5908E" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>US Legislation</Text>
            <Text style={styles.headerSubtitle}>State Bill Tracker</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
              <Text style={styles.iconLabel}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, { marginLeft: 10 }]} onPress={handleDeleteAccount}>
              <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
              <Text style={styles.iconLabel}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Welcome + state + browse */}
        <View style={styles.topCard}>
          <Text style={styles.welcomeTitle}>
            Welcome{currentUser?.email ? `, ${currentUser.email.split('@')[0]}` : ''}
          </Text>
          <Text style={styles.welcomeSub}>Track bills and legislation across all 50 states.</Text>
          <View style={styles.topCardRow}>
            <TouchableOpacity style={styles.stateBtn} onPress={() => setStateModalVisible(true)}>
              <Text style={styles.stateBtnLabel}>State</Text>
              <Text style={styles.stateBtnValue}>{selectedState.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(tabs)/journal')}>
              <Text style={styles.browseBtnText}>Browse Bills</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bill process */}
        <Text style={styles.sectionLabel}>How a Bill Becomes Law</Text>
        <Text style={styles.sectionSub}>What each stage means and how you can act</Text>

        {BILL_STAGES.map((stage, i) => (
          <View key={stage.status} style={styles.stageBlock}>
            <View style={styles.stageLeft}>
              <View style={[styles.stageDot, { backgroundColor: stage.color }]} />
              {i < BILL_STAGES.length - 1 && <View style={styles.stageLine} />}
            </View>
            <View style={styles.stageRight}>
              <Text style={[styles.stageStatus, { color: stage.color }]}>{stage.status}</Text>
              <Text style={styles.stageWhat}>{stage.what}</Text>
              <Text style={styles.stageSubLabel}>Lobbying & Advocacy</Text>
              <Text style={styles.stageDetail}>{stage.lobbying}</Text>
              <Text style={styles.stageSubLabel}>Your Action</Text>
              <Text style={styles.stageDetail}>{stage.voting}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#F5908E' },
  header: {
    backgroundColor: '#F5908E',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E08A88',
    elevation: 2,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTextContainer: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
  headerSubtitle: { fontSize: 12, color: '#FFFFFF', textAlign: 'center', marginTop: 1, opacity: 0.9 },
  headerButtons: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { alignItems: 'center', padding: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)' },
  iconLabel: { fontSize: 9, color: '#FFFFFF', marginTop: 2 },
  body: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  topCard: {
    backgroundColor: '#F8F4F4',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F5D4D4',
    marginBottom: 28,
  },
  welcomeTitle: { fontSize: 18, fontWeight: '700', color: '#2D2D2D' },
  welcomeSub: { fontSize: 13, color: '#6B5B5B', marginTop: 4, marginBottom: 16 },
  topCardRow: { flexDirection: 'row', gap: 10 },
  stateBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F5D4D4',
  },
  stateBtnLabel: { fontSize: 10, color: '#B091A4', fontWeight: '700', textTransform: 'uppercase' },
  stateBtnValue: { fontSize: 14, fontWeight: '700', color: '#2D2D2D', marginTop: 2 },
  browseBtn: {
    flex: 1,
    backgroundColor: '#F5908E',
    borderRadius: 10,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  browseBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#2D2D2D', marginBottom: 4 },
  sectionSub: { fontSize: 13, color: '#B091A4', marginBottom: 20 },
  stageBlock: { flexDirection: 'row', marginBottom: 0 },
  stageLeft: { width: 24, alignItems: 'center', marginRight: 14 },
  stageDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  stageLine: {
    width: 2, flex: 1, backgroundColor: '#F5D4D4',
    marginTop: 4, marginBottom: 0, minHeight: 20,
  },
  stageRight: { flex: 1, paddingBottom: 24 },
  stageStatus: { fontSize: 15, fontWeight: '700', marginBottom: 6 },
  stageWhat: { fontSize: 14, color: '#2D2D2D', lineHeight: 21, marginBottom: 10 },
  stageSubLabel: {
    fontSize: 11, fontWeight: '700', color: '#B091A4',
    textTransform: 'uppercase', marginBottom: 4, marginTop: 2,
  },
  stageDetail: { fontSize: 13, color: '#6B5B5B', lineHeight: 20, marginBottom: 8 },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, width: '80%', maxWidth: 300, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#F5908E', marginBottom: 8 },
  modalText: { fontSize: 14, color: '#6B5B5B', textAlign: 'center', marginBottom: 20 },
  passwordInput: { width: '100%', height: 48, borderColor: '#F5908E', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, fontSize: 16, marginBottom: 12, backgroundColor: '#F8F4F4' },
  modalButtons: { flexDirection: 'row', width: '100%', gap: 12, marginTop: 8 },
  modalButton: { flex: 1, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  cancelButton: { backgroundColor: '#E5D4D4' },
  confirmButton: { backgroundColor: '#F5908E' },
  confirmButtonDisabled: { backgroundColor: '#B091A4' },
  cancelButtonText: { color: '#6B5B5B', fontSize: 16, fontWeight: '600' },
  confirmButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  stateModalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, width: '90%', maxHeight: '75%' },
  stateModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  stateRow: { paddingVertical: 14, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#F5D4D4', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stateRowSelected: { backgroundColor: '#FFF0F0' },
  stateRowText: { fontSize: 16, color: '#2D2D2D' },
  stateRowTextSelected: { fontWeight: '700', color: '#F5908E' },
});