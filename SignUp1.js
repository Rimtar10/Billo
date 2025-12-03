import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignUp1 = ({ navigation, route }) => {
  const [idPhoto, setIdPhoto] = useState(null);
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    // Check if it's a valid phone number (10-15 digits)
    return cleaned.length >= 10 && cleaned.length <= 15;
  };

  const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!idPhoto) {
      newErrors.idPhoto = 'Please take a photo of your ID';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhoneNumber(phoneNumber.trim())) {
      newErrors.phoneNumber = 'Please enter a valid phone number (10-15 digits)';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(password.trim())) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Load saved data when component mounts
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('currentSignUpData');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setIdPhoto(parsedData.idPhoto || null);
          setEmail(parsedData.email || '');
          setPhoneNumber(parsedData.phoneNumber || '');
          setPassword(parsedData.password || '');
        }
      } catch (error) {
        console.log('No previous data found');
      }
    };

    loadSavedData();
  }, []);

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 2],
        quality: 0.8,
      });

      if (!result.canceled) {
        setIdPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleContinue = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const userData = {
        idPhoto,
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        password: password.trim(),
        step: 1,
        lastUpdated: new Date().toISOString(),
      };

      // ✅ Save to AsyncStorage before navigating
      await AsyncStorage.setItem('currentSignUpData', JSON.stringify(userData));
      console.log('Data saved at step 1:', userData);

      navigation.navigate('SignUp2', { userData });
    } catch (error) {
      Alert.alert('Error', 'Failed to save your data. Please try again.');
    }
  };

  // Helper function to update state and clear errors
  const updateField = (field, value) => {
    switch (field) {
      case 'email':
        setEmail(value);
        if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
        break;
      case 'phoneNumber':
        setPhoneNumber(value);
        if (errors.phoneNumber) setErrors(prev => ({ ...prev, phoneNumber: '' }));
        break;
      case 'password':
        setPassword(value);
        if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
        break;
    }
  };

  // Content component that will be used in both web and native
  const Content = () => (
    <View style={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Step 1 of 4</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressStep, styles.progressActive]} />
        <View style={[styles.progressStep, styles.progressInactive]} />
        <View style={[styles.progressStep, styles.progressInactive]} />
        <View style={[styles.progressStep, styles.progressInactive]} />
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>ID Verification</Text>
        <Text style={styles.subtitle}>Take a clear photo of your government-issued ID</Text>

        {/* ID Photo Preview */}
        <TouchableOpacity style={styles.photoContainer} onPress={takePhoto}>
          {idPhoto ? (
            <Image source={{ uri: idPhoto }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderIcon}>📷</Text>
              <Text style={styles.photoPlaceholderText}>Tap to take photo of ID</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.photoHint}>
          Make sure the ID is clearly visible and all details are readable
        </Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={[styles.textInput, errors.email && styles.inputError]}
            placeholder="Enter your email"
            value={email}
            onChangeText={(text) => updateField('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            // Web-specific props
            {...Platform.select({
              web: {
                type: 'email',
                style: {
                  ...styles.webTextInput,
                  ...(errors.email ? styles.inputError : {}),
                },
                onChange: (e) => updateField('email', e.target.value)
              }
            })}
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
        </View>

        {/* Phone Number Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={[styles.textInput, errors.phoneNumber && styles.inputError]}
            placeholder="Enter your phone number"
            value={phoneNumber}
            onChangeText={(text) => updateField('phoneNumber', text)}
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoCorrect={false}
            // Web-specific props
            {...Platform.select({
              web: {
                type: 'tel',
                style: {
                  ...styles.webTextInput,
                  ...(errors.phoneNumber ? styles.inputError : {}),
                },
                onChange: (e) => updateField('phoneNumber', e.target.value)
              }
            })}
          />
          {errors.phoneNumber ? <Text style={styles.errorText}>{errors.phoneNumber}</Text> : null}
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={[styles.textInput, styles.passwordInput, errors.password && styles.inputError]}
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => updateField('password', text)}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              // Web-specific props
              {...Platform.select({
                web: {
                  type: showPassword ? 'text' : 'password',
                  style: {
                    ...styles.webTextInput,
                    ...styles.webPasswordInput,
                    ...(errors.password ? styles.inputError : {}),
                  },
                  onChange: (e) => updateField('password', e.target.value)
                }
              })}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeIconText}>{showPassword ? 'HIDE' : 'SHOW'}</Text>
            </TouchableOpacity>
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          <Text style={styles.passwordHint}>
            Password must be at least 8 characters with uppercase, lowercase, number, and special character
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity 
          style={[styles.continueButton, (!idPhoto || !email.trim() || !phoneNumber.trim() || !password.trim()) && styles.continueButtonDisabled]}
          disabled={!idPhoto || !email.trim() || !phoneNumber.trim() || !password.trim()}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
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
  photoContainer: {
    height: 200,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
    marginBottom: 12,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  photoPlaceholderText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '600',
  },
  photoHint: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F5F5F5',
    width: '100%',
    minHeight: 48,
  },
  // Web-specific TextInput styling
  webTextInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F5F5F5',
    width: '100%',
    minHeight: 48,
    outline: 'none',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    lineHeight: 'normal',
    boxSizing: 'border-box',
  },
  webPasswordInput: {
    paddingRight: 50, // Make room for the eye icon on web
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
    zIndex: 10,
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
    marginTop: 6,
    fontStyle: 'italic',
  },
  continueButton: {
    backgroundColor: '#2f40fcff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#2f40fcff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  continueButtonDisabled: {
    backgroundColor: '#CCCCCC',
    shadowColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default SignUp1;