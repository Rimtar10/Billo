import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { User, Phone, Calendar, MapPin, Briefcase, Globe, ChevronLeft, LogOut, Trash2 } from 'lucide-react-native';

const Account = ({ navigation, route, onLogout: logoutProp, onDeleteAccount: deleteProp }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const onLogout = logoutProp || route?.params?.onLogout;
  const onDeleteAccount = deleteProp || route?.params?.onDeleteAccount;

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('userData');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setUserData(parsed);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (onLogout) {
      const success = await onLogout();
      if (!success) {
        console.log('[Account.js] Logout failed');
      }
    } else {
      console.log('[Account.js] ERROR: onLogout function not available!');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'This will permanently delete all your data. Are you absolutely sure?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Delete Forever',
                  style: 'destructive',
                  onPress: async () => {
                    if (onDeleteAccount) {
                      const success = await onDeleteAccount();
                      if (!success) {
                        Alert.alert('Error', 'Failed to delete account. Please try again.');
                      }
                    } else {
                      Alert.alert('Error', 'Delete account function not available.');
                    }
                  },
                },
              ]
            );
          },
        },
      ],
      { cancelable: true }
    );
  };

  const formatGender = (gender) => {
    const genderMap = {
      male: 'Male',
      female: 'Female',
      other: 'Other',
      prefer_not_to_say: 'Prefer not to say',
    };
    return genderMap[gender] || gender;
  };

  // Content component that will be used in both web and native
  const Content = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    if (!userData) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No user data found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        {/* Greeting Card */}
        <View style={styles.greetingCard}>
          <View style={styles.greetingIcon}>
            <User size={32} color="#2f40fcff" />
          </View>
          <Text style={styles.greetingText}>
            Hello, {userData.firstName}!
          </Text>
          <Text style={styles.greetingSubtext}>
            Manage your account settings
          </Text>
        </View>

        {/* Account Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>

          {/* Account ID */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <User size={20} color="#2f40fcff" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Account ID</Text>
              <Text style={styles.infoValue}>{userData.userId || 'N/A'}</Text>
            </View>
          </View>

          {/* Phone Number */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Phone size={20} color="#2f40fcff" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{userData.phoneNumber || 'N/A'}</Text>
            </View>
          </View>

          {/* Email */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Text style={styles.emailIcon}>@</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{userData.email || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          {/* Full Name */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <User size={20} color="#2f40fcff" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>
                {userData.firstName} {userData.lastName}
              </Text>
            </View>
          </View>

          {/* Gender */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <User size={20} color="#2f40fcff" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Gender</Text>
              <Text style={styles.infoValue}>{formatGender(userData.gender) || 'N/A'}</Text>
            </View>
          </View>

          {/* Date of Birth */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Calendar size={20} color="#2f40fcff" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              <Text style={styles.infoValue}>{userData.dateOfBirth || 'N/A'}</Text>
            </View>
          </View>

          {/* Place of Birth */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <MapPin size={20} color="#2f40fcff" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Place of Birth</Text>
              <Text style={styles.infoValue}>{userData.placeOfBirth || 'N/A'}</Text>
            </View>
          </View>

          {/* Nationality */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Globe size={20} color="#2f40fcff" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nationality</Text>
              <Text style={styles.infoValue}>{userData.nationality || 'N/A'}</Text>
            </View>
          </View>

          {/* Country of Residence */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <MapPin size={20} color="#2f40fcff" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Country of Residence</Text>
              <Text style={styles.infoValue}>{userData.countryOfResidence || 'N/A'}</Text>
            </View>
          </View>

          {/* Occupation */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Briefcase size={20} color="#2f40fcff" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Occupation</Text>
              <Text style={styles.infoValue}>{userData.occupation || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          {/* Log Out Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>

          {/* Delete Account Button */}
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Trash2 size={20} color="#fff" />
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </View>
    );
  };

  // Main render
  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIconButton}>
          <ChevronLeft size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Conditional rendering for web vs native */}
      {Platform.OS === 'web' ? (
        // Web-specific div with native scrolling
        <div style={styles.webScrollContainer}>
          <Content />
        </div>
      ) : (
        // Native ScrollView
        <ScrollView
          style={styles.nativeScrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
          <Content />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  webScrollContainer: {
    height: 'calc(100vh - 60px)',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  nativeScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  contentContainer: {
    minHeight: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    ...Platform.select({
      ios: {
        paddingTop: 40,
      },
      android: {
        paddingTop: 20,
      },
    }),
  },
  backIconButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  placeholder: {
    width: 36,
  },
  greetingCard: {
    backgroundColor: '#2f40fcff',
    margin: 20,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#2f40fcff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  greetingIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  greetingSubtext: {
    fontSize: 14,
    color: '#ffffffac',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2f40fc15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emailIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2f40fcff',
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#2f40fcff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#2f40fcff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    gap: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    gap: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    backgroundColor: '#2f40fcff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default Account;