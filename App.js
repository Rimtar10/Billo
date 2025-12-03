import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Import all screens from both navigation structures
import BApp from './BilloApp';
import PermissionPage from './PermissionPage';
import SignUp1 from './SignUp1';
import SignUp2 from './SignUp2';
import SignUp3 from './SignUp3';
import SignUp4 from './SignUp4';
import LogIn from './LogIn';
import ForgotPassword from './ForgotPassword';
import PinVerification from './PinVerification';
import BilloApp from './Home'; // This is the main Home/BilloApp from first navigation
import Send from './Send';
import Transactions from './Transition';
import Receive from './Receive';
import QRCodeReader from './QRcode';
import Menu from './HomeMenu';
import BalanceTransactions from './ActivityBalance';
import Account from './Account';
import Home from './Home'; // If this is different from BilloApp, rename appropriately

const Stack = createNativeStackNavigator();
const PERSISTENCE_KEY = 'NAVIGATION_STATE';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState();
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const navigationRef = useRef(null);

  // Function to check login status
  const checkLoginStatus = async () => {
    const storedCredentials = await AsyncStorage.getItem('userCredentials');
    if (storedCredentials) {
      const credentials = JSON.parse(storedCredentials);
      if (credentials.phoneNumber && credentials.password) {
        console.log('[App.js] User credentials found, setting userLoggedIn to true');
        setUserLoggedIn(true);
        return true;
      }
    }
    console.log('[App.js] No valid credentials found, setting userLoggedIn to false');
    setUserLoggedIn(false);
    return false;
  };

  // Load saved navigation state
  useEffect(() => {
    const restoreState = async () => {
      try {
        const savedStateString = await AsyncStorage.getItem(PERSISTENCE_KEY);
        const state = savedStateString ? JSON.parse(savedStateString) : undefined;

        if (state !== undefined) {
          setInitialState(state);
        }
      } catch (e) {
        console.warn('[App.js] Failed to restore navigation state:', e);
      }
    };

    restoreState();
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const isLoggedIn = await checkLoginStatus();
        
        // Navigate to appropriate initial screen after checking login status
        setTimeout(() => {
          if (navigationRef.current) {
            const initialRoute = isLoggedIn ? 'PinVerification' : 'BApp';
            console.log('[App.js] Navigating to initial route:', initialRoute);
            navigationRef.current.reset({
              index: 0,
              routes: [{ name: initialRoute }],
            });
          }
        }, 100); // Small delay to ensure navigation is ready
      } finally {
        setIsReady(true);
      }
    };

    if (!isReady) {
      initializeApp();
    }
  }, [isReady]);

  // Re-check login status when app comes to foreground
  useEffect(() => {
    const unsubscribe = navigationRef.current?.addListener('state', async () => {
      await checkLoginStatus();
    });

    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    console.log('[App.js] ==================== handleLogin CALLED ====================');
    console.log('[App.js] Current userLoggedIn state:', userLoggedIn);
    console.log('[App.js] Setting userLoggedIn to TRUE');
    setUserLoggedIn(true);
    console.log('[App.js] Checking navigationRef...');
    console.log('[App.js] navigationRef.current exists:', !!navigationRef.current);
    
    if (navigationRef.current) {
      console.log('[App.js] ➡️ Resetting navigation to BilloApp screen (main home)');
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: 'BilloApp' }], // Changed from 'Home' to 'BilloApp'
      });
      console.log('[App.js] ✅ Navigation reset completed');
    } else {
      console.log('[App.js] ❌ navigationRef.current is null - cannot navigate!');
    }
    console.log('[App.js] ==================== handleLogin COMPLETED ====================');
  };

  const handleLogout = async () => {
    console.log('[App.js] ==================== LOGOUT STARTED ====================');
    console.log('[App.js] handleLogout called');
    try {
      // DON'T delete userCredentials - we only want to log out, not delete the account
      console.log('[App.js] Keeping userCredentials in AsyncStorage (logout, not delete account)');
      
      console.log('[App.js] Removing NAVIGATION_STATE from AsyncStorage');
      await AsyncStorage.removeItem(PERSISTENCE_KEY);
      
      console.log('[App.js] Setting userLoggedIn to false');
      setUserLoggedIn(false);
      
      console.log('[App.js] Forcing immediate navigation to BApp');
      if (navigationRef.current) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'BApp' }],
        });
        console.log('[App.js] ✅ Navigation reset to BApp completed');
      } else {
        console.log('[App.js] ❌ navigationRef.current is null');
      }
      
      console.log('[App.js] ==================== LOGOUT COMPLETED ====================');
      return true;
    } catch (error) {
      console.error('[App.js] ❌ Error logging out:', error);
      return false;
    }
  };

  const handleDeleteAccount = async () => {
    console.log('[App.js] handleDeleteAccount called');
    try {
      // Get user data first to get userId
      console.log('[App.js] Getting userData from AsyncStorage');
      const userData = await AsyncStorage.getItem('userData');
      let userId = null;
      if (userData) {
        const parsed = JSON.parse(userData);
        userId = parsed.userId;
        console.log('[App.js] Found userId:', userId);
      }

      // Delete all user data
      console.log('[App.js] Deleting all user data from AsyncStorage');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('userCredentials');
      await AsyncStorage.removeItem('balances');
      await AsyncStorage.removeItem('transactions');
      await AsyncStorage.removeItem('currentSignUpData');
      await AsyncStorage.removeItem(PERSISTENCE_KEY);
      if (userId) {
        await AsyncStorage.removeItem(userId);
      }
      
      console.log('[App.js] Setting userLoggedIn to false');
      setUserLoggedIn(false);
      
      console.log('[App.js] Forcing immediate navigation to BApp');
      if (navigationRef.current) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'BApp' }],
        });
      }
      
      console.log('[App.js] Delete account completed successfully');
      return true;
    } catch (error) {
      console.error('[App.js] Error deleting account:', error);
      return false;
    }
  };

  const handleNavigationStateChange = async (state) => {
    await AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const activeElement = document.activeElement;
      if (activeElement && typeof activeElement.blur === 'function') {
        activeElement.blur();
      }
    }
  };

  if (!isReady) {
    return null;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      initialState={initialState}
      onStateChange={handleNavigationStateChange}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Authentication Flow Screens */}
        <Stack.Screen name="BApp" component={BApp} />
        <Stack.Screen name="PermissionPage" component={PermissionPage} />
        <Stack.Screen name="SignUp1" component={SignUp1} />
        <Stack.Screen name="SignUp2" component={SignUp2} />
        <Stack.Screen name="SignUp3" component={SignUp3} />
        <Stack.Screen 
          name="SignUp4" 
          component={SignUp4}
          initialParams={{ onLogin: handleLogin }}
        />
        <Stack.Screen 
          name="LogIn" 
          component={LogIn}
          initialParams={{ onLogin: handleLogin }}
        />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="PinVerification" component={PinVerification} />
        
        {/* Main App Screens (after login) */}
        <Stack.Screen 
          name="BilloApp" 
          component={BilloApp}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={Home}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Send" 
          component={Send}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Receive" 
          component={Receive}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Transactions" 
          component={Transactions}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="QRcode" 
          component={QRCodeReader}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="HomeMenu" 
          component={Menu}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ActivityBalance" 
          component={BalanceTransactions}
          options={{ headerShown: false }}
        />
        
        {/* Account Screen with handlers */}
        <Stack.Screen name="Account">
          {(props) => (
            <Account
              {...props}
              onLogout={handleLogout}
              onDeleteAccount={handleDeleteAccount}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}


/*import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import BApp from './BilloApp';
import PermissionPage from './PermissionPage';
import SignUp1 from './SignUp1';
import SignUp2 from './SignUp2';
import SignUp3 from './SignUp3';
import SignUp4 from './SignUp4';
import LogIn from './LogIn';
import Home from './Home';
import Account from './Account';
import PinVerification from './PinVerification';
import ForgotPassword from './ForgotPassword';

const Stack = createStackNavigator();

const PERSISTENCE_KEY = 'NAVIGATION_STATE';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState();
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const navigationRef = useRef(null);

  // Function to check login status
  const checkLoginStatus = async () => {
    const storedCredentials = await AsyncStorage.getItem('userCredentials');
    if (storedCredentials) {
      const credentials = JSON.parse(storedCredentials);
      if (credentials.phoneNumber && credentials.password) {
        console.log('[App.js] User credentials found, setting userLoggedIn to true');
        setUserLoggedIn(true);
        return true;
      }
    }
    console.log('[App.js] No valid credentials found, setting userLoggedIn to false');
    setUserLoggedIn(false);
    return false;
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const isLoggedIn = await checkLoginStatus();
        
        // Navigate to appropriate initial screen after checking login status
        setTimeout(() => {
          if (navigationRef.current) {
            const initialRoute = isLoggedIn ? 'PinVerification' : 'BApp';
            console.log('[App.js] Navigating to initial route:', initialRoute);
            navigationRef.current.reset({
              index: 0,
              routes: [{ name: initialRoute }],
            });
          }
        }, 100); // Small delay to ensure navigation is ready
      } finally {
        setIsReady(true);
      }
    };

    if (!isReady) {
      initializeApp();
    }
  }, [isReady]);

  // Re-check login status when app comes to foreground
  useEffect(() => {
    const unsubscribe = navigationRef.current?.addListener('state', async () => {
      await checkLoginStatus();
    });

    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    console.log('[App.js] ==================== handleLogin CALLED ====================');
    console.log('[App.js] Current userLoggedIn state:', userLoggedIn);
    console.log('[App.js] Setting userLoggedIn to TRUE');
    setUserLoggedIn(true);
    console.log('[App.js] Checking navigationRef...');
    console.log('[App.js] navigationRef.current exists:', !!navigationRef.current);
    
    if (navigationRef.current) {
      console.log('[App.js] ➡️ Resetting navigation to Home screen');
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
      console.log('[App.js] ✅ Navigation reset completed');
    } else {
      console.log('[App.js] ❌ navigationRef.current is null - cannot navigate!');
    }
    console.log('[App.js] ==================== handleLogin COMPLETED ====================');
  };

  const handleLogout = async () => {
    console.log('[App.js] ==================== LOGOUT STARTED ====================');
    console.log('[App.js] handleLogout called');
    try {
      // DON'T delete userCredentials - we only want to log out, not delete the account
      // Users should be able to log back in with the same credentials
      console.log('[App.js] Keeping userCredentials in AsyncStorage (logout, not delete account)');
      
      console.log('[App.js] Removing NAVIGATION_STATE from AsyncStorage');
      await AsyncStorage.removeItem(PERSISTENCE_KEY);
      
      console.log('[App.js] Setting userLoggedIn to false');
      setUserLoggedIn(false);
      
      console.log('[App.js] Forcing immediate navigation to BApp');
      if (navigationRef.current) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'BApp' }],
        });
        console.log('[App.js] ✅ Navigation reset to BApp completed');
      } else {
        console.log('[App.js] ❌ navigationRef.current is null');
      }
      
      console.log('[App.js] ==================== LOGOUT COMPLETED ====================');
      return true;
    } catch (error) {
      console.error('[App.js] ❌ Error logging out:', error);
      return false;
    }
  };

  const handleDeleteAccount = async () => {
    console.log('[App.js] handleDeleteAccount called');
    try {
      console.log('[App.js] Getting userData from AsyncStorage');
      const userData = await AsyncStorage.getItem('userData');
      let userId = null;
      if (userData) {
        const parsed = JSON.parse(userData);
        userId = parsed.userId;
        console.log('[App.js] Found userId:', userId);
      }

      console.log('[App.js] Deleting all user data from AsyncStorage');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('userCredentials');
      await AsyncStorage.removeItem('balances');
      await AsyncStorage.removeItem('transactions');
      await AsyncStorage.removeItem('currentSignUpData');
      await AsyncStorage.removeItem(PERSISTENCE_KEY);
      if (userId) {
        await AsyncStorage.removeItem(userId);
      }
      
      console.log('[App.js] Setting userLoggedIn to false');
      setUserLoggedIn(false);
      
      console.log('[App.js] Forcing immediate navigation to BApp');
      if (navigationRef.current) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'BApp' }],
        });
      }
      
      console.log('[App.js] Delete account completed successfully');
      return true;
    } catch (error) {
      console.error('[App.js] Error deleting account:', error);
      return false;
    }
  };

  const handleNavigationStateChange = async (state) => {
    await AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const activeElement = document.activeElement;
      if (activeElement && typeof activeElement.blur === 'function') {
        activeElement.blur();
      }
    }
  };

  if (!isReady) {
    return null;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      initialState={initialState}
      onStateChange={handleNavigationStateChange}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="BApp" component={BApp} />
        <Stack.Screen name="PermissionPage" component={PermissionPage} />
        <Stack.Screen name="SignUp1" component={SignUp1} />
        <Stack.Screen name="SignUp2" component={SignUp2} />
        <Stack.Screen name="SignUp3" component={SignUp3} />
        <Stack.Screen 
          name="SignUp4" 
          component={SignUp4}
          initialParams={{ onLogin: handleLogin }}
        />
        <Stack.Screen 
          name="LogIn" 
          component={LogIn}
          initialParams={{ onLogin: handleLogin }}
        />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="PinVerification" component={PinVerification} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Account">
          {(props) => (
            <Account
              {...props}
              onLogout={handleLogout}
              onDeleteAccount={handleDeleteAccount}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}*/