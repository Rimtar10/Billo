import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from "react-native-safe-area-context";

const LogIn = ({ navigation, route }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { onLogin } = route.params || {};

  // Validation functions
  const validatePhoneNumber = (phone) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    // Check if it's a valid phone number (10-15 digits)
    return cleaned.length >= 10 && cleaned.length <= 15;
  };

  const validatePassword = (password) => {
    // At least 8 characters
    return password.length >= 8;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhoneNumber(phoneNumber.trim())) {
      newErrors.phoneNumber = 'Please enter a valid phone number (10-15 digits)';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = () => {
    return phoneNumber.trim() !== '' && password.trim() !== '';
  };

  const handleLogin = async () => {
    console.log('[LogIn.js] ==================== LOGIN ATTEMPT STARTED ====================');
    
    // Clear any previous login error
    setLoginError('');
    
    if (!validateForm()) {
      console.log('[LogIn.js] ❌ Form validation failed');
      return;
    }

    console.log('[LogIn.js] ✅ Form validation passed');
    setIsLoading(true);

    try {
      // Get stored user credentials
      console.log('[LogIn.js] Attempting to retrieve stored credentials from AsyncStorage...');
      const storedCredentials = await AsyncStorage.getItem('userCredentials');
      
      if (!storedCredentials) {
        console.log('[LogIn.js] ❌ No credentials found in AsyncStorage');
        setLoginError('No account found. Please sign up first.');
        setIsLoading(false);
        return;
      }

      console.log('[LogIn.js] ✅ Stored credentials found');
      const credentials = JSON.parse(storedCredentials);

      console.log('[LogIn.js] Comparing credentials:');
      console.log('[LogIn.js]   Input phone:', phoneNumber.trim());
      console.log('[LogIn.js]   Stored phone:', credentials.phoneNumber);
      console.log('[LogIn.js]   Input password length:', password.length);
      console.log('[LogIn.js]   Stored password length:', credentials.password?.length || 0);
      console.log('[LogIn.js]   Phone match:', credentials.phoneNumber.trim() === phoneNumber.trim());
      console.log('[LogIn.js]   Password match:', credentials.password === password);

      // Verify credentials - trim both inputs for comparison
      const phoneMatch = credentials.phoneNumber.trim() === phoneNumber.trim();
      const passwordMatch = credentials.password === password;
      
      if (phoneMatch && passwordMatch) {
        console.log('[LogIn.js] ✅✅✅ CREDENTIALS VERIFIED SUCCESSFULLY! ✅✅✅');
        console.log('[LogIn.js] Login successful for user:', credentials.userId);
        
        // Save credentials again to ensure they're in AsyncStorage
        await AsyncStorage.setItem('userCredentials', JSON.stringify(credentials));
        console.log('[LogIn.js] Credentials re-saved to AsyncStorage');
        
        // Get full user data
        const userData = await AsyncStorage.getItem('userData');
        
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          console.log('[LogIn.js] User data found:', parsedUserData.firstName, parsedUserData.lastName);
        } else {
          console.log('[LogIn.js] ⚠️ Warning: No userData found in AsyncStorage');
        }
        
        // Call onLogin handler from App.js to update state and navigate
        console.log('[LogIn.js] Checking for onLogin handler...');
        console.log('[LogIn.js] onLogin exists:', !!onLogin);
        
        if (onLogin) {
          console.log('[LogIn.js] ➡️ Calling onLogin handler from App.js...');
          await onLogin();
          console.log('[LogIn.js] ✅ onLogin handler completed');
        } else {
          console.log('[LogIn.js] ⚠️ onLogin handler not available, using fallback navigation');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        }
        
        console.log('[LogIn.js] ==================== LOGIN COMPLETED ====================');
        
      } else {
        // Show which credential is wrong
        console.log('[LogIn.js] ❌ CREDENTIAL MISMATCH:');
        if (!phoneMatch) {
          console.log('[LogIn.js]   ❌ Phone number does NOT match');
          console.log('[LogIn.js]      Expected:', credentials.phoneNumber);
          console.log('[LogIn.js]      Received:', phoneNumber.trim());
          setLoginError('Invalid phone number. Please check and try again.');
        } else if (!passwordMatch) {
          console.log('[LogIn.js]   ❌ Password does NOT match');
          console.log('[LogIn.js]      Expected length:', credentials.password?.length || 0);
          console.log('[LogIn.js]      Received length:', password.length);
          console.log('[LogIn.js]      First char match:', credentials.password?.[0] === password[0]);
          setLoginError('Invalid password. Password is case-sensitive. Please check and try again.');
        }
        console.log('[LogIn.js] ==================== LOGIN FAILED ====================');
      }
    } catch (error) {
      console.error('[LogIn.js] ❌❌❌ LOGIN ERROR:', error);
      console.error('[LogIn.js] Error details:', error.message);
      console.error('[LogIn.js] Error stack:', error.stack);
      setLoginError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
      console.log('[LogIn.js] Login attempt finished, isLoading set to false');
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignUp = () => {
    navigation.navigate('PermissionPage');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>Billo</Text>
            </View>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitleText}>Log in to your account</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Phone Number Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={[styles.input, errors.phoneNumber && styles.inputError]}
                placeholder="Enter your phone number"
                placeholderTextColor="#999999"
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text);
                  if (errors.phoneNumber) {
                    setErrors(prev => ({ ...prev, phoneNumber: '' }));
                  }
                }}
                keyboardType="phone-pad"
                autoCapitalize="none"
                editable={!isLoading}
              />
              {errors.phoneNumber ? <Text style={styles.errorText}>{errors.phoneNumber}</Text> : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                  placeholder="Enter your password"
                  placeholderTextColor="#999999"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                      setErrors(prev => ({ ...prev, password: '' }));
                    }
                    // Clear login error when user starts typing
                    if (loginError) {
                      setLoginError('');
                    }
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Text style={styles.eyeIconText}>{showPassword ? 'HIDE' : 'SHOW'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            {/* Login Error Message */}
            {loginError ? (
              <View style={styles.loginErrorContainer}>
                <Text style={styles.loginErrorText}>{loginError}</Text>
              </View>
            ) : null}

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity 
              style={[
                styles.loginButton, 
                !isFormValid() && styles.loginButtonDisabled,
                isLoading && styles.loginButtonLoading
              ]}
              disabled={!isFormValid() || isLoading}
              onPress={handleLogin}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Logging in...' : 'Log In'}
              </Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity 
                onPress={handleSignUp}
                disabled={isLoading}
              >
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2f40fcff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#2f40fcff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#666666',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
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
    paddingRight: 50, // Make room for the eye icon
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
  loginErrorContainer: {
    backgroundColor: '#FFF2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  loginErrorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    fontWeight: '500',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#2f40fcff',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#2f40fcff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#2f40fcff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonLoading: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 15,
    color: '#666666',
  },
  signupLink: {
    fontSize: 15,
    color: '#2f40fcff',
    fontWeight: '700',
  },
});

export default LogIn;