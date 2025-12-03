import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const BApp = ({ navigation }) => {
  const [showWelcome, setShowWelcome] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef(null);
  const autoScrollTimer = useRef(null);
  const signupScale = useRef(new Animated.Value(1)).current;
  const loginScale = useRef(new Animated.Value(1)).current;
  const isScrolling = useRef(false);

  const slides = [
    {
      // Use require for local images instead of uri
      image: require('./Gemini_Generated_Image_6cjzxg6cjzxg6cjz.png'),
      title: 'safe and secure money transfer'
    },
    {
      image: require('./Gemini_Generated_Image_8ni7f98ni7f98ni7.png'),
      title: 'keep track of your expenses easily'
    },
    {
      image: require('./Gemini_Generated_Image_3px47r3px47r3px4.png'),
      title: 'simple, cheap and convenient'
    }
  ];

  // Welcome screen animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        setShowWelcome(false);
      });
    }, 2500);
  }, []);

  // Auto-scroll carousel - runs continuously
  useEffect(() => {
    if (!showWelcome) {
      autoScrollTimer.current = setInterval(() => {
        if (!isScrolling.current) {
          setCurrentSlide(prevSlide => {
            const nextSlide = prevSlide === slides.length - 1 ? 0 : prevSlide + 1;
            scrollViewRef.current?.scrollTo({
              x: nextSlide * width,
              animated: true,
            });
            return nextSlide;
          });
        }
      }, 3000);
    }
    
    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [showWelcome]);

  const handleSignupPressIn = () => {
    Animated.spring(signupScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleSignupPressOut = () => {
    Animated.spring(signupScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleLoginPressIn = () => {
    Animated.spring(loginScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleLoginPressOut = () => {
    Animated.spring(loginScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleSignupPress = () => {
    handleSignupPressOut();
    navigation?.navigate('PermissionPage');
  };

  const handleLoginPress = () => {
    handleLoginPressOut();
    navigation?.navigate('LogIn');
  };

  const handleScrollBeginDrag = () => {
    isScrolling.current = true;
  };

  const handleScrollEndDrag = () => {
    isScrolling.current = false;
  };

  const handleMomentumScrollEnd = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / slideSize);
    setCurrentSlide(index);
    isScrolling.current = false;
  };

  const handleDotPress = (index) => {
    isScrolling.current = true;
    scrollViewRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
    setCurrentSlide(index);
    setTimeout(() => {
      isScrolling.current = false;
    }, 300);
  };

  // Main content component
  const Content = () => (
    <View style={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <Image
            source={require('./billo-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Slider */}
      <View style={styles.sliderContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {slides.map((slide, index) => (
            <View key={index} style={styles.slide}>
              <View style={styles.imageContainer}>
                <Image 
                  source={slide.image}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.slideTitle}>{slide.title}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Dots Indicator */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                currentSlide === index && styles.dotActive
              ]}
              onPress={() => handleDotPress(index)}
            />
          ))}
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <Animated.View style={{ transform: [{ scale: signupScale }] }}>
          <TouchableOpacity 
            style={styles.signupButton}
            activeOpacity={0.9}
            onPressIn={handleSignupPressIn}
            onPressOut={handleSignupPress}
          >
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View style={{ transform: [{ scale: loginScale }] }}>
          <TouchableOpacity 
            style={styles.loginButton}
            activeOpacity={0.9}
            onPressIn={handleLoginPressIn}
            onPressOut={handleLoginPress}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );

  // Welcome screen (unchanged)
  if (showWelcome) {
    return (
      <View style={styles.welcomeContainer}>
        <Animated.Text style={[styles.welcomeText, { opacity: fadeAnim }]}>
          Billo
        </Animated.Text>
      </View>
    );
  }

  // Main render with conditional web/native scrolling
  return Platform.OS === 'web' ? (
    // Web version with HTML div for scrolling
    <div style={styles.webContainer}>
      <Content />
    </div>
  ) : (
    // Native version (unchanged structure)
    <View style={styles.container}>
      <Content />
    </View>
  );
};

const styles = StyleSheet.create({
  // Web-specific container
  webContainer: {
    height: '100vh',
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 430,
    margin: '0 auto',
    width: '100%',
  },
  // Original container styles
  welcomeContainer: {
    flex: 1,
    backgroundColor: '#2f40fcff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        height: '100vh',
        width: '100%',
      },
    }),
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 72,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    maxWidth: 430,
    alignSelf: 'center',
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    minHeight: Platform.OS === 'web' ? '100vh' : undefined,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 24,
    paddingTop: Platform.select({
      ios: 48,
      android: 24,
      web: 24,
    }),
  },
  logo: {
    width: 48,
    height: 48,
    backgroundColor: '#2f40fcff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  sliderContainer: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 400, // Ensure slider has minimum height
  },
  scrollView: {
    flexGrow: 0,
  },
  slide: {
    width: width > 430 ? 430 : width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    minHeight: 400,
  },
  imageContainer: {
    width: 280,
    height: 280,
    backgroundColor: '#E6F2FF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  image: {
    width: '80%',
    height: '80%',
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 6,
  },
  dotActive: {
    width: 32,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2f40fcff',
  },
  buttonsContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.select({
      ios: 48,
      android: 24,
      web: 48,
    }),
    paddingTop: 20,
  },
  signupButton: {
    backgroundColor: '#2f40fcff',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#2f40fcff',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loginButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: '#2f40fcff',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#2f40fcff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default BApp;