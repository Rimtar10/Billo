import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignUp4 = ({ navigation, route }) => {
  console.log('[SignUp4.js] Component mounting, route params:', route?.params);

  const [formData, setFormData] = useState({
    securityPin: '',
    confirmSecurityPin: '',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState({});

  const { onLogin } = route?.params || {};
  console.log('[SignUp4.js] onLogin handler available:', !!onLogin);

  // Load saved form data when component mounts
  useEffect(() => {
    const loadFormData = async () => {
      try {
        const savedFormData = await AsyncStorage.getItem('signUp4FormData');
        const savedTerms = await AsyncStorage.getItem('signUp4Terms');
        
        if (savedFormData) {
          setFormData(JSON.parse(savedFormData));
        }
        if (savedTerms) {
          setAcceptedTerms(JSON.parse(savedTerms));
        }
      } catch (error) {
        console.error('Error loading form data:', error);
      }
    };
    
    loadFormData();
  }, []);

  const isFormValid = () => {
    return formData.securityPin.length === 4 && 
           formData.confirmSecurityPin.length === 4 && 
           formData.securityPin === formData.confirmSecurityPin && 
           acceptedTerms &&
           /^\d{4}$/.test(formData.securityPin);
  };

  // Validation functions
  const validateSecurityPin = (pin, confirmPin) => {
    const newErrors = {};

    if (!pin) {
      newErrors.securityPin = 'Security PIN is required';
    } else if (pin.length !== 4) {
      newErrors.securityPin = 'Security PIN must be exactly 4 digits';
    } else if (!/^\d{4}$/.test(pin)) {
      newErrors.securityPin = 'Security PIN must contain only numbers';
    }

    if (!confirmPin) {
      newErrors.confirmSecurityPin = 'Please confirm your security PIN';
    } else if (confirmPin !== pin) {
      newErrors.confirmSecurityPin = 'Security PINs do not match';
    }

    if (!acceptedTerms) {
      newErrors.terms = 'Please accept the Terms of Service and Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveUserData = async () => {
    try {
      // Get the accumulated data from previous steps
      const previousData = route.params?.userData || {};
      
      // Also try to load from AsyncStorage as backup
      let backupData = {};
      try {
        const storedData = await AsyncStorage.getItem('currentSignUpData');
        if (storedData) {
          backupData = JSON.parse(storedData);
        }
      } catch (error) {
        console.log('[SignUp4] No backup data found in AsyncStorage');
      }
      
      // Use navigation params data, fall back to AsyncStorage data if missing
      const finalPreviousData = Object.keys(previousData).length > 0 ? previousData : backupData;
      
      // Create final user data with security PIN
      const userData = {
        ...finalPreviousData,
        securityPin: formData.securityPin,
        signupDate: new Date().toISOString(),
        userId: `user_${Date.now()}`,
      };

      // Debug logging to verify all data is present
      console.log('[SignUp4] Previous data from navigation:', previousData);
      console.log('[SignUp4] Backup data from AsyncStorage:', backupData);
      console.log('[SignUp4] Final accumulated data:', {
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        firstName: userData.firstName,
        lastName: userData.lastName,
        idPhoto: userData.idPhoto ? 'present' : 'missing',
        securityPin: userData.securityPin,
        hasAllData: !!userData.email && !!userData.phoneNumber && !!userData.firstName && !!userData.lastName,
      });

      // Save complete user data
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem(userData.userId, JSON.stringify(userData));

      // Save user credentials for login
      const userCredentials = {
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        password: userData.password,
        userId: userData.userId,
      };
      await AsyncStorage.setItem('userCredentials', JSON.stringify(userCredentials));

      // Clean up temporary signup data
      await AsyncStorage.removeItem('currentSignUpData');
      await AsyncStorage.removeItem('signUp4FormData');
      await AsyncStorage.removeItem('signUp4Terms');

      console.log('User account created successfully!');

      // Navigate to Home after successful signup
      if (onLogin) {
        console.log('[SignUp4.js] Calling onLogin handler from App.js');
        await onLogin();
      } else {
        console.log('[SignUp4.js] onLogin handler not available, using fallback navigation');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      }
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('Error', 'Failed to save user data. Please try again.');
    }
  };

  const handleComplete = () => {
    if (!validateSecurityPin(formData.securityPin, formData.confirmSecurityPin)) {
      return;
    }

    saveUserData();
  };

  const handleTermsPress = () => {
    Alert.alert('Terms of Service', 'Here would be your Terms of Service content.');
  };

  const handlePrivacyPress = () => {
    Alert.alert('Privacy Policy', 'Here would be your Privacy Policy content.');
  };

  const updateFormData = (key, value) => {
    const updatedData = { ...formData, [key]: value };
    setFormData(updatedData);
    // Save to AsyncStorage whenever data changes
    AsyncStorage.setItem('signUp4FormData', JSON.stringify(updatedData));
  };

  // Custom TextInput component that works on both web and native
  const CustomTextInput = ({ 
    value, 
    onChangeText, 
    placeholder, 
    error, 
    style, 
    secureTextEntry = false,
    keyboardType = 'default',
    maxLength,
    ...props 
  }) => {
    if (Platform.OS === 'web') {
      return (
        <input
          type={secureTextEntry ? 'password' : 'text'}
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder={placeholder}
          style={{
            ...styles.webTextInput,
            ...(error ? styles.inputError : {}),
            ...style,
          }}
          maxLength={maxLength}
          {...(keyboardType === 'numeric' ? { inputMode: 'numeric' } : {})}
          {...props}
        />
      );
    }

    return (
      <TextInput
        style={[
          styles.textInput,
          error && styles.inputError,
          style,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999999"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        maxLength={maxLength}
        {...props}
      />
    );
  };

  // Content component that will be used in both web and native
  const Content = () => (
    <View style={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Step 4 of 4</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressStep, styles.progressActive]} />
        <View style={[styles.progressStep, styles.progressActive]} />
        <View style={[styles.progressStep, styles.progressActive]} />
        <View style={[styles.progressStep, styles.progressActive]} />
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Almost Done!</Text>
        <Text style={styles.subtitle}>Set your security PIN and accept our terms</Text>

        {/* App Security PIN Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Security PIN</Text>
          <Text style={styles.sectionSubtitle}>
            Set a 4-digit PIN for app security
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>4-Digit Security PIN</Text>
            <CustomTextInput
              value={formData.securityPin}
              onChangeText={(text) => {
                updateFormData('securityPin', text);
                if (errors.securityPin) {
                  setErrors(prev => ({ ...prev, securityPin: '' }));
                }
              }}
              placeholder="Enter 4-digit PIN"
              error={errors.securityPin}
              keyboardType="numeric"
              secureTextEntry={true}
              maxLength={4}
            />
            <Text style={styles.inputHint}>
              Use 4 digits for app security
            </Text>
            {errors.securityPin ? <Text style={styles.errorText}>{errors.securityPin}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Security PIN</Text>
            <CustomTextInput
              value={formData.confirmSecurityPin}
              onChangeText={(text) => {
                updateFormData('confirmSecurityPin', text);
                if (errors.confirmSecurityPin) {
                  setErrors(prev => ({ ...prev, confirmSecurityPin: '' }));
                }
              }}
              placeholder="Confirm your 4-digit PIN"
              error={errors.confirmSecurityPin}
              keyboardType="numeric"
              secureTextEntry={true}
              maxLength={4}
            />
            {formData.confirmSecurityPin.length === 4 && formData.securityPin !== formData.confirmSecurityPin && (
              <Text style={styles.errorText}>PINs do not match</Text>
            )}
            {errors.confirmSecurityPin ? <Text style={styles.errorText}>{errors.confirmSecurityPin}</Text> : null}
          </View>
        </View>

        {/* Terms and Conditions */}
        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={() => {
            const newTermsValue = !acceptedTerms;
            setAcceptedTerms(newTermsValue);
            // Save terms to AsyncStorage
            AsyncStorage.setItem('signUp4Terms', JSON.stringify(newTermsValue));
            if (errors.terms) {
              setErrors(prev => ({ ...prev, terms: '' }));
            }
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
            {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            I agree to the{' '}
            <Text style={styles.linkText} onPress={handleTermsPress}>
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text style={styles.linkText} onPress={handlePrivacyPress}>
              Privacy Policy
            </Text>
          </Text>
        </TouchableOpacity>
        {errors.terms ? <Text style={styles.errorText}>{errors.terms}</Text> : null}

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={styles.securityText}>
            Your 4-digit PIN will be used for app security features and transactions.
          </Text>
        </View>

        {/* Complete Button */}
        <TouchableOpacity 
          style={[styles.completeButton, !isFormValid() && styles.completeButtonDisabled]}
          disabled={!isFormValid()}
          onPress={handleComplete}
          activeOpacity={0.8}
        >
          <Text style={styles.completeButtonText}>Complete Sign Up</Text>
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Main render
  return (
    <View style={styles.container}>
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
    backgroundColor: '#FFFFFF',
  },
  webScrollContainer: {
    height: '100vh',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  nativeScrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  contentContainer: {
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    ...Platform.select({
      ios: {
        paddingTop: 40,
      },
      android: {
        paddingTop: 20,
      },
    }),
  },
  backIcon: {
    fontSize: 28,
    color: '#333333',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  placeholder: {
    width: 28,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  progressStep: {
    flex: 1,
    height: 4,
    marginHorizontal: 2,
    borderRadius: 2,
  },
  progressActive: {
    backgroundColor: '#2f40fcff',
  },
  progressInactive: {
    backgroundColor: '#E5E5E5',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 32,
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 18,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    width: '100%',
    minHeight: 48,
  },
  // Web-specific TextInput styling (for HTML input element)
  webTextInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: '12px',
    padding: '14px 16px',
    fontSize: '16px',
    color: '#333333',
    border: '1px solid #E5E5E5',
    width: '100%',
    minHeight: '48px',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    lineHeight: 'normal',
    display: 'block',
    margin: 0,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 6,
  },
  inputHint: {
    fontSize: 12,
    color: '#666666',
    marginTop: 6,
    fontStyle: 'italic',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 24,
    padding: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#2f40fcff',
    borderColor: '#2f40fcff',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  linkText: {
    color: '#2f40fcff',
    fontWeight: '600',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  securityIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
  },
  completeButton: {
    backgroundColor: '#2f40fcff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#2f40fcff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  completeButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  backButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 40,
  },
  backButtonText: {
    color: '#666666',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default SignUp4;