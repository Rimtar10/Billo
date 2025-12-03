import React, { useState } from 'react';
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

const ForgotPassword = ({ navigation }) => {
  const [step, setStep] = useState('pin'); // 'pin' or 'newPassword'
  const [pin, setPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validation functions
  const validatePin = (pin) => {
    return pin.length === 4 && /^\d{4}$/.test(pin);
  };

  const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handlePinSubmit = async () => {
    if (!validatePin(pin)) {
      setErrors({ pin: 'Please enter a valid 4-digit PIN' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Get stored user credentials to find the user ID
      const userCredentials = await AsyncStorage.getItem('userCredentials');
      if (!userCredentials) {
        Alert.alert('Error', 'No account found. Please sign up first.');
        navigation.goBack();
        return;
      }

      const credentials = JSON.parse(userCredentials);
      const userId = credentials.userId;

      // Get the user's complete data which contains the security PIN
      const userData = await AsyncStorage.getItem(userId);
      if (!userData) {
        Alert.alert('Error', 'Account data not found. Please contact support.');
        navigation.goBack();
        return;
      }

      const parsedUserData = JSON.parse(userData);
      if (!parsedUserData.securityPin) {
        Alert.alert('Error', 'Security PIN not found. Please contact support.');
        navigation.goBack();
        return;
      }

      // Verify PIN
      if (pin === parsedUserData.securityPin) {
        console.log('[ForgotPassword] PIN verification successful');
        setStep('newPassword');
      } else {
        setErrors({ pin: 'Incorrect PIN. Please try again.' });
      }
    } catch (error) {
      console.error('[ForgotPassword] Error verifying PIN:', error);
      Alert.alert('Error', 'Failed to verify PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const newErrors = {};

    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (!validatePassword(newPassword.trim())) {
      newErrors.newPassword = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Get stored user credentials
      const userCredentials = await AsyncStorage.getItem('userCredentials');
      if (!userCredentials) {
        Alert.alert('Error', 'Account not found. Please contact support.');
        return;
      }

      const credentials = JSON.parse(userCredentials);
      const userId = credentials.userId;

      // Update the password in userCredentials
      const updatedCredentials = {
        ...credentials,
        password: newPassword.trim(),
      };

      await AsyncStorage.setItem('userCredentials', JSON.stringify(updatedCredentials));

      // Also update the password in the complete user data if it exists
      const userData = await AsyncStorage.getItem(userId);
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        const updatedUserData = {
          ...parsedUserData,
          password: newPassword.trim(),
          lastUpdated: new Date().toISOString(),
        };
        await AsyncStorage.setItem(userId, JSON.stringify(updatedUserData));
      }

      console.log('[ForgotPassword] Password reset successful');

      // Navigate directly to login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'LogIn' }],
      });
    } catch (error) {
      console.error('[ForgotPassword] Error resetting password:', error);
      Alert.alert('Error', 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'newPassword') {
      setStep('pin');
      setPin('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {step === 'pin' ? 'Verify PIN' : 'Reset Password'}
            </Text>
            <View style={styles.placeholder} />
          </View>

          {/* Content */}
          {step === 'pin' ? (
            <View style={styles.pinStep}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🔒</Text>
              </View>
              <Text style={styles.title}>Enter Security PIN</Text>
              <Text style={styles.subtitle}>
                Enter your 4-digit security PIN to reset your password
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Security PIN</Text>
                <TextInput
                  style={[styles.input, errors.pin && styles.inputError]}
                  placeholder="Enter 4-digit PIN"
                  placeholderTextColor="#999999"
                  value={pin}
                  onChangeText={(text) => {
                    setPin(text.replace(/[^0-9]/g, ''));
                    if (errors.pin) {
                      setErrors(prev => ({ ...prev, pin: '' }));
                    }
                  }}
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={4}
                  autoFocus
                />
                {errors.pin ? <Text style={styles.errorText}>{errors.pin}</Text> : null}
              </View>

              <TouchableOpacity
                style={[styles.button, pin.length !== 4 && styles.buttonDisabled, isLoading && styles.buttonLoading]}
                disabled={pin.length !== 4 || isLoading}
                onPress={handlePinSubmit}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Verifying...' : 'Verify PIN'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.passwordStep}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🔑</Text>
              </View>
              <Text style={styles.title}>Set New Password</Text>
              <Text style={styles.subtitle}>
                Create a strong password for your account
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput, errors.newPassword && styles.inputError]}
                    placeholder="Enter new password"
                    placeholderTextColor="#999999"
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      if (errors.newPassword) {
                        setErrors(prev => ({ ...prev, newPassword: '' }));
                      }
                    }}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Text style={styles.eyeIconText}>{showNewPassword ? 'HIDE' : 'SHOW'}</Text>
                  </TouchableOpacity>
                </View>
                {errors.newPassword ? <Text style={styles.errorText}>{errors.newPassword}</Text> : null}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm New Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput, errors.confirmPassword && styles.inputError]}
                    placeholder="Confirm new password"
                    placeholderTextColor="#999999"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errors.confirmPassword) {
                        setErrors(prev => ({ ...prev, confirmPassword: '' }));
                      }
                    }}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Text style={styles.eyeIconText}>{showConfirmPassword ? 'HIDE' : 'SHOW'}</Text>
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
              </View>

              <Text style={styles.passwordHint}>
                Password must be at least 8 characters with uppercase, lowercase, number, and special character
              </Text>

              <TouchableOpacity
                style={[styles.button, (!newPassword.trim() || !confirmPassword.trim()) && styles.buttonDisabled, isLoading && styles.buttonLoading]}
                disabled={!newPassword.trim() || !confirmPassword.trim() || isLoading}
                onPress={handlePasswordReset}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingBottom: 10,
  },
  backIcon: {
    fontSize: 28,
    color: '#333333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  placeholder: {
    width: 28,
  },
  pinStep: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordStep: {
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  eyeIconText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 6,
  },
  passwordHint: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#2f40fcff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#2f40fcff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonLoading: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default ForgotPassword;