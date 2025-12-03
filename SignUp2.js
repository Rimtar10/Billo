import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from "react-native-safe-area-context";

const SignUp2 = ({ navigation, route }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState({});

  // Validation functions
  const validateName = (name, fieldName) => {
    if (!name.trim()) {
      return `${fieldName} is required`;
    }
    
    // Check length (2-50 characters)
    if (name.trim().length < 2) {
      return `${fieldName} must be at least 2 characters`;
    }
    if (name.trim().length > 50) {
      return `${fieldName} must be less than 50 characters`;
    }
    
    // Check for only letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    if (!nameRegex.test(name.trim())) {
      return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
    }
    
    return null;
  };

  const validateForm = () => {
    const newErrors = {};

    const firstNameError = validateName(formData.firstName, 'First name');
    if (firstNameError) newErrors.firstName = firstNameError;

    const lastNameError = validateName(formData.lastName, 'Last name');
    if (lastNameError) newErrors.lastName = lastNameError;

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
          setFormData(prev => ({
            ...prev,
            firstName: parsedData.firstName || '',
            lastName: parsedData.lastName || '',
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
    return formData.firstName && formData.lastName;
  };

  // ✅ Save data to AsyncStorage before navigating
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
        console.log('[SignUp2] No backup data found in AsyncStorage');
      }
      
      // Use navigation params data, fall back to AsyncStorage data if missing
      const previousData = Object.keys(navData).length > 0 ? navData : backupData;
      
      const userData = {
        ...previousData,
        ...formData,
        step: 2,
        lastUpdated: new Date().toISOString(),
      };

      await AsyncStorage.setItem('currentSignUpData', JSON.stringify(userData));
      console.log('[SignUp2] Previous data from navigation:', navData);
      console.log('[SignUp2] Backup data from AsyncStorage:', backupData);
      console.log('[SignUp2] Combined data saved at step 2:', userData);

      navigation.navigate('SignUp3', { userData });
    } catch (error) {
      console.error('Error saving data:', error);
      Alert.alert('Error', 'Failed to save your data. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Step 2 of 4</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressStep, styles.progressActive]} />
          <View style={[styles.progressStep, styles.progressActive]} />
          <View style={[styles.progressStep, styles.progressInactive]} />
          <View style={[styles.progressStep, styles.progressInactive]} />
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Personal Information</Text>
          <Text style={styles.subtitle}>
            Enter your personal details
          </Text>

          {/* Personal Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Full Name</Text>
            
            {/* First Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={[styles.input, errors.firstName && styles.inputError]}
                placeholder="Enter your first name"
                placeholderTextColor="#999999"
                value={formData.firstName}
                onChangeText={(text) => {
                  updateFormData('firstName', text);
                  if (errors.firstName) {
                    setErrors(prev => ({ ...prev, firstName: '' }));
                  }
                }}
              />
              {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
            </View>

            {/* Last Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={[styles.input, errors.lastName && styles.inputError]}
                placeholder="Enter your last name"
                placeholderTextColor="#999999"
                value={formData.lastName}
                onChangeText={(text) => {
                  updateFormData('lastName', text);
                  if (errors.lastName) {
                    setErrors(prev => ({ ...prev, lastName: '' }));
                  }
                }}
              />
              {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
            </View>
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
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
  inputContainer: {
    marginBottom: 16,
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
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 6,
  },
  continueButton: {
    backgroundColor: '#2f40fcff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
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
  },
  backButtonText: {
    color: '#666666',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default SignUp2;