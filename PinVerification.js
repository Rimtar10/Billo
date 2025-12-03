import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from "react-native-safe-area-context";

const PinVerification = ({ navigation, route }) => {
  const [pin, setPin] = useState('');
  const [storedPin, setStoredPin] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserPin();
  }, []);

  const loadUserPin = async () => {
    try {
      // Get user credentials to find the user ID
      const userCredentials = await AsyncStorage.getItem('userCredentials');
      if (!userCredentials) {
        console.log('[PinVerification] No user credentials found');
        navigation.reset({
          index: 0,
          routes: [{ name: 'BApp' }],
        });
        return;
      }

      const credentials = JSON.parse(userCredentials);
      const userId = credentials.userId;

      // Get the user's complete data which contains the security PIN
      const userData = await AsyncStorage.getItem(userId);
      if (!userData) {
        console.log('[PinVerification] No user data found for userId:', userId);
        navigation.reset({
          index: 0,
          routes: [{ name: 'BApp' }],
        });
        return;
      }

      const parsedUserData = JSON.parse(userData);
      if (!parsedUserData.securityPin) {
        console.log('[PinVerification] No security PIN found in user data');
        Alert.alert('Error', 'Security PIN not found. Please contact support.');
        navigation.reset({
          index: 0,
          routes: [{ name: 'BApp' }],
        });
        return;
      }

      setStoredPin(parsedUserData.securityPin);
      console.log('[PinVerification] Security PIN loaded successfully');
    } catch (error) {
      console.error('[PinVerification] Error loading user PIN:', error);
      Alert.alert('Error', 'Failed to load security PIN. Please try again.');
      navigation.reset({
        index: 0,
        routes: [{ name: 'BApp' }],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinSubmit = () => {
    if (pin.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }

    if (pin === storedPin) {
      console.log('[PinVerification] PIN verification successful');
      // Navigate to Home
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } else {
      setError('Incorrect PIN. Please try again.');
      setPin('');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear navigation state but keep credentials
              await AsyncStorage.removeItem('NAVIGATION_STATE');
              console.log('[PinVerification] User logged out');
              navigation.reset({
                index: 0,
                routes: [{ name: 'BApp' }],
              });
            } catch (error) {
              console.error('[PinVerification] Error during logout:', error);
            }
          },
        },
      ]
    );
  };

  const handleForgotPin = () => {
    Alert.alert(
      'Forgot PIN',
      'For security reasons, you need to contact support to reset your PIN. This will require identity verification.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Contact Support',
          onPress: () => {
            // In a real app, this would open email or support chat
            Alert.alert('Support', 'Please email support@yourapp.com with your registered email address for PIN reset assistance.');
          },
        },
      ]
    );
  };

  if (isLoading) {
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Security Verification</Text>
            <Text style={styles.subtitle}>Enter your 4-digit security PIN to continue</Text>
          </View>

          {/* PIN Input */}
          <View style={styles.pinContainer}>
            <Text style={styles.pinLabel}>Enter PIN</Text>
            <TextInput
              style={[styles.pinInput, error && styles.pinInputError]}
              placeholder="••••"
              placeholderTextColor="#999999"
              value={pin}
              onChangeText={(text) => {
                setPin(text.replace(/[^0-9]/g, '')); // Only allow numbers
                if (error) setError('');
              }}
              keyboardType="numeric"
              secureTextEntry
              maxLength={4}
              autoFocus
              selectTextOnFocus
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          {/* Security Note */}
          <View style={styles.securityNote}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityText}>
              Your PIN protects your account and transaction security.
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.submitButton, pin.length !== 4 && styles.submitButtonDisabled]}
              disabled={pin.length !== 4}
              onPress={handlePinSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>Verify PIN</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotButton}
              onPress={handleForgotPin}
            >
              <Text style={styles.forgotButtonText}>Forgot PIN?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666666',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  pinContainer: {
    marginBottom: 32,
  },
  pinLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  pinInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
    fontSize: 24,
    color: '#333333',
    borderWidth: 2,
    borderColor: '#E5E5E5',
    textAlign: 'center',
    letterSpacing: 8,
  },
  pinInputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 12,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  securityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  securityText: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
    lineHeight: 18,
  },
  buttonContainer: {
    gap: 16,
  },
  submitButton: {
    backgroundColor: '#2f40fcff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2f40fcff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  forgotButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  forgotButtonText: {
    color: '#2f40fcff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    marginTop: 8,
    paddingTop: 16,
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PinVerification;