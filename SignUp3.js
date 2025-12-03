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

const SignUp3 = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    placeOfBirth: '',
    dateOfBirth: '',
    gender: '',
    countryOfResidence: '',
    nationality: '',
    occupation: '',
  });
  const [errors, setErrors] = useState({});

  // Gender options
  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
    { label: 'Prefer not to say', value: 'prefer_not_to_say' },
  ];

  // Validation functions
  const validateDateOfBirth = (dateString) => {
    // Check format MM/DD/YYYY
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
    if (!dateRegex.test(dateString)) {
      return 'Please enter date in MM/DD/YYYY format';
    }

    const [month, day, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    
    // Check if date is valid
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return 'Please enter a valid date';
    }

    // Check if user is at least 18 years old
    const today = new Date();
    const age = today.getFullYear() - year - (today.getMonth() < month - 1 || (today.getMonth() === month - 1 && today.getDate() < day) ? 1 : 0);
    
    if (age < 18) {
      return 'You must be at least 18 years old to sign up';
    }

    // Check if date is not in the future
    if (date > today) {
      return 'Date of birth cannot be in the future';
    }

    return null;
  };

  const validateTextField = (value, fieldName, minLength = 2) => {
    if (!value.trim()) {
      return `${fieldName} is required`;
    }
    if (value.trim().length < minLength) {
      return `${fieldName} must be at least ${minLength} characters`;
    }
    return null;
  };

  const validateForm = () => {
    const newErrors = {};

    const placeOfBirthError = validateTextField(formData.placeOfBirth, 'Place of birth');
    if (placeOfBirthError) newErrors.placeOfBirth = placeOfBirthError;

    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const dateError = validateDateOfBirth(formData.dateOfBirth.trim());
      if (dateError) newErrors.dateOfBirth = dateError;
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }

    const countryError = validateTextField(formData.countryOfResidence, 'Country of residence');
    if (countryError) newErrors.countryOfResidence = countryError;

    const nationalityError = validateTextField(formData.nationality, 'Nationality');
    if (nationalityError) newErrors.nationality = nationalityError;

    const occupationError = validateTextField(formData.occupation, 'Occupation');
    if (occupationError) newErrors.occupation = occupationError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Load saved data when component mounts
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('currentSignUpData');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setFormData(prev => ({
            ...prev,
            placeOfBirth: parsedData.placeOfBirth || '',
            dateOfBirth: parsedData.dateOfBirth || '',
            gender: parsedData.gender || '',
            countryOfResidence: parsedData.countryOfResidence || '',
            nationality: parsedData.nationality || '',
            occupation: parsedData.occupation || '',
          }));
        }
      } catch (error) {
        console.log('No previous data found');
      }
    };

    loadSavedData();
  }, []);

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const isFormValid = () => {
    return formData.placeOfBirth && 
           formData.dateOfBirth && 
           formData.gender && 
           formData.countryOfResidence && 
           formData.nationality && 
           formData.occupation;
  };

  const handleContinue = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Get data from navigation params, with AsyncStorage backup
      const navData = route.params?.userData || {};
      
      // Also try to load from AsyncStorage as backup
      let backupData = {};
      try {
        const storedData = await AsyncStorage.getItem('currentSignUpData');
        if (storedData) {
          backupData = JSON.parse(storedData);
        }
      } catch (error) {
        console.log('[SignUp3] No backup data found in AsyncStorage');
      }
      
      // Use navigation params data, fall back to AsyncStorage data if missing
      const previousData = Object.keys(navData).length > 0 ? navData : backupData;
      
      // Combine data from previous steps with current form data
      const userData = {
        ...previousData,
        ...formData,
        step: 3, // Track current step
        lastUpdated: new Date().toISOString(),
      };

      // ✅ Save to AsyncStorage before navigating
      await AsyncStorage.setItem('currentSignUpData', JSON.stringify(userData));
      
      console.log('[SignUp3] Previous data from navigation:', navData);
      console.log('[SignUp3] Backup data from AsyncStorage:', backupData);
      console.log('[SignUp3] Combined data saved at step 3:', userData);

      // ✅ Navigate to SignUp4 (not SignUpStep4)
      navigation.navigate('SignUp4', { 
        userData 
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save your data. Please try again.');
    }
  };

  const RadioButton = ({ label, value, selected, onPress }) => (
    <TouchableOpacity style={styles.radioContainer} onPress={onPress}>
      <View style={styles.radioCircle}>
        {selected && <View style={styles.radioSelected} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  // Custom TextInput component that works on both web and native
  const CustomTextInput = ({ 
    value, 
    onChangeText, 
    placeholder, 
    error, 
    style, 
    ...props 
  }) => {
    if (Platform.OS === 'web') {
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder={placeholder}
          style={{
            ...styles.webTextInput,
            ...(error ? styles.inputError : {}),
            ...style,
          }}
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
        <Text style={styles.headerTitle}>Step 3 of 4</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressStep, styles.progressActive]} />
        <View style={[styles.progressStep, styles.progressActive]} />
        <View style={[styles.progressStep, styles.progressActive]} />
        <View style={[styles.progressStep, styles.progressInactive]} />
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Additional Information</Text>
        <Text style={styles.subtitle}>Please provide the following details</Text>

        {/* Place of Birth */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Place of Birth</Text>
          <CustomTextInput
            value={formData.placeOfBirth}
            onChangeText={(text) => {
              updateFormData('placeOfBirth', text);
              if (errors.placeOfBirth) {
                setErrors(prev => ({ ...prev, placeOfBirth: '' }));
              }
            }}
            placeholder="Enter your place of birth"
          />
          {errors.placeOfBirth ? <Text style={styles.errorText}>{errors.placeOfBirth}</Text> : null}
        </View>

        {/* Date of Birth */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date of Birth</Text>
          <CustomTextInput
            value={formData.dateOfBirth}
            onChangeText={(text) => {
              updateFormData('dateOfBirth', text);
              if (errors.dateOfBirth) {
                setErrors(prev => ({ ...prev, dateOfBirth: '' }));
              }
            }}
            placeholder="Enter your date of birth (MM/DD/YYYY)"
          />
          {errors.dateOfBirth ? <Text style={styles.errorText}>{errors.dateOfBirth}</Text> : null}
        </View>

        {/* Gender */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.radioGroup}>
            {genderOptions.map((option) => (
              <RadioButton
                key={option.value}
                label={option.label}
                value={option.value}
                selected={formData.gender === option.value}
                onPress={() => {
                  updateFormData('gender', option.value);
                  if (errors.gender) {
                    setErrors(prev => ({ ...prev, gender: '' }));
                  }
                }}
              />
            ))}
          </View>
          {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
        </View>

        {/* Country of Residence */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Country of Residence</Text>
          <CustomTextInput
            value={formData.countryOfResidence}
            onChangeText={(text) => {
              updateFormData('countryOfResidence', text);
              if (errors.countryOfResidence) {
                setErrors(prev => ({ ...prev, countryOfResidence: '' }));
              }
            }}
            placeholder="Enter your country of residence"
          />
          {errors.countryOfResidence ? <Text style={styles.errorText}>{errors.countryOfResidence}</Text> : null}
        </View>

        {/* Nationality */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nationality</Text>
          <CustomTextInput
            value={formData.nationality}
            onChangeText={(text) => {
              updateFormData('nationality', text);
              if (errors.nationality) {
                setErrors(prev => ({ ...prev, nationality: '' }));
              }
            }}
            placeholder="Enter your nationality"
          />
          {errors.nationality ? <Text style={styles.errorText}>{errors.nationality}</Text> : null}
        </View>

        {/* Occupation */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Occupation</Text>
          <CustomTextInput
            value={formData.occupation}
            onChangeText={(text) => {
              updateFormData('occupation', text);
              if (errors.occupation) {
                setErrors(prev => ({ ...prev, occupation: '' }));
              }
            }}
            placeholder="Enter your occupation"
          />
          {errors.occupation ? <Text style={styles.errorText}>{errors.occupation}</Text> : null}
        </View>

        {/* Continue Button */}
        <TouchableOpacity 
          style={[styles.continueButton, !isFormValid() && styles.continueButtonDisabled]}
          disabled={!isFormValid()}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
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
  inputContainer: {
    marginBottom: 20,
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
  // Radio Button Styles
  radioGroup: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 8,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2f40fcff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#2f40fcff',
  },
  radioLabel: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: '#2f40fcff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
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

export default SignUp3;