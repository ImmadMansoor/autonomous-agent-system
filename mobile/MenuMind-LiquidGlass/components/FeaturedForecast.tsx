import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

const MATRIX_DOTS = Array.from({ length: 56 }, (_, index) => ({
  id: `forecast-dot-${index}`,
  left: (index % 8) * 16,
  top: Math.floor(index / 8) * 16,
  opacity: 0.08 + (index % 4) * 0.035,
}));

export function FeaturedForecast() {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIRA3tCeKn6zhLCO0tWxQAvEvfRAifPWh0CP2-f7fdlBElIdki9tcNCQD6a_dAibfV7QxFM2dOtEpWMjB5YuByFRxgNwOeUR2ftGs7afFydhs7VcpnPqfj2wVIJ1g_p9N92QNsrXzsgIJgZoaFFiKds606nB1sxwgUpdw3wI2iAI-v65d3yVb5D3B_Zi-cawJ2zHhkCw56YWZyKRQ8iTkSikxbr5nWE2TC5-3uVeKC3xnZVRx0FjQx9h2u5Wl8rPEHKnazVMKX_Rvn' }}
        style={styles.imageBackground}
        imageStyle={styles.imageStyle}
      >
        <View style={styles.overlay}>
          <View style={styles.matrixPattern} pointerEvents="none">
            {MATRIX_DOTS.map((dot) => (
              <View
                key={dot.id}
                style={[styles.matrixDot, { left: dot.left, top: dot.top, opacity: dot.opacity }]}
              />
            ))}
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>Unlocking the{'\n'}AI Advantage</Text>
            <Text style={styles.description}>
              Predictive models are optimizing inventory for a forecasted <Text style={styles.highlight}>12.4% revenue lift</Text> this weekend.
            </Text>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>FULL FORECAST</Text>
              <MaterialIcons name="arrow-forward" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 104, 95, 0.7)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  content: {
    gap: 12,
    zIndex: 1,
  },
  matrixPattern: {
    position: 'absolute',
    right: 12,
    top: 18,
    width: 128,
    height: 112,
    opacity: 0.58,
  },
  matrixDot: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#ffffff',
  },
  title: {
    fontFamily: 'Doto_800ExtraBold',
    fontSize: 24,
    color: '#ffffff',
    lineHeight: 30,
    letterSpacing: 0,
  },
  description: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 22,
  },
  highlight: {
    color: Colors.light.secondaryFixed,
    fontWeight: '700',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 24,
    gap: 8,
  },
  buttonText: {
    fontFamily: 'Doto_700Bold',
    fontSize: 12,
    color: '#ffffff',
    letterSpacing: 0,
  },
});
